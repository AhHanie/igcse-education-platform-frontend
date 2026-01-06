import * as React from "react";
import { ChevronDown } from "lucide-react";

import { apiClient } from "@/app/api/client";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
} from "@/components/ui/modal";

type BulkImportRowError = {
  row_number: number;
  field: string;
  error_reason: string;
};

type BulkImportSuccessResponse = {
  success_count: number;
  created_users: Array<{
    id: string;
    username: string;
    display_name: string;
    student_code: string;
    gender: number;
    is_active: boolean;
    must_reset: boolean;
    created_at: string;
  }>;
};

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; data: BulkImportSuccessResponse }
  | {
      status: "validation-error";
      errors: BulkImportRowError[];
      message: string;
    }
  | { status: "error"; message: string };

export type BulkUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function BulkUploadModal({
  open,
  onOpenChange,
  onSuccess,
}: BulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadState, setUploadState] = React.useState<UploadState>({
    status: "idle",
  });
  const [errorsExpanded, setErrorsExpanded] = React.useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (!open) return;

    setSelectedFile(null);
    setUploadState({ status: "idle" });
    setErrorsExpanded(false);
  }, [open]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Clear any previous errors when a new file is selected
    if (
      uploadState.status === "error" ||
      uploadState.status === "validation-error"
    ) {
      setUploadState({ status: "idle" });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState({ status: "uploading" });

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await apiClient.post<BulkImportSuccessResponse>(
        "/users/bulk-import",
        formData
      );

      setUploadState({ status: "success", data: response });
      onSuccess?.(); // Triggers table refresh
    } catch (err: any) {
      const status = err?.status;
      const payload = err?.payload;

      if (status === 422 && payload?.detail?.errors) {
        setUploadState({
          status: "validation-error",
          errors: payload.detail.errors,
          message: payload.detail.message || "Validation errors found",
        });
      } else {
        const message =
          status === 413
            ? payload?.detail || "File size exceeds 1MB"
            : status === 415
            ? "Unsupported file type. Please upload an Excel file (.xlsx or .xls)"
            : status === 400
            ? payload?.detail || "Invalid file format"
            : status === 403
            ? "You do not have permission to perform this action"
            : "Failed to upload file. Please try again.";

        setUploadState({ status: "error", message });
      }
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalOverlay />
      <ModalContent className="w-[min(92vw,820px)]">
        <ModalHeader className="border-b pb-4">
          <ModalHeaderText>
            <ModalTitle className="text-center sm:text-left">
              Bulk Upload Students
            </ModalTitle>
            <ModalDescription className="hidden sm:block">
              Upload an Excel file with columns: Name, Username, Gender
            </ModalDescription>
          </ModalHeaderText>

          <ModalClose />
        </ModalHeader>

        <ModalBody className="pt-6">
          <div className="space-y-6">
            {/* File Upload - Hide when showing success */}
            {uploadState.status !== "success" && (
              <FileUpload
                fileTypes={[".xls", ".xlsx"]}
                maxSizeMB={1}
                onFileSelect={handleFileSelect}
                disabled={uploadState.status === "uploading"}
              />
            )}

            {/* Validation Error Display */}
            {uploadState.status === "validation-error" && (
              <div className="space-y-3">
                <button
                  onClick={() => setErrorsExpanded(!errorsExpanded)}
                  className="flex w-full items-center justify-between rounded-md border border-destructive bg-destructive/10 p-3 text-left text-sm text-destructive hover:bg-destructive/20 transition-colors"
                  type="button"
                >
                  <span className="font-medium">
                    {uploadState.errors.length} validation error(s) found
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      errorsExpanded && "rotate-180"
                    )}
                  />
                </button>

                {errorsExpanded && (
                  <div className="rounded-md border max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadState.errors.map((err, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-sm">
                              {err.row_number}
                            </TableCell>
                            <TableCell className="font-medium">
                              {err.field}
                            </TableCell>
                            <TableCell className="text-destructive text-sm">
                              {err.error_reason}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Generic Error Display */}
            {uploadState.status === "error" && (
              <div
                className="rounded-md border border-destructive bg-destructive/10 p-4"
                role="alert"
              >
                <p className="text-sm text-destructive">
                  {uploadState.message}
                </p>
              </div>
            )}

            {/* Success Display */}
            {uploadState.status === "success" && (
              <div className="space-y-4">
                <div className="rounded-md border border-primary bg-primary/5 p-4">
                  <p className="text-sm font-medium text-primary">
                    ✓ Successfully imported {uploadState.data.success_count}{" "}
                    student(s)
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Created Students & Registration Codes:
                  </p>
                  <div className="rounded-md border max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Display Name</TableHead>
                          <TableHead>Registration Code</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadState.data.created_users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-mono text-sm">
                              {user.username}
                            </TableCell>
                            <TableCell>{user.display_name}</TableCell>
                            <TableCell>
                              <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                                {user.student_code}
                              </code>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="border-t pt-4">
          <div className="flex w-full items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploadState.status === "uploading"}
            >
              {uploadState.status === "success" ? "Close" : "Cancel"}
            </Button>

            {uploadState.status !== "success" && (
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadState.status === "uploading"}
              >
                {uploadState.status === "uploading" ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" />
                    Uploading…
                  </span>
                ) : (
                  "Upload"
                )}
              </Button>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
