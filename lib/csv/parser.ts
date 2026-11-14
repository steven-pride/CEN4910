/**
 * Basic CSV Parser and Generator.
 * Written in straightforward, junior-level TypeScript.
 */

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  rawRows: string[][];
}

/**
 * Parses a raw CSV string into headers and row objects.
 */
export function parseCsv(text: string): ParsedCsv {
  if (!text || text.trim() === "") {
    return { headers: [], rows: [], rawRows: [] };
  }

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  // Normalize line endings
  const cleanText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentField += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if (char === "\n" && !insideQuotes) {
      currentRow.push(currentField.trim());
      // Only add non-empty rows
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  // Push final field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [], rawRows: [] };
  }

  // The first row is headers
  const headers = lines[0].map((h) => h.toLowerCase().trim());
  const dataRows = lines.slice(1);

  const rows: Record<string, string>[] = [];
  for (const line of dataRows) {
    const rowObj: Record<string, string> = {};
    for (let colIdx = 0; colIdx < headers.length; colIdx++) {
      const headerName = headers[colIdx];
      rowObj[headerName] = line[colIdx] ?? "";
    }
    rows.push(rowObj);
  }

  return {
    headers,
    rows,
    rawRows: dataRows,
  };
}
