export const dynamic = "force-dynamic";

export default function RuntimeErrorPreviewTrigger() {
  throw new Error("Intentional runtime error for preview");
}