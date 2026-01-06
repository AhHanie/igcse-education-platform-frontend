import * as React from "react";
import { Upload, File, X } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const fileUploadVariants = cva(
  "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
  {
    variants: {
      state: {
        idle: "border-border hover:border-primary/50",
        dragging: "border-primary bg-primary/5",
        hasFile: "border-primary/50 bg-primary/5",
        error: "border-destructive bg-destructive/5",
      },
    },
    defaultVariants: {
      state: "idle",
    },
  }
);

export interface FileUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onError"> {
  fileTypes?: string[];
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      fileTypes = [".xls", ".xlsx"],
      maxSizeMB = 1,
      onFileSelect,
      onError,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
      // Check file type
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!fileTypes.includes(fileExtension)) {
        return `Invalid file type. Accepted types: ${fileTypes.join(", ")}`;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        return `File size exceeds ${maxSizeMB}MB. Your file is ${fileSizeMB.toFixed(
          1
        )}MB`;
      }

      return null;
    };

    const handleFile = (file: File) => {
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        onError?.(validationError);
        return;
      }

      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    };

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    const handleClearFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedFile(null);
      setError(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const state = error
      ? "error"
      : isDragging
      ? "dragging"
      : selectedFile
      ? "hasFile"
      : "idle";

    return (
      <div
        ref={ref}
        className={cn(fileUploadVariants({ state }), className)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={
          selectedFile
            ? `Selected file: ${selectedFile.name}`
            : "Upload file area. Click to browse or drag and drop a file."
        }
        aria-invalid={!!error}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={fileTypes.join(",")}
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden="true"
        />

        {!selectedFile ? (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted: {fileTypes.join(", ")}
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSizeMB}MB
            </p>
          </>
        ) : (
          <>
            <File className="h-10 w-10 text-primary mb-3" />
            <p className="text-sm font-medium mb-1">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground mb-3">
              {formatFileSize(selectedFile.size)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFile}
              className="mt-2"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </>
        )}

        {error && (
          <div
            className="mt-3 text-destructive text-sm text-center"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
