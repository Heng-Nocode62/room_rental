import type { PaginationInfo } from "../../types/pagination";
import { Button } from "./Button";


interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <p className="text-sm text-slate-500">
        {pagination.totalElements === 0
          ? "No results"
          : `Page ${pagination.page + 1} of ${pagination.totalPages}`}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={pagination.first}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={pagination.last}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
