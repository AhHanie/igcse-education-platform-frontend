import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { verifyRegistration, completeRegistration } from "@/app/api/auth";
import { ApiError } from "@/app/api/client";

type SignupStep = "email" | "password";

interface ValidationErrorDetail {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

interface ValidationErrorResponse {
  detail?: ValidationErrorDetail[] | string;
  message?: string;
}

function extractErrorMessage(payload: unknown, status?: number): string {
  if (!payload) {
    return status === 422
      ? "Validation error. Please check your input."
      : "Something went wrong. Please try again.";
  }

  const error = payload as ValidationErrorResponse;

  // Handle FastAPI validation errors (422 status)
  if (Array.isArray(error.detail)) {
    const messages = error.detail.map((err) => err.msg);
    return messages.join(". ");
  }

  // Handle simple message format
  if (typeof error.detail === "string") {
    return error.detail;
  }

  if (error.message) {
    return error.message;
  }

  // Fallback based on status
  if (status === 422) {
    return "Validation error. Please check your input.";
  }

  if (status === 400) {
    return "Invalid request. Please check your input.";
  }

  if (status === 401) {
    return "Username or code incorrect";
  }

  return "Something went wrong. Please try again.";
}

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignupStep>("email");
  const [email, setEmail] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your username");
      return;
    }

    if (!schoolCode.trim()) {
      setError("Please enter your school code");
      return;
    }

    setIsLoading(true);

    try {
      // Call verify-registration endpoint
      // Validates username and code combination
      await verifyRegistration({
        username: email.trim(),
        code: schoolCode.trim(),
      });

      // If successful, move to password step
      setStep("password");
    } catch (err) {
      // Handle API errors
      if (err instanceof ApiError) {
        const errorMessage = extractErrorMessage(err.payload, err.status);
        setError(errorMessage);
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Call complete-registration endpoint
      const response = await completeRegistration({
        username: email.trim(),
        code: schoolCode.trim(),
        password: password,
        confirm_password: confirmPassword,
      });

      console.log("Registration successful", response);
      // Redirect to home page after successful registration
      navigate("/");
    } catch (err) {
      // Handle API errors
      if (err instanceof ApiError) {
        const errorMessage = extractErrorMessage(err.payload, err.status);
        setError(errorMessage);
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter your school email to get started
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Username</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="yourname@school.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                disabled={isLoading}
              />
              <FieldDescription>
                The username provided by your school.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="school-code">School Code</FieldLabel>
              <Input
                id="school-code"
                type="text"
                placeholder="Enter your school code"
                value={schoolCode}
                onChange={(e) => {
                  setSchoolCode(e.target.value);
                  setError("");
                }}
                required
                disabled={isLoading}
                inputMode="numeric"
              />
              <FieldDescription>
                Enter the code provided by your school.
              </FieldDescription>
            </Field>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Field>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </Field>
            <Field>
              <FieldDescription className="px-6 text-center">
                Already have an account? <a href="/login">Sign in</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Set up your password</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Create a secure password for your account
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                disabled={isLoading}
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                required
                disabled={isLoading}
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Field>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </Field>
            <Field>
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToEmail}
                disabled={isLoading}
              >
                Back to email
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}
    </div>
  );
}
