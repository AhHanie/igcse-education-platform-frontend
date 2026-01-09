import * as React from "react";
import { MoreHorizontal, FileUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { PaginatedTable } from "@/components/ui/paginated-table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { AddDocumentModal } from "@/features/document/components/AddDocumentModal";
import { useSubjectsStore } from "@/features/subject/store/useSubjectsStore";
import { documentApi } from "@/features/document/api/documents";
import { ingestionApi } from "@/features/ingestion/api/ingestions";
import type { Document } from "@/features/document/types";

export default function DocumentsManagementPage() {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [tableKey, setTableKey] = React.useState(0);
  const refreshTable = () => setTableKey((k) => k + 1);
  const { success, error } = useToast();

  // Fetch subjects for mapping subject_id to subject name
  const { subjects, fetchSubjects } = useSubjectsStore();

  React.useEffect(() => {
    fetchSubjects().catch(() => {
      // Error handled by store
    });
  }, [fetchSubjects]);

  // Create a subject map for quick lookup
  const subjectMap = React.useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    subjects.forEach((subject) => {
      map.set(subject.id, { code: subject.code, name: subject.name });
    });
    return map;
  }, [subjects]);

  // Handle document ingestion
  const handleIngest = async (documentId: string) => {
    try {
      const response = await ingestionApi.start(documentId);
      success("Ingestion Started", response.message);
      refreshTable();
    } catch (err) {
      console.error("Failed to ingest document:", err);
      error(
        "Ingestion Failed",
        err instanceof Error ? err.message : "Failed to start document ingestion"
      );
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await documentApi.delete(documentId);
      success("Document Deleted", "Document has been deleted successfully");
      refreshTable();
    } catch (err) {
      console.error("Failed to delete document:", err);
      error(
        "Delete Failed",
        err instanceof Error ? err.message : "Failed to delete document"
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="relative mb-10 flex items-center justify-center">
        <Heading level="h2" as="h1">
          Document Management
        </Heading>

        <div className="absolute right-0">
          <Button variant="outline" onClick={() => setCreateOpen(true)}>
            Add New Document
          </Button>
        </div>
      </div>

      <Separator className="mb-10" />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Uploaded Documents</CardTitle>
        </CardHeader>

        <CardContent>
          <PaginatedTable<Document>
            key={tableKey}
            endpoint="/documents"
            getRowKey={(doc) => doc.id}
            initialPageSize={10}
            columns={[
              {
                id: "title",
                header: "Title",
                cell: (doc) => (
                  <span className="font-medium text-foreground">
                    {doc.title}
                  </span>
                ),
              },
              {
                id: "subject",
                header: "Subject",
                cell: (doc) => {
                  if (!doc.subject_id) {
                    return <span className="text-muted-foreground">N/A</span>;
                  }
                  const subject = subjectMap.get(doc.subject_id);
                  return subject ? (
                    <span>
                      {subject.code} - {subject.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-mono text-xs">
                      {doc.subject_id}
                    </span>
                  );
                },
              },
              {
                id: "created_at",
                header: "Created At",
                cell: (doc) => {
                  const date = new Date(doc.created_at);
                  return (
                    <span className="text-muted-foreground text-sm">
                      {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </span>
                  );
                },
              },
              {
                id: "status",
                header: "Status",
                cell: (doc) => (
                  <span className="text-sm capitalize">
                    {doc.status || "uploaded"}
                  </span>
                ),
              },
              {
                id: "actions",
                header: "Actions",
                cell: (doc) => (
                  <Dropdown>
                    <DropdownTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownContent align="end">
                      {doc.status === "uploaded" && (
                        <DropdownItem
                          onClick={() => handleIngest(doc.id)}
                          className="cursor-pointer"
                        >
                          <FileUp className="mr-2 h-4 w-4" />
                          Ingest
                        </DropdownItem>
                      )}
                      <DropdownItem
                        onClick={() => handleDelete(doc.id)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <AddDocumentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refreshTable}
      />
    </div>
  );
}
