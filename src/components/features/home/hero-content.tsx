import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/site";

interface HeroContentProps {
  subtitle: string;
  ctaEventsLabel: string;
  ctaMembersLabel: string;
}

export function HeroContent({ subtitle, ctaEventsLabel, ctaMembersLabel }: HeroContentProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8 md:pb-10">
      <div className="bg-background/60 backdrop-blur-md rounded-2xl p-4 md:p-8 inline-block max-w-xl">
      <h1 className="hero-fade-up font-heading text-2xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
        {SITE_NAME}
      </h1>
      <p
        className="hero-fade-up mt-2 max-w-md text-sm text-muted-foreground md:text-base"
        style={{ animationDelay: "80ms" }}
      >
        {subtitle}
      </p>
      <div className="hero-fade-up mt-4 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "160ms" }}>
        <div className="hero-fade-up" style={{ animationDelay: "220ms" }}>
          <Button asChild className="w-full sm:w-auto rounded-2xl px-6 py-3 text-base h-auto">
            <Link href="/events">{ctaEventsLabel}</Link>
          </Button>
        </div>
        <div className="hero-fade-up" style={{ animationDelay: "260ms" }}>
          <Button variant="outline" asChild className="w-full sm:w-auto rounded-2xl px-6 py-3 text-base h-auto">
            <Link href="/members">{ctaMembersLabel}</Link>
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
