"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for sign-up
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (type === "sign-up") {
        const { error } = await signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (error) throw new Error(error.message);
        // Backend has requireEmailVerification: true — no session created yet.
        // Show the "check your email" state instead of redirecting.
        setVerificationPending(true);
      } else {
        const { error } = await signIn.email({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn.social({ 
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  // Show verification pending state after successful email sign-up
  if (verificationPending) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden rounded-[2rem] p-2">
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-serif tracking-tight">Check your email</CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            We&apos;ve sent a verification link to <strong>{email}</strong>. Click it to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="text-sm text-center text-zinc-500">
            Didn&apos;t receive it? Check your spam folder, or{" "}
            <button
              onClick={() => setVerificationPending(false)}
              className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:text-zinc-700 transition-colors"
            >
              try again
            </button>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden rounded-[2rem] p-2">
      <CardHeader className="space-y-2 text-center pb-6 pt-8">
        <CardTitle className="text-3xl font-serif tracking-tight">
          {type === "sign-in" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          {type === "sign-in"
            ? "Enter your email to sign in to your account"
            : "Enter your details to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          variant="outline"
          className="w-full h-11 border-zinc-300 dark:border-zinc-700 font-medium transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800"
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {type === "sign-in" ? "Sign in with Google" : "Sign up with Google"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}
          {type === "sign-up" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-white dark:bg-zinc-950"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-white dark:bg-zinc-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 bg-white dark:bg-zinc-950"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium transition-all"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col border-t border-zinc-100 dark:border-zinc-800 p-6 bg-zinc-50/50 dark:bg-zinc-900/50">
        <p className="text-sm text-center text-zinc-500">
          {type === "sign-in"
            ? "Don't have an account? "
            : "Already have an account? "}
          <Link
            href={type === "sign-in" ? "/sign-up" : "/sign-in"}
            className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:text-zinc-700 transition-colors"
          >
            {type === "sign-in" ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
