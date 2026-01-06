import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginWithEmail,
  loginWithUsername,
} from "@/app/api/auth";
import { ApiError } from "@/app/api/client";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  
  // Email login state
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  
  // Username login state
  const [username, setUsername] = useState("");
  const [usernamePassword, setUsernamePassword] = useState("");
  
  // Shared state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!emailPassword.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginWithEmail({
        email: email.trim(),
        password: emailPassword,
      });

      console.log("Login successful", response);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        const errorMessage =
          (err.payload as { message?: string })?.message ||
          (err.status === 401
            ? "Invalid email or password"
            : err.status === 400
            ? "Please check your input and try again"
            : "Something went wrong. Please try again.");
        setError(errorMessage);
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    if (!usernamePassword.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginWithUsername({
        username: username.trim(),
        password: usernamePassword,
      });

      console.log("Login successful", response);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        const errorMessage =
          (err.payload as { message?: string })?.message ||
          (err.status === 401
            ? "Invalid username or password"
            : err.status === 400
            ? "Please check your input and try again"
            : "Something went wrong. Please try again.");
        setError(errorMessage);
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">LOGIN</h1>
      </div>

      {/* Email Login Section */}
      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email-password">Password</Label>
            <Input
              id="email-password"
              type="password"
              placeholder="Password"
              value={emailPassword}
              onChange={(e) => {
                setEmailPassword(e.target.value);
                setError("");
              }}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login by Email"}
          </Button>
        </div>
      </form>

      {/* OR Divider */}
      <div className="relative flex items-center">
        <div className="flex-1 border-t"></div>
        <span className="px-4 text-sm text-muted-foreground">OR</span>
        <div className="flex-1 border-t"></div>
      </div>

      {/* Username Login Section */}
      <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username-password">Password</Label>
            <Input
              id="username-password"
              type="password"
              placeholder="Password"
              value={usernamePassword}
              onChange={(e) => {
                setUsernamePassword(e.target.value);
                setError("");
              }}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login by Username"}
          </Button>
        </div>
      </form>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </div>
  );
}
