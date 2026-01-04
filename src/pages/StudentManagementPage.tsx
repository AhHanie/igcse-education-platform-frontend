import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { PaginatedTable } from "@/components/ui/paginated-table";

import { AddStudentModal } from "@/features/student/components/AddStudentModal";

type User = {
  id: string;
  organization_id: string;
  school_id: string;
  username: string;
  email: string | null;
  display_name: string;
  gender: 0 | 1;
  is_active: boolean;
  must_reset: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string | null;
  student_code: string;
};

// TODO: Remove hardcoding once authentication is implemented on frontend side
const SCHOOL_SHORT_NAME = "school";

export default function StudentManagementPage() {
  const [createOpen, setCreateOpen] = React.useState(false);

  const [tableKey, setTableKey] = React.useState(0);
  const refreshTable = () => setTableKey((k) => k + 1);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="relative mb-10 flex items-center justify-center">
        <Heading level="h2" as="h1">
          Student Management
        </Heading>

        <div className="absolute right-0">
          <Button variant="outline" onClick={() => setCreateOpen(true)}>
            Add New Student
          </Button>
        </div>
      </div>

      <Separator className="mb-10" />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Registered Students</CardTitle>
        </CardHeader>

        <CardContent>
          <PaginatedTable<User>
            key={tableKey}
            endpoint="/users"
            getRowKey={(u) => u.id}
            initialPageSize={10}
            query={{ role: "Student" }}
            columns={[
              {
                id: "username",
                header: "Username",
                cell: (u) => (
                  <span className="font-medium text-foreground">
                    {u.username}
                  </span>
                ),
              },
              {
                id: "display_name",
                header: "Display Name",
                cell: (u) => u.display_name,
              },
              {
                id: "student_code",
                header: "Registration Code",
                cell: (u) => (
                  <span className="font-mono">{u.student_code}</span>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <AddStudentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refreshTable}
        schoolShortName={SCHOOL_SHORT_NAME}
      />
    </div>
  );
}
