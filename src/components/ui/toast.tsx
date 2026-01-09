import * as React from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border p-4 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-background border-border text-foreground",
        success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
        error: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100",
        info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>;

export interface ToastProps extends VariantProps<typeof toastVariants> {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
}

interface ToastContextValue {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

function useToastContext() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("Toast components must be used within <ToastProvider />");
  }
  return ctx;
}

export function useToast() {
  const { addToast, removeToast } = useToastContext();

  const toast = React.useCallback(
    (props: Omit<ToastProps, "id">) => {
      return addToast(props);
    },
    [addToast]
  );

  return {
    toast,
    success: (title: string, description?: string, duration?: number) =>
      toast({ variant: "success", title, description, duration }),
    error: (title: string, description?: string, duration?: number) =>
      toast({ variant: "error", title, description, duration }),
    warning: (title: string, description?: string, duration?: number) =>
      toast({ variant: "warning", title, description, duration }),
    info: (title: string, description?: string, duration?: number) =>
      toast({ variant: "info", title, description, duration }),
    dismiss: removeToast,
  };
}

const Toast = React.forwardRef<
  HTMLDivElement,
  ToastProps & React.HTMLAttributes<HTMLDivElement>
>(({ id, className, variant, title, description, onClose, ...props }, ref) => {
  const iconMap: Record<ToastVariant, React.ReactNode> = {
    default: <Info className="h-5 w-5" />,
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const icon = variant ? iconMap[variant] : iconMap.default;

  return (
    <div
      ref={ref}
      data-slot="toast"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold leading-none">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90 leading-snug">{description}</div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
});
Toast.displayName = "Toast";

function getPortalContainer() {
  if (typeof document === "undefined") return null;
  return document.body;
}

type ToastProviderProps = {
  children: React.ReactNode;
  maxToasts?: number;
};

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastProps = {
        ...toast,
        id,
        duration: toast.duration ?? 5000,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        return updated.slice(-maxToasts);
      });

      return id;
    },
    [maxToasts]
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
ToastProvider.displayName = "ToastProvider";

type ToastViewportProps = {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
};

function ToastViewport({ toasts, onRemove }: ToastViewportProps) {
  const container = getPortalContainer();
  if (!container) return null;

  return createPortal(
    <div
      data-slot="toast-viewport"
      className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:right-0 sm:top-0 sm:max-w-[420px]"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    container
  );
}
ToastViewport.displayName = "ToastViewport";

type ToastItemProps = {
  toast: ToastProps;
  onRemove: (id: string) => void;
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={cn(
        "animate-in slide-in-from-top-full fade-in duration-300",
        isExiting && "animate-out slide-out-to-right-full fade-out duration-300"
      )}
    >
      <Toast {...toast} onClose={handleClose} />
    </div>
  );
}
ToastItem.displayName = "ToastItem";

export { Toast, toastVariants };

/*
Usage Example:

1. Wrap your app with ToastProvider:

import { ToastProvider } from "@/components/ui/toast"

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  )
}

2. Use the useToast hook in your components:

import { useToast } from "@/components/ui/toast"

function MyComponent() {
  const { toast, success, error, warning, info } = useToast()

  return (
    <div>
      <button onClick={() => success("Success!", "Operation completed successfully")}>
        Show Success
      </button>

      <button onClick={() => error("Error!", "Something went wrong")}>
        Show Error
      </button>

      <button onClick={() => warning("Warning!", "Please be careful")}>
        Show Warning
      </button>

      <button onClick={() => info("Info", "Here's some information")}>
        Show Info
      </button>

      <button onClick={() => toast({
        variant: "success",
        title: "Custom Toast",
        description: "With custom duration",
        duration: 10000
      })}>
        Custom Toast
      </button>
    </div>
  )
}

3. To dismiss a toast programmatically:

const { toast, dismiss } = useToast()

const id = toast({ title: "Loading...", duration: 0 }) // duration: 0 prevents auto-dismiss
// Later...
dismiss(id)
*/
