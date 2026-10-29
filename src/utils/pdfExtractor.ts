import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker for Vite environment
if (typeof window !== 'undefined') {
  try {
    // In modern Vite / browsers, use the bundled worker script URL
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback if URL resolution is restricted
  }
}

export interface PdfValidationResult {
  valid: boolean;
  error?: string;
  fileName?: string;
  fileSizeFormatted?: string;
  fileSizeBytes?: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validates a candidate PDF file before reading or uploading.
 * Checks file presence, extension, MIME type, empty file, and the 5 MB limit.
 */
export function validatePdfFile(file: File | null | undefined): PdfValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected. Please choose a PDF file.' };
  }

  const name = file.name || '';
  const size = file.size;
  const formattedSize = formatFileSize(size);

  if (size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty (0 bytes). Please upload a valid resume PDF.',
      fileName: name,
      fileSizeFormatted: formattedSize,
      fileSizeBytes: size,
    };
  }

  // 5 MB Limit
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  if (size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 5 MB limit (Current: ${formattedSize}). Please choose a smaller PDF.`,
      fileName: name,
      fileSizeFormatted: formattedSize,
      fileSizeBytes: size,
    };
  }

  // File extension and type check
  const isPdfExt = name.toLowerCase().endsWith('.pdf');
  const isPdfMime = file.type === 'application/pdf' || file.type === '';
  if (!isPdfExt || !isPdfMime) {
    return {
      valid: false,
      error: `Unsupported file format (${name.split('.').pop() || 'unknown'}). Only PDF documents (.pdf) are permitted.`,
      fileName: name,
      fileSizeFormatted: formattedSize,
      fileSizeBytes: size,
    };
  }

  return {
    valid: true,
    fileName: name,
    fileSizeFormatted: formattedSize,
    fileSizeBytes: size,
  };
}

/**
 * Fallback lightweight text stream scanner for PDFs
 * Used if pdfjs web worker fails or is blocked by iframe policy.
 */
function extractTextFromPdfStreamFallback(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let raw = '';
  // Convert buffer to string in chunks to avoid call stack limits
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    raw += String.fromCharCode.apply(null, Array.from(chunk));
  }

  // Look for text between parentheses in text blocks: (text) Tj or [(text)] TJ
  const matches: string[] = [];
  const textPattern = /\(([^)]+)\)\s*(?:Tj|TJ|'|")/g;
  let match: RegExpExecArray | null;
  while ((match = textPattern.exec(raw)) !== null) {
    const t = match[1].replace(/\\([()\\])/g, '$1').trim();
    if (t.length > 1 && !/[^\x20-\x7E]/.test(t)) {
      matches.push(t);
    }
  }

  return matches.join(' ');
}

/**
 * Extracts text directly from a text-based PDF file.
 * Returns clean extracted plain text.
 * Throws a clean, user-friendly descriptive error if parsing fails,
 * file is corrupt, or no readable text can be extracted.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const validation = validatePdfFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid PDF file.');
  }

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error('Unable to read file contents. Please ensure the file is accessible and try again.');
  }

  // Validate PDF magic bytes: '%PDF-' (0x25, 0x50, 0x44, 0x46, 0x2D)
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
  const headerStr = String.fromCharCode(...headerBytes);
  if (headerStr !== '%PDF-') {
    throw new Error('The selected file is not a valid PDF document (missing %PDF- header). If you renamed another file to .pdf, please upload an authentic PDF.');
  }

  let fullText = '';

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    if (numPages === 0) {
      throw new Error('The PDF document contains no pages.');
    }

    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageStr = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      
      if (pageStr.trim()) {
        pageTexts.push(pageStr.trim());
      }
    }

    fullText = pageTexts.join('\n\n');
  } catch (err: any) {
    // Attempt fallback stream extraction if pdfjs fails
    try {
      const fallbackText = extractTextFromPdfStreamFallback(arrayBuffer);
      if (fallbackText && fallbackText.length >= 40) {
        fullText = fallbackText;
      } else {
        throw err;
      }
    } catch {
      throw new Error(
        'The PDF could not be read or contains no selectable text (it may be a scanned image or empty). Please use Option 2: Paste Resume Text instead.'
      );
    }
  }

  // Clean extracted text: collapse spaces, normalize linebreaks
  const cleaned = fullText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  // Detect PDFs containing no selectable/readable text
  if (!cleaned || cleaned.length < 30) {
    throw new Error(
      'The PDF could not be read or contains no selectable text (it may be a scanned image or empty). Please use Option 2: Paste Resume Text instead.'
    );
  }

  return cleaned;
}
