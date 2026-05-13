import path from "node:path";
import os from "node:os";

export function getProjectAlongDir(repoPath: string): string {
  return path.join(repoPath, ".along");
}

export function getGlobalAlongDir(homeDir = os.homedir()): string {
  return path.join(homeDir, ".along");
}

export function getProjectGraphDir(repoPath: string): string {
  return path.join(getProjectAlongDir(repoPath), "graph");
}

export function getGlobalGraphDir(homeDir = os.homedir()): string {
  return path.join(getGlobalAlongDir(homeDir), "graph");
}
