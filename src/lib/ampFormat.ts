import { AmpDocument } from '@/types/document';

export function serializeToAmp(doc: AmpDocument): string {
  return JSON.stringify(
    {
      ampVersion: '1.0',
      ...doc,
    },
    null,
    2
  );
}

export function deserializeFromAmp(raw: string): AmpDocument {
  const data = JSON.parse(raw);
  const { ampVersion, ...doc } = data;
  return doc as AmpDocument;
}

export function exportToHtml(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; }
    blockquote { border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em; color: #666; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f2f2f2; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;
}

export function exportToText(htmlContent: string): string {
  // Strip HTML tags for plain text export using safe sequential approach
  const withNewlines = htmlContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n');
  // Strip all remaining HTML tags
  const noTags = withNewlines.replace(/<[^>]+>/g, '');
  // Decode HTML entities in a fixed order (most specific to least)
  const decoded = noTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  return decoded.trim();
}
