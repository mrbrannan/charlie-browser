"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchInterviewData } from '@/features/charlie/api';
import { WorkflowsTable } from '@/features/charlie/components/WorkflowsTable';
import { EventsTable } from '@/features/charlie/components/EventsTable';

export function CharlieClient() {
  const q = useQuery({
    queryKey: ['charlie-interview-data'],
    queryFn: ({ signal }) => fetchInterviewData(signal),
    staleTime: 60_000,
  });

  if (q.isLoading) {
    return <div className="skeleton h-14 w-full rounded-lg" />;
  }
  if (q.isError) {
    const err = q.error;
    const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
    return (
      <div role="alert" className="text-danger">
        Failed to load data: {message}
      </div>
    );
  }

  if (!q.data) {
    return (
      <div role="alert" className="text-danger">
        No data returned
      </div>
    );
  }
  const data = q.data;
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-medium mb-2">Workflows</h2>
        <WorkflowsTable workflows={data.workflows} />
      </section>
      <section>
        <h2 className="text-xl font-medium mb-2">Events</h2>
        <EventsTable events={data.events} />
      </section>
    </div>
  );
}
