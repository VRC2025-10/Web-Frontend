import { existsSync, rmSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const devRoot = join(projectRoot, ".next", "dev");
const turbopackCacheRoot = join(devRoot, "cache", "turbopack");
const devLockFile = join(devRoot, "lock");

if (existsSync(turbopackCacheRoot)) {
  rmSync(turbopackCacheRoot, { recursive: true, force: true });
}

if (existsSync(devLockFile)) {
  unlinkSync(devLockFile);
}