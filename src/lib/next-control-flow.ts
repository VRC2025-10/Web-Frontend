import { unstable_rethrow } from "next/navigation";

export function rethrowIfNextControlFlow(error: unknown) {
  unstable_rethrow(error);
}