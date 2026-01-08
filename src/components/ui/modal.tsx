import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  children: React.ReactNode;
};

function getPortalContainer() {
  if (typeof document === "undefined") return null;
  return document.body;
}

function useLockBodyScroll(locked: boolean) {
  React.useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [locked]);
}

const Modal = ({
  open,
  onOpenChange,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  children,
}: ModalProps) => {
  useLockBodyScroll(open);

  React.useEffect(() => {
    if (!open || !closeOnEsc) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onOpenChange]);

  const container = getPortalContainer();
  if (!open || !container) return null;

  return createPortal(
    <div data-slot="modal-root" className="fixed inset-0 z-50">
      {/* We expose dismissal behavior to children via context */}
      <ModalContext.Provider
        value={{
          open,
          onOpenChange,
          closeOnBackdropClick,
        }}
      >
        {children}
      </ModalContext.Provider>
    </div>,
    container
  );
};

Modal.displayName = "Modal";

type ModalContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnBackdropClick: boolean;
};

const ModalContext = React.createContext<ModalContextValue | null>(null);

function useModalContext() {
  const ctx = React.useContext(ModalContext);
  if (!ctx) {
    throw new Error("Modal components must be used within <Modal />");
  }
  return ctx;
}

const ModalOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { onOpenChange, closeOnBackdropClick } = useModalContext();

  return (
    <div
      ref={ref}
      data-slot="modal-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]",
        className
      )}
      onMouseDown={(e) => {
        if (!closeOnBackdropClick) return;
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      {...props}
    />
  );
});
ModalOverlay.displayName = "ModalOverlay";

const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="dialog"
    aria-modal="true"
    tabIndex={-1}
    data-slot="modal-content"
    className={cn(
      "fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2",
      "rounded-lg border bg-background text-foreground shadow-lg",
      "focus:outline-none",
      className
    )}
    {...props}
  />
));
ModalContent.displayName = "ModalContent";

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="modal-header"
    className={cn("flex items-start justify-between gap-4 p-6 pb-3", className)}
    {...props}
  />
));
ModalHeader.displayName = "ModalHeader";

const ModalHeaderText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="modal-header-text"
    className={cn("flex min-w-0 flex-1 flex-col gap-1.5", className)}
    {...props}
  />
));
ModalHeaderText.displayName = "ModalHeaderText";

const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    data-slot="modal-title"
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = "ModalTitle";

const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="modal-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModalDescription.displayName = "ModalDescription";

const ModalClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { srLabel?: string }
>(({ className, srLabel = "Close", ...props }, ref) => {
  const { onOpenChange } = useModalContext();

  return (
    <button
      ref={ref}
      type="button"
      data-slot="modal-close"
      aria-label={srLabel}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md",
        "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) onOpenChange(false);
      }}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  );
});
ModalClose.displayName = "ModalClose";

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="modal-body"
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
ModalBody.displayName = "ModalBody";

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="modal-footer"
    className={cn("flex items-center justify-end gap-2 p-6 pt-3", className)}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

export {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalHeaderText,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalBody,
  ModalFooter,
};

/*
Usage Example:
import * as React from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalHeaderText,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

export function DemoModal() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <ModalHeaderText>
              <ModalTitle>Confirm action</ModalTitle>
              <ModalDescription>
                Clicking the backdrop or the close icon will dismiss.
              </ModalDescription>
            </ModalHeaderText>

            <ModalClose />
          </ModalHeader>

          <ModalBody>Modal body content goes here.</ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
*/
