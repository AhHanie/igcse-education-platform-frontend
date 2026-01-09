import * as React from "react";

import { apiClient } from "@/app/api/client";

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
import type { SubjectListResponse } from "@/features/subject/types";

export type AddSubjectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

type CodeCheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken" }
  | { status: "error"; message: string };

function validateCode(raw: string): string | null {
  const v = raw.trim();

  if (v.length === 0) return "Subject code is required.";
  if (v.length > 32) return "Subject code cannot exceed 32 characters.";
  // Subject codes typically contain alphanumeric characters
  if (!/^[A-Za-z0-9\-_]+$/.test(v))
    return "Subject code can only contain letters, numbers, hyphens, and underscores.";

  return null;
}

function validateName(raw: string): string | null {
  const v = raw.trim();
  if (v.length === 0) return "Subject name is required.";
  if (v.length > 255) return "Subject name cannot exceed 255 characters.";
  return null;
}

export function AddSubjectModal({
  open,
  onOpenChange,
  onCreated,
}: AddSubjectModalProps) {
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Field-level validation state
  const codeError = React.useMemo(() => validateCode(code), [code]);
  const nameError = React.useMemo(() => validateName(name), [name]);

  const [codeCheck, setCodeCheck] = React.useState<CodeCheckState>({
    status: "idle",
  });

  // Keep a ref to abort in-flight uniqueness requests
  const codeAbortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (!open) return;

    setCode("");
    setName("");
    setSubmitting(false);
    setError(null);
    setCodeCheck({ status: "idle" });

    // Abort any in-flight request when opening/resetting
    codeAbortRef.current?.abort();
    codeAbortRef.current = null;
  }, [open]);

  // Debounced uniqueness check (runs only if local code validation passes)
  React.useEffect(() => {
    if (!open) return;

    // Reset remote check if the code is empty or locally invalid
    if (code.trim().length === 0) {
      setCodeCheck({ status: "idle" });
      codeAbortRef.current?.abort();
      codeAbortRef.current = null;
      return;
    }

    if (codeError) {
      setCodeCheck({ status: "idle" });
      codeAbortRef.current?.abort();
      codeAbortRef.current = null;
      return;
    }

    const value = code.trim();

    // Debounce: wait until user stops typing
    const t = window.setTimeout(async () => {
      // Abort any previous request
      codeAbortRef.current?.abort();

      const controller = new AbortController();
      codeAbortRef.current = controller;

      setCodeCheck({ status: "checking" });

      try {
        // GET /subjects?code=exact_code
        const payload = await apiClient.get<SubjectListResponse>(
          `/subjects?code=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        );

        const total = payload.total;
        const found = total > 0;

        setCodeCheck(found ? { status: "taken" } : { status: "available" });
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setCodeCheck({
          status: "error",
          message: "Failed to validate subject code.",
        });
      }
    }, 450);

    return () => {
      window.clearTimeout(t);
    };
  }, [open, code, codeError]);

  const canSubmit =
    !submitting &&
    !codeError &&
    !nameError &&
    code.trim().length > 0 &&
    name.trim().length > 0 &&
    codeCheck.status !== "checking" &&
    codeCheck.status !== "taken" &&
    codeCheck.status !== "error";

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post("/subjects", {
        code: code.trim(),
        name: name.trim(),
      });

      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      setError(
        err?.message ? String(err.message) : "Failed to create subject."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalOverlay />
      <ModalContent className="w-[min(92vw,820px)]">
        <form onSubmit={submit}>
          <ModalHeader className="border-b pb-4">
            <ModalHeaderText>
              <ModalTitle className="text-center sm:text-left">
                Add New Subject
              </ModalTitle>
              <ModalDescription className="hidden sm:block">
                Create a new IGCSE subject for the platform.
              </ModalDescription>
            </ModalHeaderText>

            <ModalClose />
          </ModalHeader>

          <ModalBody className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. 0580"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="off"
                  aria-invalid={!!codeError || codeCheck.status === "taken"}
                />

                {/* Code helper / validation messages */}
                {codeError ? (
                  <div className="text-destructive text-sm">{codeError}</div>
                ) : code.trim().length > 0 ? (
                  <div className="text-sm">
                    {codeCheck.status === "checking" && (
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Spinner size="sm" />
                        Checking availability…
                      </span>
                    )}
                    {codeCheck.status === "available" && (
                      <span className="text-muted-foreground">
                        Subject code is available.
                      </span>
                    )}
                    {codeCheck.status === "taken" && (
                      <span className="text-destructive">
                        Subject code is already taken.
                      </span>
                    )}
                    {codeCheck.status === "error" && (
                      <span className="text-destructive">
                        {codeCheck.message}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Mathematics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  aria-invalid={!!nameError}
                />
                {nameError && (
                  <div className="text-destructive text-sm">{nameError}</div>
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
                    Creating…
                  </span>
                ) : (
                  "Create Subject"
                )}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
