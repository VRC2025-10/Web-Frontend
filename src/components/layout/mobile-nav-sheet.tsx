"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { AuthMe } from "@/lib/api/types";

interface MobileNavSheetProps {
  user: AuthMe | null;
}

export function MobileNavSheet({ user }: MobileNavSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <MobileNav user={user} />
    </Sheet>
  );
}