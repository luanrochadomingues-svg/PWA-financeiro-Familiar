"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, Briefcase, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/pessoal", label: "Pessoal", icon: User },
  { href: "/casal", label: "Casal", icon: Users },
  { href: "/juridico", label: "Jurídico", icon: Briefcase },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 pb-safe pt-2 z-50 shadow-2xl">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 py-1 transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-colors",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}