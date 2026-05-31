type PdfRuntimeGlobal = typeof globalThis & {
  DOMMatrix?: typeof DOMMatrix;
  ImageData?: typeof ImageData;
  Path2D?: typeof Path2D;
};

class ServerDOMMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;

  constructor(init?: number[] | { a?: number; b?: number; c?: number; d?: number; e?: number; f?: number }) {
    if (Array.isArray(init)) {
      [this.a, this.b, this.c, this.d, this.e, this.f] = [
        init[0] ?? 1,
        init[1] ?? 0,
        init[2] ?? 0,
        init[3] ?? 1,
        init[4] ?? 0,
        init[5] ?? 0,
      ];
      return;
    }

    if (init) {
      this.a = init.a ?? this.a;
      this.b = init.b ?? this.b;
      this.c = init.c ?? this.c;
      this.d = init.d ?? this.d;
      this.e = init.e ?? this.e;
      this.f = init.f ?? this.f;
    }
  }

  get is2D() {
    return true;
  }

  get isIdentity() {
    return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.e === 0 && this.f === 0;
  }

  get m11() {
    return this.a;
  }

  get m12() {
    return this.b;
  }

  get m21() {
    return this.c;
  }

  get m22() {
    return this.d;
  }

  get m41() {
    return this.e;
  }

  get m42() {
    return this.f;
  }

  private assign(matrix: ServerDOMMatrix) {
    this.a = matrix.a;
    this.b = matrix.b;
    this.c = matrix.c;
    this.d = matrix.d;
    this.e = matrix.e;
    this.f = matrix.f;
    return this;
  }

  multiply(other?: number[] | ServerDOMMatrix) {
    const matrix = other instanceof ServerDOMMatrix ? other : new ServerDOMMatrix(other);
    return new ServerDOMMatrix([
      this.a * matrix.a + this.c * matrix.b,
      this.b * matrix.a + this.d * matrix.b,
      this.a * matrix.c + this.c * matrix.d,
      this.b * matrix.c + this.d * matrix.d,
      this.a * matrix.e + this.c * matrix.f + this.e,
      this.b * matrix.e + this.d * matrix.f + this.f,
    ]);
  }

  multiplySelf(other?: number[] | ServerDOMMatrix) {
    return this.assign(this.multiply(other));
  }

  preMultiplySelf(other?: number[] | ServerDOMMatrix) {
    return this.assign(new ServerDOMMatrix(other).multiply(this));
  }

  translate(tx = 0, ty = 0) {
    return this.multiply([1, 0, 0, 1, tx, ty]);
  }

  translateSelf(tx = 0, ty = 0) {
    return this.assign(this.translate(tx, ty));
  }

  scale(scaleX = 1, scaleY = scaleX) {
    return this.multiply([scaleX, 0, 0, scaleY, 0, 0]);
  }

  scaleSelf(scaleX = 1, scaleY = scaleX) {
    return this.assign(this.scale(scaleX, scaleY));
  }

  rotate(angle = 0) {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return this.multiply([cos, sin, -sin, cos, 0, 0]);
  }

  rotateSelf(angle = 0) {
    return this.assign(this.rotate(angle));
  }

  skewX(angle = 0) {
    return this.multiply([1, 0, Math.tan((angle * Math.PI) / 180), 1, 0, 0]);
  }

  skewY(angle = 0) {
    return this.multiply([1, Math.tan((angle * Math.PI) / 180), 0, 1, 0, 0]);
  }

  inverse() {
    const determinant = this.a * this.d - this.b * this.c;

    if (!determinant) {
      return new ServerDOMMatrix([NaN, NaN, NaN, NaN, NaN, NaN]);
    }

    return new ServerDOMMatrix([
      this.d / determinant,
      -this.b / determinant,
      -this.c / determinant,
      this.a / determinant,
      (this.c * this.f - this.d * this.e) / determinant,
      (this.b * this.e - this.a * this.f) / determinant,
    ]);
  }

  invertSelf() {
    return this.assign(this.inverse());
  }

  transformPoint(point: { x?: number; y?: number } = {}) {
    const x = point.x ?? 0;
    const y = point.y ?? 0;
    return {
      x: this.a * x + this.c * y + this.e,
      y: this.b * x + this.d * y + this.f,
    };
  }

  toString() {
    return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
  }
}

class ServerImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(dataOrWidth: Uint8ClampedArray | number, width?: number, height?: number) {
    if (typeof dataOrWidth === "number") {
      this.width = dataOrWidth;
      this.height = width ?? 0;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
      return;
    }

    this.data = dataOrWidth;
    this.width = width ?? 0;
    this.height = height ?? 0;
  }
}

class ServerPath2D {
  addPath() {}
  closePath() {}
  lineTo() {}
  moveTo() {}
  rect() {}
}

function installPdfRuntimePolyfills() {
  const runtime = globalThis as PdfRuntimeGlobal;

  if (typeof runtime.DOMMatrix === "undefined") {
    runtime.DOMMatrix = ServerDOMMatrix as unknown as typeof DOMMatrix;
  }

  if (typeof runtime.ImageData === "undefined") {
    runtime.ImageData = ServerImageData as unknown as typeof ImageData;
  }

  if (typeof runtime.Path2D === "undefined") {
    runtime.Path2D = ServerPath2D as unknown as typeof Path2D;
  }
}

async function loadPdfWorker() {
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
}

export async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!buffer.length) {
    throw new Error("The uploaded resume file is empty.");
  }

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    installPdfRuntimePolyfills();
    await loadPdfWorker();
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
