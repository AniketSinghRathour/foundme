import { AuthForm } from "@/components/auth/AuthForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <AuthForm type="sign-up" />
      </div>
    </div>
  );
}
