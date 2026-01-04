import * as React from "react";

import { apiClient } from "@/app/api/client";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Heading, Text } from "@/components/ui/typography";

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

// TODO: Remove hardcoding once authentication is implemented on frontend side
const ORG_ID = "887b871b-1f73-4cb4-a512-0af6510d61b3";
const SCHOOL_ID = "ad33eec3-892a-47d8-b6e3-b06292c8e3e0";

function clamp01Gender(v: string): 0 | 1 {
  return v === "1" ? 1 : 0;
}

export type AddStudentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  schoolShortName: string;
};

export function AddStudentModal({
  open,
  onOpenChange,
  onCreated,
  schoolShortName,
}: AddStudentModalProps) {
  const [username, setUsername] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [gender, setGender] = React.useState<0 | 1>(0);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setUsername("");
    setDisplayName("");
    setGender(0);
    setSubmitting(false);
    setError(null);
  }, [open]);

  const canSubmit =
    username.trim().length > 0 && displayName.trim().length > 0 && !submitting;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post("/users", {
        role_name: "Student",
        organization_id: ORG_ID,
        school_id: SCHOOL_ID,
        username: username.trim(),
        display_name: displayName.trim(),
        gender,
      });

      onOpenChange(false);
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
                  />
                  <div className="text-muted-foreground text-sm sm:text-base">
                    @{schoolShortName}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  placeholder="e.g. Ahmed Hassan"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="off"
                />
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
