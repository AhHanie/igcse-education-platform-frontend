import * as React from "react";

import { apiClient } from "@/app/api/client";
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
import type { User } from "@/types/common";

type UsersByUsernameResponse = {
  items: User[];
  total: number;
};

function clamp01Gender(v: string): 0 | 1 {
  return v === "1" ? 1 : 0;
}

type AdminUserData = {
  shortSchoolName: string;
  organizationId: string;
  schoolId: string;
};

export type AddStudentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  userData: AdminUserData;
};

type UsernameCheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken" }
  | { status: "error"; message: string };

function validateUsername(raw: string): string | null {
  const v = raw.trim();

  if (v.length === 0) return "Username is required.";
  if (v.length < 3 || v.length > 32) return "Username must be 3–32 characters.";
  if (/^\d/.test(v)) return "Username must not start with a number.";
  if (!/^[A-Za-z0-9._]+$/.test(v))
    return "Username can only contain letters, numbers, dots, and underscores.";

  return null;
}

function validateDisplayName(raw: string): string | null {
  const v = raw.trim();
  if (v.length === 0) return "Display name is required.";
  if (v.length > 255) return "Display name cannot exceed 255 characters.";
  return null;
}

export function AddStudentModal({
  open,
  onOpenChange,
  onCreated,
  userData,
}: AddStudentModalProps) {
  const { success } = useToast();

  const [username, setUsername] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [gender, setGender] = React.useState<0 | 1>(0);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Field-level validation state
  const usernameError = React.useMemo(
    () => validateUsername(username),
    [username]
  );
  const displayNameError = React.useMemo(
    () => validateDisplayName(displayName),
    [displayName]
  );

  const [usernameCheck, setUsernameCheck] = React.useState<UsernameCheckState>({
    status: "idle",
  });

  // Keep a ref to abort in-flight uniqueness requests
  const usernameAbortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (!open) return;

    setUsername("");
    setDisplayName("");
    setGender(0);
    setSubmitting(false);
    setError(null);
    setUsernameCheck({ status: "idle" });

    // Abort any in-flight request when opening/resetting
    usernameAbortRef.current?.abort();
    usernameAbortRef.current = null;
  }, [open]);

  // Debounced uniqueness check (runs only if local username validation passes)
  React.useEffect(() => {
    if (!open) return;

    // Reset remote check if the username is empty or locally invalid
    if (username.trim().length === 0) {
      setUsernameCheck({ status: "idle" });
      usernameAbortRef.current?.abort();
      usernameAbortRef.current = null;
      return;
    }

    if (usernameError) {
      setUsernameCheck({ status: "idle" });
      usernameAbortRef.current?.abort();
      usernameAbortRef.current = null;
      return;
    }

    const value = username.trim() + "@" + userData.shortSchoolName;

    // Debounce: wait until user stops typing
    const t = window.setTimeout(async () => {
      // Abort any previous request
      usernameAbortRef.current?.abort();

      const controller = new AbortController();
      usernameAbortRef.current = controller;

      setUsernameCheck({ status: "checking" });

      try {
        // GET /users?username=existing_username
        const payload = await apiClient.get<UsersByUsernameResponse>(
          `/users?username=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        );

        const total = payload.total;

        const found = total > 0;

        setUsernameCheck(found ? { status: "taken" } : { status: "available" });
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setUsernameCheck({
          status: "error",
          message: "Failed to validate username.",
        });
      }
    }, 450);

    return () => {
      window.clearTimeout(t);
    };
  }, [open, username, usernameError]);

  const canSubmit =
    !submitting &&
    !usernameError &&
    !displayNameError &&
    username.trim().length > 0 &&
    displayName.trim().length > 0 &&
    usernameCheck.status !== "checking" &&
    usernameCheck.status !== "taken" &&
    usernameCheck.status !== "error";

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post("/users", {
        role_name: "Student",
        organization_id: userData.organizationId,
        school_id: userData.schoolId,
        username: username.trim(),
        display_name: displayName.trim(),
        gender,
      });

      onOpenChange(false);
      success("Student created", "The new student account has been added successfully.");
      onCreated?.();
    } catch (err: any) {
      setError(
        err?.message ? String(err.message) : "Failed to create student."
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
                Add New Student
              </ModalTitle>
              <ModalDescription className="hidden sm:block">
                Create a new student account for the organization.
              </ModalDescription>
            </ModalHeaderText>

            <ModalClose />
          </ModalHeader>

          <ModalBody className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <Input
                    id="username"
                    placeholder="e.g. ahmed_2025"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                    aria-invalid={
                      !!usernameError || usernameCheck.status === "taken"
                    }
                  />
                  <div className="text-muted-foreground text-sm sm:text-base">
                    @{userData.shortSchoolName}
                  </div>
                </div>

                {/* Username helper / validation messages */}
                {usernameError ? (
                  <div className="text-destructive text-sm">
                    {usernameError}
                  </div>
                ) : username.trim().length > 0 ? (
                  <div className="text-sm">
                    {usernameCheck.status === "checking" && (
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Spinner size="sm" />
                        Checking availability…
                      </span>
                    )}
                    {usernameCheck.status === "available" && (
                      <span className="text-muted-foreground">
                        Username is available.
                      </span>
                    )}
                    {usernameCheck.status === "taken" && (
                      <span className="text-destructive">
                        Username is already taken.
                      </span>
                    )}
                    {usernameCheck.status === "error" && (
                      <span className="text-destructive">
                        {usernameCheck.message}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  placeholder="e.g. Ahmed Hassan"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="off"
                  aria-invalid={!!displayNameError}
                />
                {displayNameError && (
                  <div className="text-destructive text-sm">
                    {displayNameError}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={String(gender)}
                  onChange={(e) => setGender(clamp01Gender(e.target.value))}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base",
                    "ring-offset-background placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  )}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
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
                  "Create Student"
                )}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
