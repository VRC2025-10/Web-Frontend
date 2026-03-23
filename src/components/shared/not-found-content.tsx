"use client";

import { StatusPage } from "@/components/shared/status-page";

interface NotFoundContentProps {
  code: string;
  title: string;
  description: string;
  backLabel: string;
}

export function NotFoundContent({ code, title, description, backLabel }: NotFoundContentProps) {
  return (
    <StatusPage
      code={code}
      title={title}
      description={description}
      icon="leaf"
      tone="primary"
      primaryAction={{ label: backLabel, href: "/", variant: "outline" }}
    />
  );
}
