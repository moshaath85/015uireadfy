import type { ReactNode } from "react";

import { EmptyState } from "./EmptyState";

export interface DataTableColumn<Row> {
  readonly key: string;
  readonly header: ReactNode;
  readonly render: (row: Row) => ReactNode;
}

export interface DataTableProps<Row> {
  readonly caption: string;
  readonly columns: readonly DataTableColumn<Row>[];
  readonly rows: readonly Row[];
  readonly getRowKey: (row: Row, index: number) => string;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  readonly isLoading?: boolean;
  readonly loadingRowCount?: number;
}

function createLoadingRows(count: number): readonly number[] {
  return Array.from({ length: count }, (_, index) => index);
}

export function DataTable<Row>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyTitle = "No records available",
  emptyDescription = "Records will appear here when they are ready.",
  isLoading = false,
  loadingRowCount = 3
}: DataTableProps<Row>) {
  if (!isLoading && rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="admin-data-table" role="region" aria-label={caption}>
      <table className="admin-data-table__table">
        <caption className="admin-data-table__caption">{caption}</caption>
        <thead className="admin-data-table__head">
          <tr className="admin-data-table__row">
            {columns.map((column) => (
              <th className="admin-data-table__header" key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="admin-data-table__body">
          {isLoading
            ? createLoadingRows(loadingRowCount).map((rowIndex) => (
                <tr className="admin-data-table__row" key={`loading-${rowIndex}`}>
                  {columns.map((column) => (
                    <td className="admin-data-table__cell" key={column.key}>
                      <span className="admin-data-table__loading">Loading</span>
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row, rowIndex) => (
                <tr className="admin-data-table__row" key={getRowKey(row, rowIndex)}>
                  {columns.map((column) => (
                    <td className="admin-data-table__cell" key={column.key}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}