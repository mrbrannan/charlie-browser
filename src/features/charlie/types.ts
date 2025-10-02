// Types that mirror the data.json in the gist referenced by TEL-101
// Source: https://gist.github.com/rileytomasek/0ca22aaf6df4985befd6779e37dab1a2

export type Provider = 'github' | 'linear';
export type ActorType = 'human' | 'charlie' | 'bot';

export interface WorkflowRef {
  id: string; // e.g., "WF-BOT-5001"
  name: string;
  linearIssueKey: string; // e.g., BOT-5001
  github: { owner: string; repo: string; prNumber: number };
}

export type EventType =
  // Linear issues
  | 'issue.created'
  | 'issue.updated'
  | 'issue.commented'
  | 'issue.labeled'
  | 'issue.assigned'
  | 'issue.status_changed'
  | 'issue.linked'
  | 'issue.closed'
  // GitHub pull requests and related
  | 'pr.opened'
  | 'pr.draft'
  | 'pr.ready_for_review'
  | 'pr.updated'
  | 'pr.labeled'
  | 'pr.review_requested'
  | 'pr.review_submitted'
  | 'pr.commented'
  | 'pr.commit_pushed'
  | 'ci.check_run'
  | 'pr.merged'
  | 'pr.closed';

export interface Actor {
  id: string;
  displayName: string;
  handle?: string;
  type: ActorType;
}

export type EntityKind = 'issue' | 'pull_request' | 'review' | 'check_run' | 'commit';

export interface EntityRef {
  kind: EntityKind;
  provider: Provider;
  // Optional fields that appear depending on provider/kind
  id?: string;
  key?: string; // e.g., BOT-5001 for Linear issue
  owner?: string;
  repo?: string;
  number?: number; // GitHub issue/PR number
  title?: string;
  url?: string;
}

// Payload is intentionally loose; we expose only the UI-relevant fields used in the gist
export interface EventPayload {
  text?: string;
  description?: string;
  labelsAdded?: string[];
  reviewersAdded?: string[];
  assigneesAdded?: string[];
  branch?: string;
  status?: { from: string; to: string };
  link?: { type: string; url: string; number?: number; title?: string };
  review?: { state: string; body?: string };
}

export interface ActivityEvent {
  id: string;
  ts: string; // ISO date
  provider: Provider;
  type: EventType;
  workflowId: string;
  sequence: number;
  actor: Actor;
  entity: EntityRef;
  payload?: EventPayload;
}

export interface InterviewData {
  schemaVersion: number;
  workflows: WorkflowRef[];
  events: ActivityEvent[];
}
