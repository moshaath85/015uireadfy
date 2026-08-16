import "server-only";

import ExcelJS from "exceljs";
import type { BulkImportModule } from "@/lib/cms/bulk-import-export";

/** Conservative limits for untrusted workbook input. */
export const XLSX_MAX_BYTES = 8 * 1024 * 1024; // 8 MB
export const XLSX_MAX_ROWS = 10_000;
export const XLSX_MAX_COLUMNS = 200;

export interface XlsxParseResult {
  readonly rows: readonly Record<string, string>[];
  /** Human-readable, non-fatal notices (e.g. unknown headers, sheet chosen). */
  readonly notices: readonly string[];
}

/** The label a module maps to a sheet name, e.g. artists → "Artists". */
function sheetNameForModule(module: BulkImportModule): string {
  switch (module) {
    case "artists":
      return "Artists";
    case "artworks":
      return "Artworks";
    case "exhibitions":
      return "Exhibitions";
    case "collections":
      return "Collections";
    case "projects":
      return "Projects";
    case "services":
      return "Services";
    case "news":
      return "News";
    case "publications":
      return "Publications";
  }
}

/** Return a cell's resolved value, never a formula string. */
function cellValue(cell: ExcelJS.Cell): string {
  if (cell.value === null || cell.value === undefined) return "";

  // Formula cells: resolve to the cached result if present, otherwise empty.
  if (typeof cell.value === "object" && "result" in cell.value) {
    const v = cell.value.result;
    if (v === null || v === undefined) return "";
    return String(v);
  }

  if (cell.value instanceof Date) {
    return cell.value.toISOString().slice(0, 10);
  }

  return String(cell.value);
}

/**
 * Parse a binary .xlsx workbook into the canonical BulkRow[] shape.
 *
 * Sheet selection:
 *  - when a module is supplied, prefer the sheet whose name matches the module
 *    (e.g. "Artists"), then fall back to the first non-empty sheet;
 *  - an empty workbook, or a workbook with no data rows, yields zero rows.
 *
 * Header handling: row 1 is treated as the header row. Headers are trimmed and
 * unknown columns are ignored with a notice (existing importer behaviour —
 * validation runs downstream in importBulkRows, never duplicated here).
 */
export async function parseXlsxWorkbook(
  bytes: Uint8Array,
  module: BulkImportModule,
): Promise<XlsxParseResult> {
  const notices: string[] = [];
  const workbook = new ExcelJS.Workbook();

  try {
    const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    await workbook.xlsx.load(buffer as unknown as Parameters<ExcelJS.Workbook["xlsx"]["load"]>[0]);
  } catch {
    throw new Error(
      `Sheet: (workbook)\nRow: -\nColumn: -\nValue: -\nError: File is not a valid .xlsx workbook.\nExpected: a modern Excel .xlsx file saved from the Gallery 015 template.`,
    );
  }

  if (workbook.worksheets.length === 0) {
    throw new Error(
      `Sheet: (workbook)\nRow: -\nColumn: -\nValue: -\nError: Workbook contains no worksheets.\nExpected: at least one worksheet with a header row.`,
    );
  }

  const moduleLabel = sheetNameForModule(module);
  let sheet =
    workbook.getWorksheet(moduleLabel) ??
    workbook.worksheets.find((ws) => ws.name.trim().toLowerCase() === moduleLabel.toLowerCase());

  // Fall back to the first non-empty worksheet.
  if (!sheet) {
    sheet = workbook.worksheets.find((ws) => ws.rowCount > 1) ?? workbook.worksheets[0];
    if (sheet) {
      notices.push(`Sheet: ${sheet.name} — no sheet named "${moduleLabel}" was found; used "${sheet.name}".`);
    }
  }

  if (!sheet) {
    return { rows: [], notices };
  }

  const headerRow = sheet.getRow(1);
  if (!headerRow || headerRow.cellCount === 0) {
    return { rows: [], notices };
  }

  // Normalize headers: trim, drop empties, de-duplicate.
  const headers: Array<{ key: string; index: number }> = [];
  const seen = new Set<string>();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const raw = String(cellValue(cell)).trim();
    if (!raw) return;
    let key = raw;
    let n = 2;
    while (seen.has(key)) {
      key = `${raw}_${n}`;
      n += 1;
    }
    seen.add(key);
    headers.push({ key, index: colNumber });
  });

  if (headers.length === 0) {
    return { rows: [], notices };
  }

  if (headers.length > XLSX_MAX_COLUMNS) {
    throw new Error(
      `Sheet: ${sheet.name}\nRow: 1\nColumn: -\nValue: ${headers.length} columns\nError: Too many columns.\nExpected: at most ${XLSX_MAX_COLUMNS} columns.`,
    );
  }

  const rows: Array<Record<string, string>> = [];
  const maxRow = Math.min(sheet.rowCount, XLSX_MAX_ROWS + 1);

  for (let r = 2; r <= maxRow; r += 1) {
    const row = sheet.getRow(r);
    // Skip fully-empty rows.
    let hasAny = false;
    const record: Record<string, string> = {};
    for (const { key, index } of headers) {
      const cell = row.getCell(index);
      const value = cellValue(cell).trim();
      if (value) hasAny = true;
      record[key] = value;
    }
    if (hasAny) rows.push(record);
  }

  if (sheet.rowCount - 1 > XLSX_MAX_ROWS) {
    notices.push(`Sheet: ${sheet.name} — ${sheet.rowCount - 1} data rows exceed the ${XLSX_MAX_ROWS}-row limit; only the first ${XLSX_MAX_ROWS} were read.`);
  }

  return { rows, notices };
}
