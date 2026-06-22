import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  WorkingThreadSummary,
  WorkingThreadUpdateProposal,
} from "../core/working-thread-contract";
import {
  applyWorkingThreadSectionPatches,
  parseWorkingThreadMarkdown,
  type ParsedWorkingThreadDocument,
  summarizeWorkingThread,
} from "./working-thread-markdown";

export interface WorkingThreadDocsStoreOptions {
  workspaceRoot: string;
}

export interface WorkingThreadDocsStore {
  readonly workspaceRoot: string;
  readonly recordsDir: string;
  listSummaries(): Promise<WorkingThreadSummary[]>;
  readThread(threadId: string): Promise<ParsedWorkingThreadDocument>;
  applySectionPatchProposal(
    proposal: WorkingThreadUpdateProposal,
  ): Promise<ParsedWorkingThreadDocument>;
}

const recordsDirSegments = ["docs", "along", "working-threads"];
const safeThreadIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function createWorkingThreadDocsStore(
  options: WorkingThreadDocsStoreOptions,
): WorkingThreadDocsStore {
  const workspaceRoot = resolveWorkspaceRoot(options.workspaceRoot);
  const recordsDir = path.join(workspaceRoot, ...recordsDirSegments);

  return {
    workspaceRoot,
    recordsDir,

    async listSummaries() {
      const entries = await readdir(recordsDir, { withFileTypes: true }).catch((error: unknown) => {
        if (isNodeError(error) && error.code === "ENOENT") {
          return [];
        }

        throw error;
      });
      const summaries = await Promise.all(entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => name.endsWith(".md") && name !== "README.md")
        .map(async (name) => {
          const threadId = name.slice(0, -".md".length);
          const parsed = await readParsedThread(recordsDir, threadId);
          return summarizeWorkingThread(parsed);
        }));

      return summaries.sort((left, right) => left.id.localeCompare(right.id));
    },

    readThread(threadId) {
      return readParsedThread(recordsDir, threadId);
    },

    async applySectionPatchProposal(proposal) {
      const parsed = await readParsedThread(recordsDir, proposal.threadId);

      if (parsed.malformed || !parsed.thread) {
        throw new Error(`Cannot apply Working Thread proposal to malformed record: ${proposal.threadId}.`);
      }

      if (parsed.thread.lastUpdated !== proposal.baseLastUpdated) {
        throw new Error(
          `Stale Working Thread proposal ${proposal.proposalId}: base last updated ${proposal.baseLastUpdated} does not match current ${parsed.thread.lastUpdated}.`,
        );
      }

      const patchedMarkdown = applyWorkingThreadSectionPatches(
        parsed.rawMarkdown,
        proposal.changes,
      );
      const recordPath = resolveRecordPath(recordsDir, proposal.threadId);
      await writeFile(recordPath, patchedMarkdown, "utf8");

      return parseWorkingThreadMarkdown({
        id: proposal.threadId,
        sourcePath: recordPath,
        markdown: patchedMarkdown,
      });
    },
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function resolveWorkspaceRoot(workspaceRoot: string): string {
  if (!workspaceRoot.trim()) {
    throw new Error("An explicit workspace root is required.");
  }

  const resolved = path.resolve(workspaceRoot);
  if (resolved === path.parse(resolved).root) {
    throw new Error("Workspace root must not be the filesystem root.");
  }

  return resolved;
}

async function readParsedThread(
  recordsDir: string,
  threadId: string,
): Promise<ParsedWorkingThreadDocument> {
  const recordPath = resolveRecordPath(recordsDir, threadId);
  const markdown = await readFile(recordPath, "utf8");

  return parseWorkingThreadMarkdown({
    id: threadId,
    sourcePath: recordPath,
    markdown,
  });
}

function resolveRecordPath(recordsDir: string, threadId: string): string {
  if (!safeThreadIdPattern.test(threadId) || path.isAbsolute(threadId)) {
    throw new Error(`Invalid thread id: ${threadId}.`);
  }

  const resolvedRecordsDir = path.resolve(recordsDir);
  const recordPath = path.resolve(resolvedRecordsDir, `${threadId}.md`);
  const relativePath = path.relative(resolvedRecordsDir, recordPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`Invalid thread id: ${threadId}.`);
  }

  return recordPath;
}
