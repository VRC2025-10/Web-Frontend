"use client";

import * as React from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { PublicMember } from "@/lib/api/types";

interface MemberCarouselProps {
  members: Pick<PublicMember, "user_id" | "discord_username" | "avatar_url">[];
}

export function MemberCarousel({ members }: MemberCarouselProps) {
  return (
    <TooltipProvider>
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        plugins={[
          Autoplay({ delay: 3000, stopOnInteraction: true }),
        ]}
        className="w-full mt-8"
        aria-label="Members"
      >
        <CarouselContent className="-ml-3">
          {members.map((member) => {
            const name = member.discord_username?.trim() || "Unknown member";
            const initial = name.charAt(0).toUpperCase();

            return (
              <CarouselItem key={member.user_id} className="pl-3 basis-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/members/${member.user_id}`}
                      aria-label={name}
                      className="block transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    >
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={member.avatar_url ?? undefined}
                          alt={name}
                        />
                        <AvatarFallback>{initial}</AvatarFallback>
                      </Avatar>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="-left-4 top-1/2" />
        <CarouselNext className="-right-4 top-1/2" />
      </Carousel>
    </TooltipProvider>
  );
}
