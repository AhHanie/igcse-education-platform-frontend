import * as React from "react";

import { documentApi } from "@/features/document/api/documents";
import { useSubjectsStore } from "@/features/subject/store/useSubjectsStore";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
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
import { useToast } from "@/components/ui/toast";

export type AddDocumentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

function validateTitle(raw: string): string | null {
  const v = raw.trim();
  if (v.length === 0) return "Title is required.";
  if (v.length > 512) return "Title cannot exceed 512 characters.";
  return null;
}

function validateFile(file: File | null): string | null {
  if (!file) return "Please select a file to upload.";
  return null;
}

function validateSubject(subjectId: string): string | null {
  if (subjectId.length === 0) return "Please select a subject.";
  return null;
}

export function AddDocumentModal({
  open,
  onOpenChange,
  onCreated,
}: AddDocumentModalProps) {
  const { success } = useToast();

  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch subjects from store
  const {
    subjects,
    fetchSubjects,
    isLoading: subjectsLoading,
  } = useSubjectsStore();

  // Load subjects when modal opens (if not already cached)
  React.useEffect(() => {
    if (open) {
      fetchSubjects().catch(() => {
        // Error is handled by store
      });
    }
  }, [open, fetchSubjects]);

  // Field-level validation state
  const titleError = React.useMemo(() => validateTitle(title), [title]);
  const fileError = React.useMemo(() => validateFile(file), [file]);
  const subjectError = React.useMemo(
    () => validateSubject(subjectId),
    [subjectId]
  );

  React.useEffect(() => {
    if (!open) return;

    setFile(null);
    setTitle("");
    setSubjectId("");
    setSubmitting(false);
    setError(null);
  }, [open]);

  const canSubmit =
    !submitting &&
    !titleError &&
    !fileError &&
    !subjectError &&
    title.trim().length > 0 &&
    file !== null &&
    subjectId.length > 0;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit || !file) return;

    setSubmitting(true);
    setError(null);

    try {
      await documentApi.create({
        file,
        title: title.trim(),
        subject_id: subjectId,
        visibility: "public",
        organization_id: null,
        school_id: null,
        document_type: null,
        metadata: null,
      });

      onOpenChange(false);
      success(
        "Document created",
        "The document has been uploaded successfully."
      );
      onCreated?.();
    } catch (err: any) {
      setError(
        err?.message ? String(err.message) : "Failed to create document."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalOverlay />
      <ModalContent className="w-[min(92vw,820px)]">
        <form onSubmit={submit}>
          <ModalHeader className="border-b pb-4">
            <ModalHeaderText>
              <ModalTitle className="text-center sm:text-left">
                Add New Document
              </ModalTitle>
              <ModalDescription className="hidden sm:block">
                Upload a new document for the selected subject.
              </ModalDescription>
            </ModalHeaderText>

            <ModalClose />
          </ModalHeader>

          <ModalBody className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file">Document File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  aria-invalid={!!fileError}
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
                {file && (
                  <div className="text-muted-foreground text-sm">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </div>
                )}
                {fileError && !file && (
                  <div className="text-destructive text-sm">{fileError}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <select
                  id="subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  disabled={subjectsLoading}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base",
                    "ring-offset-background placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  )}
                  aria-invalid={!!subjectError}
                >
                  <option value="">
                    {subjectsLoading
                      ? "Loading subjects..."
                      : "Select a subject"}
                  </option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
                {subjectError && subjectId.length === 0 && (
                  <div className="text-destructive text-sm">{subjectError}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Chapter 1 - Introduction to Physics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoComplete="off"
                  aria-invalid={!!titleError}
                />
                {titleError && (
                  <div className="text-destructive text-sm">{titleError}</div>
                )}
              </div>

              {error && <div className="text-destructive text-sm">{error}</div>}
            </div>
          </ModalBody>

          <ModalFooter className="border-t pt-4">
            <div className="flex w-full items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" />
                    Uploading…
                  </span>
                ) : (
                  "Upload Document"
                )}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
