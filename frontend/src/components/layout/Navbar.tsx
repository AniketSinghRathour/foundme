"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAccountCapabilities } from "@/hooks/useAccountCapabilities";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isPhotographer, isLoading, session } = useAccountCapabilities();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-[#FAF7F2]/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif text-2xl tracking-tight font-semibold text-zinc-900 dark:text-zinc-50">
            FoundMe
          </Link>

          {/* Conditional Navigation */}
          {!isLoading && isAuthenticated && (
            <nav className="hidden md:flex items-center gap-4 ml-6 text-sm font-medium">

              {isPhotographer && (
                <Link
                  href="/dashboard"
                  className={cn(
                    "transition-colors hover:text-zinc-900 dark:hover:text-zinc-50",
                    pathname.startsWith("/dashboard") ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
                  )}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              {!isPhotographer && (
                 <Link href="/dashboard/events/new" className={cn(buttonVariants({ variant: "outline" }), "hidden sm:inline-flex border-zinc-300 dark:border-zinc-700")}>
                    Start an event
                 </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "relative h-8 w-8 rounded-full p-0")}>
                  <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                    <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400">
                      {session?.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/account")} className="cursor-pointer">
                    Account Settings
                  </DropdownMenuItem>

                  {isPhotographer && (
                    <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer md:hidden">
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400 cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex hover:bg-zinc-200 dark:hover:bg-zinc-800")}>
                Sign in
              </Link>
              <Link href="/sign-up" className={cn(buttonVariants({}), "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200")}>
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
