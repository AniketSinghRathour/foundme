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

  const isHome = pathname === "/";

  return (
    <header className={cn(
      "w-full z-50 transition-all duration-300",
      isHome 
        ? "absolute top-0 left-0 bg-transparent border-none" 
        : "sticky top-0 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-amber-900/5"
    )}>
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between max-w-[1400px]">
        <div className="flex items-center gap-6">
          <Link href="/" className={cn(
            "font-serif text-3xl tracking-tight font-semibold",
            isHome ? "text-white drop-shadow-md" : "text-zinc-900"
          )}>
            Facet
          </Link>

        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">

              {isPhotographer ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    "hidden md:inline-flex transition-colors text-sm font-medium mr-2",
                    isHome 
                      ? "text-white/80 hover:text-white drop-shadow-sm" 
                      : pathname.startsWith("/dashboard") 
                        ? "text-zinc-900 font-semibold" 
                        : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  Dashboard
                </Link>
              ) : (
                 <Link href="/dashboard/events/new" className={cn(buttonVariants({ variant: "outline" }), "hidden sm:inline-flex border-zinc-300 hover:bg-zinc-100")}>
                    Start an event
                 </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "relative h-8 w-8 rounded-full p-0")}>
                  <Avatar className="h-8 w-8 border border-zinc-200">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-900">
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-zinc-500">
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
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">

              <Link href="/sign-in" className={cn(
                buttonVariants({ variant: "ghost" }), 
                "inline-flex rounded-full px-5 text-sm font-medium transition-colors",
                isHome ? "text-white hover:bg-white/10 hover:text-white drop-shadow-md" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50"
              )}>
                Log in
              </Link>
              <Link href="/sign-up" className={cn(
                buttonVariants({}), 
                "rounded-full px-6 h-9 text-sm font-medium shadow-sm transition-transform hover:scale-[1.02]",
                isHome ? "bg-white text-zinc-950 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-800"
              )}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
