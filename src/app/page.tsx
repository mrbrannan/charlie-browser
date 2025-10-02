import { Card, CardBody } from "@heroui/react";
import { CharlieClient } from "./charlie/ui-client";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <Card className="max-w-6xl mx-auto border border-divider bg-surface/60 backdrop-blur-md">
        <CardBody className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold">Charlie data explorer</h1>
            <p className="text-muted-foreground">Gist-backed workflows and events</p>
          </header>
          <CharlieClient />
        </CardBody>
      </Card>
    </main>
  );
}
