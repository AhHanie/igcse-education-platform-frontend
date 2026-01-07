import * as React from "react";

import { useAppStore } from "@/app/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { PaginatedTable } from "@/components/ui/paginated-table";
import { AddStudentModal } from "@/features/student/components/AddStudentModal";
import { BulkUploadModal } from "@/features/student/components/BulkUploadModal";
import type { User } from "@/types/common";

export default function StudentManagementPage() {
  const user = useAppStore((state) => state.user);

  // Assert that user exists and has a school
  if (!user || !user.school) {
    throw new Error("User must be authenticated and belong to a school");
  }
  const [createOpen, setCreateOpen] = React.useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = React.useState(false);

  const [tableKey, setTableKey] = React.useState(0);
  const refreshTable = () => setTableKey((k) => k + 1);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="relative mb-10 flex items-center justify-center">
        <Heading level="h2" as="h1">
          Student Management
        </Heading>

        <div className="absolute right-0 flex gap-2">
          <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
            Bulk Upload Students
          </Button>
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
        userData={{
          shortSchoolName: user.school.short_name as string,
          organizationId: user.organization_id,
          schoolId: user.school_id as string,
        }}
      />

      <BulkUploadModal
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onSuccess={refreshTable}
      />
    </div>
  );
}
