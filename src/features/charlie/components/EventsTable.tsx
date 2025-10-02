"use client";

import { useMemo } from 'react';
import {
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
} from '@heroui/react';
import type { ActivityEvent } from '../types';

function formatWhen(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

function entityLabel(e: ActivityEvent['entity']): string {
  if (e.kind === 'issue' && e.key) return e.key;
  if (e.kind === 'pull_request' && e.owner && e.repo && e.number != null) {
    return `${e.owner}/${e.repo}#${e.number}`;
  }
  return e.title ?? e.id ?? e.url ?? e.kind;
}

function summarize(ev: ActivityEvent): string | undefined {
  const p = ev.payload;
  if (!p) return undefined;
  if (p.text) return p.text;
  if (p.description) return p.description;
  if (p.labelsAdded?.length) return `labels: ${p.labelsAdded.join(', ')}`;
  if (p.reviewersAdded?.length) return `reviewers: ${p.reviewersAdded.join(', ')}`;
  if (p.assigneesAdded?.length) return `assignees: ${p.assigneesAdded.join(', ')}`;
  if (p.status) return `status: ${p.status.from} → ${p.status.to}`;
  if (p.link?.url) return `${p.link.type}: ${p.link.url}`;
  if (p.branch) return `branch: ${p.branch}`;
  if (p.review?.state) return `review: ${p.review.state}`;
  return undefined;
}

export function EventsTable({ events }: { events: ActivityEvent[] }) {
  // Group events by logical entity key (PRs + reviews coalesce) and sort each
  // group chronologically so we can derive the latest event and the journey
  // a given entity has taken up to that point.
  const eventsByEntity = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    for (const ev of events) {
      const k = getEntityKey(ev);
      if (!k) continue;
      const list = map.get(k) ?? [];
      list.push(ev);
      map.set(k, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    }
    return map;
  }, [events]);

  // Build a map of labels per logical entity across all events, so each row can
  // render the union of labels for its entity (deduped, sorted).
  const labelsByEntity = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const ev of events) {
      const k = getEntityKey(ev);
      if (!k) continue;
      const labels = ev.payload?.labelsAdded ?? [];
      if (!labels.length) continue;
      let set = map.get(k);
      if (!set) {
        set = new Set<string>();
        map.set(k, set);
      }
      for (const l of labels) set.add(l);
    }
    // Convert to Map<string, string[]> with stable sort
    return new Map(
      Array.from(map.entries()).map(([k, v]) => [k, Array.from(v).sort((a, b) => a.localeCompare(b))]),
    );
  }, [events]);

  // Prepare a "Latest per entity" view: one row per entity using its newest
  // event plus a derived journey string like "Created -> Todo -> In‑Progress".
  const latestRows = useMemo(() => {
    const rows: { key: string; latest: ActivityEvent; journey?: string }[] = [];
    for (const [key, list] of eventsByEntity) {
      const latest = list[list.length - 1];
      rows.push({ key, latest, journey: buildJourney(list) });
    }
    rows.sort((a, b) => new Date(b.latest.ts).getTime() - new Date(a.latest.ts).getTime());
    return rows;
  }, [eventsByEntity]);

  // Group the latest rows by their latest event type so that each entity
  // appears in exactly one tab — the tab for its most recent event type.
  const { latestByType, latestTypeKeys } = useMemo(() => {
    const map = new Map<string, { key: string; latest: ActivityEvent; journey?: string }[]>();
    for (const row of latestRows) {
      const t = row.latest.type;
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(row); // preserve newest-first order from latestRows
    }
    return { latestByType: map, latestTypeKeys: Array.from(map.keys()).sort() };
  }, [latestRows]);

  return (
    <Tabs color="primary" variant="underlined" aria-label="Latest events grouped by type">
      {latestTypeKeys.map((t) => (
        <Tab key={t} title={`${t} (${latestByType.get(t)?.length ?? 0})`}>
          <Table aria-label={`Entities whose latest event is ${t}`}>
            <TableHeader>
              <TableColumn key="when">When</TableColumn>
              <TableColumn key="provider">Provider</TableColumn>
              <TableColumn key="actor">Actor</TableColumn>
              <TableColumn key="entity">Entity</TableColumn>
              <TableColumn key="labels">Labels</TableColumn>
              <TableColumn key="summary">Summary</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No events">
              {(latestByType.get(t) ?? []).map(({ key: eKey, latest, journey }) => {
                const label = entityLabel(latest.entity);
                const labels = labelsByEntity.get(eKey) ?? [];
                const shown = labels.slice(0, 5);
                const hidden = labels.slice(5);
                return (
                  <TableRow key={eKey}>
                    <TableCell>{formatWhen(latest.ts)}</TableCell>
                    <TableCell className="capitalize">{latest.provider}</TableCell>
                    <TableCell>{latest.actor.displayName}</TableCell>
                    <TableCell>
                      {latest.entity.url ? (
                        <a
                          className="text-primary hover:underline"
                          href={latest.entity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {label}
                        </a>
                      ) : (
                        label
                      )}
                    </TableCell>
                    <TableCell>
                      {shown.map((l) => (
                        <Chip
                          key={`${eKey}:${l}`}
                          color={colorFor(l)}
                          size="sm"
                          className="mr-1 mb-1"
                          variant="flat"
                        >
                          {l}
                        </Chip>
                      ))}
                      {hidden.length > 0 && (
                        <Tooltip content={hidden.join(', ')}>
                          <Chip
                            size="sm"
                            variant="bordered"
                            className="mr-1 mb-1"
                            tabIndex={0}
                            aria-label={`+${hidden.length} more labels: ${hidden.join(', ')}`}
                          >
                            +{hidden.length}
                          </Chip>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{summarize(latest) ?? '—'}</div>
                      {journey && (
                        <div className="text-default-500 text-small mt-1" aria-label={`Journey: ${journey}`}>
                          {journey}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Tab>
      ))}
    </Tabs>
  );
}

// Chip color mapping seeded by label text for consistency across rows.
const LABEL_COLORS = ['primary', 'secondary', 'success', 'warning', 'danger'] as const;
type LabelColor = (typeof LABEL_COLORS)[number];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0; // force 32‑bit
  }
  return Math.abs(h);
}

function colorFor(label: string): LabelColor {
  return LABEL_COLORS[hashString(label) % LABEL_COLORS.length];
}

// Build a stable entity key. Prefer explicit ids; otherwise, construct a
// deterministic composite from provider/kind and the most specific fields.
function getEntityKey(ev: ActivityEvent): string | undefined {
  const e = ev.entity;
  if (e.id) return e.id;
  if (e.kind === 'pull_request' && e.owner && e.repo && e.number != null) {
    return `${ev.provider}:${e.kind}:${e.owner}/${e.repo}#${e.number}`;
  }
  if (e.kind === 'review' && e.owner && e.repo && e.number != null) {
    // Map reviews to the parent PR key so labels/events coalesce per PR
    return `${ev.provider}:pull_request:${e.owner}/${e.repo}#${e.number}`;
  }
  if (e.kind === 'issue' && e.key) {
    return `${ev.provider}:${e.kind}:${e.key}`;
  }
  // Prefer URL-only over title to avoid instability when titles change
  if (e.url) return `${ev.provider}:${e.kind}:${e.url}`;
  return `${ev.provider}:${e.kind}`;
}

// Produce a compact journey string based on the sequence of events for an entity.
// Examples:
//   issue: "Created -> Todo -> In-Progress -> Closed"
//   pr:    "Opened -> Ready for review -> Approved -> Merged"
function buildJourney(list: ActivityEvent[]): string | undefined {
  if (!list.length) return undefined;
  const steps: string[] = [];
  const kind = list[0]?.entity.kind;
  const push = (s: string) => {
    if (!s) return;
    if (steps[steps.length - 1] !== s) steps.push(s);
  };
  for (const ev of list) {
    if (ev.entity.kind !== kind) continue; // safety if mixed
    switch (ev.type) {
      // Linear issue journey
      case 'issue.created':
        push('Created');
        break;
      case 'issue.status_changed':
        if (ev.payload?.status?.to) push(ev.payload.status.to);
        break;
      case 'issue.closed':
        push('Closed');
        break;

      // PR journey
      case 'pr.opened':
        push('Opened');
        break;
      case 'pr.draft':
        push('Draft');
        break;
      case 'pr.ready_for_review':
        push('Ready for review');
        break;
      case 'pr.review_requested':
        push('Review requested');
        break;
      case 'pr.review_submitted': {
        const st = ev.payload?.review?.state?.toLowerCase();
        if (st === 'approved') push('Approved');
        else if (st === 'changes_requested') push('Changes requested');
        else push('Reviewed');
        break;
      }
      case 'pr.merged':
        push('Merged');
        break;
      case 'pr.closed':
        push('Closed');
        break;
      default:
        // ignore other event types for journey compactness
        break;
    }
  }
  return steps.length ? steps.join(' \u2192 ') : undefined; // → arrow
}
