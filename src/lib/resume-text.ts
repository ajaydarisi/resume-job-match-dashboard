// Polyfill DOMMatrix for pdfjs-dist in Node.js/Vercel serverless
if (typeof globalThis.DOMMatrix === "undefined") {
  // @ts-expect-error - minimal polyfill for pdfjs-dist
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {}
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    skewX() { return this; }
    skewY() { return this; }
    inverse() { return this; }
    transformPoint() { return { x: 0, y: 0 }; }
    toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
  };
}

export async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  if (
    file.type.startsWith("text/") ||
    file.name.toLowerCase().endsWith(".txt") ||
    file.name.toLowerCase().endsWith(".md")
  ) {
    return buffer.toString("utf8").trim();
  }

  throw new Error("Upload a PDF, TXT, or Markdown resume.");
}
