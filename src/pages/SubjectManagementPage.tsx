import * as React from "react";

import { useAppStore } from "@/app/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { PaginatedTable } from "@/components/ui/paginated-table";
import { AddSubjectModal } from "@/features/subject/components/AddSubjectModal";
import { useToast } from "@/components/ui/toast";
import type { Subject } from "@/features/subject/types";

export default function SubjectManagementPage() {
  const user = useAppStore((state) => state.user);
  const { success } = useToast();

  // Assert that user exists
  if (!user) {
    throw new Error("User must be authenticated");
  }

  const [createOpen, setCreateOpen] = React.useState(false);
  const [tableKey, setTableKey] = React.useState(0);

  const handleSubjectCreated = () => {
    setTableKey((k) => k + 1);
    success("Subject created", "The new subject has been added successfully.");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="relative mb-10 flex items-center justify-center">
        <Heading level="h2" as="h1">
          Subject Management
        </Heading>

        <div className="absolute right-0 flex gap-2">
          <Button variant="outline" onClick={() => setCreateOpen(true)}>
            Add New Subject
          </Button>
        </div>
      </div>

      <Separator className="mb-10" />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">IGCSE Subjects</CardTitle>
        </CardHeader>

        <CardContent>
          <PaginatedTable<Subject>
            key={tableKey}
            endpoint="/subjects"
            getRowKey={(s) => s.id}
            initialPageSize={10}
            columns={[
              {
                id: "code",
                header: "Subject Code",
                cell: (s) => (
                  <span className="font-mono font-medium text-foreground">
                    {s.code}
                  </span>
                ),
              },
              {
                id: "name",
                header: "Subject Name",
                cell: (s) => s.name,
              },
            ]}
          />
        </CardContent>
      </Card>

      <AddSubjectModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleSubjectCreated}
      />
    </div>
  );
}
