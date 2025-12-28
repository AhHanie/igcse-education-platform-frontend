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
import { ArrowLeft } from "lucide-react";

type SignupStep = "email" | "password";

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

  const validateEmail = (emailValue: string): boolean => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const validateSchoolCode = (code: string): boolean => {
    // Check if code contains only numbers
    return /^\d+$/.test(code);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!schoolCode.trim()) {
      setError("Please enter your school code");
      return;
    }

    if (!validateSchoolCode(schoolCode)) {
      setError("School code must contain only numbers");
      return;
    }

    setIsLoading(true);

    // TODO: Verify with backend if email and school code are valid
    // For now, any valid email format and numeric school code is accepted
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In the future, replace this with actual API call:

      setStep("password");
    } catch (err) {
      setError("Something went wrong. Please try again.");
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

    // TODO: Implement actual signup logic
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In the future, replace this with actual API call:

      console.log("Signup successful", { email, password });
      // Redirect to home page
      navigate("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
              <FieldLabel htmlFor="email">Email</FieldLabel>
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
                The email provided by your school.
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
                Enter the numeric code provided by your school.
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
