import * as React from "react";

import { apiClient } from "@/app/api/client";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type ColumnDef<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T, rowIndex: number) => React.ReactNode;
  headClassName?: string;
  cellClassName?: string;
};

type ApiQueryValue = string | number | boolean | null | undefined;
type ApiQuery = Record<string, ApiQueryValue>;

function toQueryString(query: ApiQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export type PaginatedTableProps<T> = {
  className?: string;

  columns: Array<ColumnDef<T>>;
  /**
   * If provided, used for stable row keys. If omitted, index is used.
   */
  getRowKey?: (row: T, rowIndex: number) => React.Key;

  /**
   * Either provide fetchPage OR provide endpoint (+ optional mapResponse).
   */
  fetchPage?: (args: {
    page: number;
    pageSize: number;
  }) => Promise<PaginatedResult<T>>;

  endpoint?: string;
  /**
   * Extra query params appended to the request.
   * page/pageSize are added automatically.
   */
  query?: ApiQuery;
  /**
   * Customize backend param names if your API differs.
   */
  pageParam?: string;
  pageSizeParam?: string;
  /**
   * Map any API response to { items, total }.
   * Defaults to:
   *   - { items, total } OR { data, total }
   */
  mapResponse?: (payload: unknown) => PaginatedResult<T>;

  /**
   * Pagination UI defaults
   */
  initialPage?: number; // 1-based
  initialPageSize?: number;
  pageSizeOptions?: number[];

  /**
   * Optional: show a custom empty state
   */
  emptyState?: React.ReactNode;

  /**
   * Optional: called when a successful response is received
   */
  onLoaded?: (result: PaginatedResult<T>) => void;
};

export function PaginatedTable<T>({
  className,
  columns,
  getRowKey,

  fetchPage,
  endpoint,
  query,
  pageParam = "page",
  pageSizeParam = "pageSize",
  mapResponse,

  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],

  emptyState = (
    <div className="text-muted-foreground py-10 text-center text-sm">
      No results.
    </div>
  ),

  onLoaded,
}: PaginatedTableProps<T>) {
  const [page, setPage] = React.useState<number>(Math.max(1, initialPage));
  const [pageSize, setPageSize] = React.useState<number>(initialPageSize);

  const [items, setItems] = React.useState<T[]>([]);
  const [total, setTotal] = React.useState<number>(0);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Keep page within bounds when total/pageSize changes
  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const resolvedMapResponse = React.useMemo(() => {
    if (mapResponse) return mapResponse;
    return (payload: unknown): PaginatedResult<T> => {
      const p = payload as any;
      if (p && Array.isArray(p.items) && typeof p.total === "number") {
        return { items: p.items as T[], total: p.total as number };
      }
      if (p && Array.isArray(p.data) && typeof p.total === "number") {
        return { items: p.data as T[], total: p.total as number };
      }
      throw new Error("Unable to map response. Provide mapResponse().");
    };
  }, [mapResponse]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    try {
      let result: PaginatedResult<T>;

      if (fetchPage) {
        result = await fetchPage({ page, pageSize });
      } else {
        if (!endpoint) {
          throw new Error("Provide either fetchPage or endpoint.");
        }

        const fullQuery: ApiQuery = {
          ...(query ?? {}),
          [pageParam]: page,
          [pageSizeParam]: pageSize,
        };

        const payload = await apiClient.get<unknown>(
          `${endpoint}${toQueryString(fullQuery)}`,
          { signal: controller.signal }
        );

        result = resolvedMapResponse(payload);
      }

      setItems(result.items);
      setTotal(result.total);
      onLoaded?.(result);
    } catch (e: any) {
      // Ignore abort
      if (e?.name === "AbortError") return;
      setError(e?.message ? String(e.message) : "Failed to load data.");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [
    fetchPage,
    endpoint,
    query,
    pageParam,
    pageSizeParam,
    page,
    pageSize,
    resolvedMapResponse,
    onLoaded,
  ]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={cn("space-y-3", className)} data-slot="paginated-table">
      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner size="sm" />
              Loading…
            </span>
          ) : (
            <span>
              Showing {from}–{to} of {total}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-muted-foreground text-sm">Rows</label>
          <select
            className={cn(
              "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            value={pageSize}
            onChange={(e) => {
              const next = Number(e.target.value);
              setPageSize(next);
              setPage(1);
            }}
            disabled={loading}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={() => setPage(1)}
            disabled={loading || page <= 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || page <= 1}
          >
            Prev
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Page</span>
            <Input
              className="h-10 w-20"
              inputMode="numeric"
              value={String(page)}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                const next = raw ? Number(raw) : 1;
                setPage(Math.min(Math.max(1, next), totalPages));
              }}
              disabled={loading}
            />
            <span className="text-muted-foreground text-sm">
              of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={loading || page >= totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(totalPages)}
            disabled={loading || page >= totalPages}
          >
            Last
          </Button>

          <Button variant="ghost" onClick={() => load()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.id} className={c.headClassName}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {!loading && error && (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10">
                <div className="text-destructive text-center text-sm">
                  {error}
                </div>
              </TableCell>
            </TableRow>
          )}

          {!loading && !error && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                {emptyState}
              </TableCell>
            </TableRow>
          )}

          {items.map((row, rowIndex) => (
            <TableRow key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}>
              {columns.map((c) => (
                <TableCell key={c.id} className={c.cellClassName}>
                  {c.cell(row, rowIndex)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/*
Example Usage:
import { apiClient } from "@/app/api/client";
import { PaginatedTable } from "@/components/ui/paginated-table"

type LogRow = { id: string; message: string; createdAt: string }

export function LogsTable() {
  return (
    <PaginatedTable<LogRow>
      fetchPage={async ({ page, pageSize }) => {
        const payload = await apiClient.get<any>(
          `/logs?page=${page}&pageSize=${pageSize}`
        )
        return { items: payload.items, total: payload.total }
      }}
      getRowKey={(r) => r.id}
      columns={[
        { id: "msg", header: "Message", cell: (r) => r.message },
        { id: "ts", header: "Created", cell: (r) => r.createdAt },
      ]}
    />
  )
}
*/
