// Generates docs/PROJECT-REPORT.docx from docs/PROJECT-REPORT.md
//
// The markdown file is the single source of truth. This script converts it to a
// Word document so the .docx always reflects the current report. Re-run after
// editing the markdown:  npm run build   (from docs/report-gen/)
//
// No system binaries needed — uses the `docx` npm package.

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "PROJECT-REPORT.md");
const OUT = join(here, "..", "PROJECT-REPORT.docx");

const md = readFileSync(SRC, "utf-8");
const lines = md.split("\n");

const children = [];

// --- inline formatting: handle **bold** and `code` ---
function inlineRuns(text) {
  const runs = [];
  // split on bold or inline-code tokens, keeping delimiters
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== "");
  for (const part of parts) {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (/^`[^`]+`$/.test(part)) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: "Consolas", size: 20 }));
    } else {
      runs.push(new TextRun(part));
    }
  }
  return runs.length ? runs : [new TextRun(text)];
}

function headingLevel(hashes) {
  switch (hashes) {
    case 1:
      return HeadingLevel.TITLE;
    case 2:
      return HeadingLevel.HEADING_1;
    case 3:
      return HeadingLevel.HEADING_2;
    default:
      return HeadingLevel.HEADING_3;
  }
}

// --- markdown table -> docx table ---
function makeTable(rows) {
  // rows: array of arrays of cell strings; first row is header
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (cells, r) =>
        new TableRow({
          children: cells.map(
            (cell) =>
              new TableCell({
                borders,
                shading: r === 0 ? { fill: "F0F2F5" } : undefined,
                children: [
                  new Paragraph({
                    children: inlineRuns(cell.trim()).map(
                      (run) =>
                        new TextRun({
                          text: run.text ?? "",
                          bold: r === 0 ? true : run.bold,
                          font: run.font,
                          size: run.size,
                        })
                    ),
                  }),
                ],
              })
          ),
        })
    ),
  });
}

function parseTableRow(line) {
  // "| a | b |" -> ["a","b"]
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

let i = 0;
while (i < lines.length) {
  const line = lines[i];

  // fenced code block
  if (line.startsWith("```")) {
    i++;
    const code = [];
    while (i < lines.length && !lines[i].startsWith("```")) {
      code.push(lines[i]);
      i++;
    }
    i++; // skip closing fence
    for (const cl of code) {
      children.push(
        new Paragraph({
          shading: { fill: "0D1117" },
          children: [new TextRun({ text: cl || " ", font: "Consolas", size: 18, color: "C9D1D9" })],
        })
      );
    }
    continue;
  }

  // table block (header line followed by |---| separator)
  if (line.trim().startsWith("|") && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
    const rows = [parseTableRow(line)];
    i += 2; // skip header + separator
    while (i < lines.length && lines[i].trim().startsWith("|")) {
      rows.push(parseTableRow(lines[i]));
      i++;
    }
    children.push(makeTable(rows));
    children.push(new Paragraph({ text: "" }));
    continue;
  }

  // heading
  const h = line.match(/^(#{1,6})\s+(.*)$/);
  if (h) {
    children.push(
      new Paragraph({
        heading: headingLevel(h[1].length),
        children: inlineRuns(h[2]),
        spacing: { before: 160, after: 80 },
      })
    );
    i++;
    continue;
  }

  // horizontal rule
  if (/^---+$/.test(line.trim())) {
    children.push(new Paragraph({ text: "", border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD" } } }));
    i++;
    continue;
  }

  // blockquote
  if (line.trim().startsWith(">")) {
    children.push(
      new Paragraph({
        children: inlineRuns(line.replace(/^\s*>\s?/, "")),
        indent: { left: 360 },
        shading: { fill: "FFF8E1" },
      })
    );
    i++;
    continue;
  }

  // bullet / numbered list
  const bullet = line.match(/^\s*[-*]\s+(.*)$/);
  const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
  if (bullet) {
    let text = bullet[1];
    // render markdown task checkboxes as clear done/to-do markers
    let prefixRuns = [];
    const doneBox = text.match(/^\[x\]\s+(.*)$/i);
    const openBox = text.match(/^\[ \]\s+(.*)$/);
    if (doneBox) {
      prefixRuns = [new TextRun({ text: "\u2713 ", bold: true, color: "0A7227" })];
      text = doneBox[1];
    } else if (openBox) {
      prefixRuns = [new TextRun({ text: "\u2610 ", bold: true, color: "B4232C" })];
      text = openBox[1];
    }
    children.push(
      new Paragraph({ children: [...prefixRuns, ...inlineRuns(text)], bullet: { level: 0 } })
    );
    i++;
    continue;
  }
  if (numbered) {
    children.push(new Paragraph({ children: inlineRuns(numbered[1]), numbering: undefined, bullet: { level: 0 } }));
    i++;
    continue;
  }

  // blank line
  if (line.trim() === "") {
    children.push(new Paragraph({ text: "" }));
    i++;
    continue;
  }

  // normal paragraph
  children.push(new Paragraph({ children: inlineRuns(line) }));
  i++;
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
    },
  },
  sections: [{ children }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync(OUT, buffer);
console.log("Wrote", OUT, `(${buffer.length} bytes) from PROJECT-REPORT.md`);
