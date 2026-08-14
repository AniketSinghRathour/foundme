"use client";

import { useSession } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Mail } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AccountSettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "mb-4 -ml-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center inline-flex w-fit")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-serif font-medium text-zinc-900 dark:text-zinc-50">Account Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border border-zinc-200 dark:border-zinc-800">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
              <AvatarFallback className="text-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">{session?.user?.name}</h2>
              <p className="text-zinc-500">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input id="name" defaultValue={session?.user?.name || ""} className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-900" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input id="email" defaultValue={session?.user?.email || ""} className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-900" disabled />
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Note: Profile updates are currently disabled. You can manage your authentication settings via your provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
