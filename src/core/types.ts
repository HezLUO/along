export const presenceStates = [
  "arriving",
  "settling",
  "quiet_focus",
  "gentle_share",
  "rest",
  "wrap_up",
] as const;

export type PresenceState = (typeof presenceStates)[number];
export type Interruptiveness = "quiet" | "balanced" | "talkative";
export type Permission = "read" | "remember" | "suggest" | "act";

export interface ProjectContext {
  repoPath: string;
  repoName: string;
  gitStatus: string;
  recentCommits: string[];
  manifests: Array<{ path: string; content: string }>;
  readme?: string;
  directorySummary: string[];
  testHints: string[];
}

export interface CuriosityItem {
  id: string;
  question: string;
  whyItMatters: string;
  nextProbe: string;
  status: "open" | "resolved" | "deferred";
  relatedProjectArea: string;
  createdFromSession: string;
}

export interface CompanionPlan {
  state: PresenceState;
  sessionId: string;
  learningGoal: string;
  currentActivity: string;
  selectedCuriosity?: CuriosityItem;
  shareLine?: string;
}

export interface JournalEntry {
  sessionId: string;
  date: string;
  triedToUnderstand: string;
  lookedAt: string[];
  nowBelieves: string[];
  stillUnsure: string[];
  nextTime: string;
  noticedAboutSession: string;
}

export interface GraphNode {
  id: string;
  type:
    | "user"
    | "companion"
    | "project"
    | "session"
    | "curiosity"
    | "decision"
    | "learned_fact"
    | "correction"
    | "project_area"
    | "draft";
  label: string;
  properties: Record<string, string>;
  createdAt: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type:
    | "session_produced_curiosity"
    | "curiosity_relates_to_project_area"
    | "user_corrected_assumption"
    | "companion_learned_fact"
    | "decision_supersedes_assumption"
    | "project_shares_pattern_with_project"
    | "companion_wants_to_continue"
    | "draft_addresses_curiosity";
  createdAt: string;
}

export interface AlongSession {
  id: string;
  repoPath: string;
  startedAt: string;
  state: PresenceState;
  plan: CompanionPlan;
  context: ProjectContext;
}
