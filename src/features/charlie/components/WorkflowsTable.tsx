"use client";

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import type { WorkflowRef } from '../types';

export function WorkflowsTable({ workflows }: { workflows: WorkflowRef[] }) {
  return (
    <Table aria-label="Workflows table">
      <TableHeader>
        <TableColumn key="id">ID</TableColumn>
        <TableColumn key="name">Name</TableColumn>
        <TableColumn key="linear">Linear</TableColumn>
        <TableColumn key="github">GitHub PR</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No workflows">
        {workflows.map((wf) => {
          const prUrl = `https://github.com/${encodeURIComponent(wf.github.owner)}/${encodeURIComponent(
            wf.github.repo,
          )}/pull/${wf.github.prNumber}`;
          const linearUrl = `https://linear.app/issue/${encodeURIComponent(wf.linearIssueKey)}`;
          return (
            <TableRow key={wf.id}>
              <TableCell>{wf.id}</TableCell>
              <TableCell>{wf.name}</TableCell>
              <TableCell>
                <a className="text-primary hover:underline" href={linearUrl} target="_blank" rel="noopener noreferrer">
                  {wf.linearIssueKey}
                </a>
              </TableCell>
              <TableCell>
                <a className="text-primary hover:underline" href={prUrl} target="_blank" rel="noopener noreferrer">
                  {wf.github.owner}/{wf.github.repo}#{wf.github.prNumber}
                </a>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
