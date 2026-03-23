import Link from "next/link";
import Image from "next/image";
import { Building2 } from "lucide-react";

interface ClubCardProps {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
}

export function ClubCard({ id, name, description, coverImageUrl }: ClubCardProps) {
  return (
    <Link
      href={`/clubs/${id}`}
      className="group block overflow-hidden rounded-2xl border border-border/50 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative h-40 overflow-hidden sm:h-48">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Building2 className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-lg font-bold sm:text-xl">{name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}
