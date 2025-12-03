import type { Json } from '@supabase/supabase-js';

const baseStyles = `
  <style>
    * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { margin: 0; padding: 24px; color: #111827; }
    h1, h2, h3, h4 { color: #0f172a; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
    .section { margin-bottom: 32px; }
    .images { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 12px; margin-top: 16px; }
    .images img { width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; }
    .toc { margin-bottom: 24px; }
    .toc li { margin-bottom: 6px; }
    .playbook-rules { list-style: decimal; padding-left: 20px; margin-top: 12px; }
  </style>
`;

type ImagePayload = {
  url?: string | null;
  path?: string | null;
  name?: string | null;
};

export const parseImageList = (raw: Json | null): ImagePayload[] => {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'object' && item !== null) {
        return {
          url: 'url' in item ? (item.url as string | null) : null,
          path: 'path' in item ? (item.path as string | null) : null,
          name: 'name' in item ? (item.name as string | null) : null,
        };
      }
      return null;
    })
    .filter(Boolean) as ImagePayload[];
};

export const journalHtml = (params: {
  title: string;
  dateLabel: string;
  content: string;
  author?: string;
  imageUrls: string[];
}) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${params.title}</title>
      ${baseStyles}
    </head>
    <body>
      <h1>${params.title}</h1>
      <p class="meta">
        ${params.author ? `${params.author} • ` : ''}${params.dateLabel}
      </p>
      <div class="section">
        ${params.content || '<p>No content provided.</p>'}
      </div>
      ${
        params.imageUrls.length
          ? `<div class="section images">
              ${params.imageUrls.map((url) => `<img src="${url}" />`).join('')}
             </div>`
          : ''
      }
    </body>
  </html>
`;

export const allJournalsHtml = (params: {
  author?: string;
  entries: Array<{ title: string; dateLabel: string; content: string; images: string[] }>;
}) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Journal Export</title>
      ${baseStyles}
    </head>
    <body>
      <h1>Journal Export</h1>
      <p class="meta">
        ${params.author ? `${params.author} • ` : ''}${new Date().toLocaleString()}
      </p>
      <div class="section">
        <h3>Table of Contents</h3>
        <ol class="toc">
          ${params.entries.map((entry, idx) => `<li>${entry.title} — ${entry.dateLabel}</li>`).join('')}
        </ol>
      </div>
      ${params.entries
        .map(
          (entry) => `
          <div class="section">
            <h2>${entry.title}</h2>
            <p class="meta">${entry.dateLabel}</p>
            ${entry.content || '<p>No content provided.</p>'}
            ${
              entry.images.length
                ? `<div class="images">
                    ${entry.images.map((url) => `<img src="${url}" />`).join('')}
                  </div>`
                : ''
            }
          </div>
        `
        )
        .join('')}
    </body>
  </html>
`;

export const playbookHtml = (params: {
  title: string;
  description: string;
  tags: string[];
  rules: Array<{ text: string }>;
  author?: string;
  imageUrls: string[];
}) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${params.title}</title>
      ${baseStyles}
    </head>
    <body>
      <h1>${params.title}</h1>
      <p class="meta">${params.author ?? ''}</p>
      ${
        params.tags.length
          ? `<p class="meta">Tags: ${params.tags.join(', ')}</p>`
          : ''
      }
      <div class="section">
        ${params.description || '<p>No description.</p>'}
      </div>
      <div class="section">
        <h3>Execution Checklist</h3>
        <ol class="playbook-rules">
          ${params.rules.map((rule) => `<li>${rule.text}</li>`).join('')}
        </ol>
      </div>
      ${
        params.imageUrls.length
          ? `<div class="section images">
              ${params.imageUrls.map((url) => `<img src="${url}" />`).join('')}
            </div>`
          : ''
      }
    </body>
  </html>
`;

