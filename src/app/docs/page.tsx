import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface HeaderItem {
  id: string;
  text: string;
  level: number;
}

function parseInlineMarkdown(text: string): string {
  // 1. Escape HTML
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Parse inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200">$1</code>');

  // 3. Parse bold: **text** or __text__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong class="font-bold text-slate-900">$1</strong>');

  // 4. Parse italic: *text* or _text_
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-800">$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em class="italic text-slate-800">$1</em>');

  // 5. Parse links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[var(--brand-violet)] hover:underline font-semibold" target="_blank" rel="noopener noreferrer">$1</a>');

  return html;
}

function generateSlug(text: string): string {
  const clean = text
    .replace(/\*\*|__/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  return clean
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseMarkdown(content: string): { html: string; headers: HeaderItem[] } {
  const lines = content.split("\n");
  let html = "";
  let inTable = false;
  const headers: HeaderItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // 1. Table Parser
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) {
        inTable = true;
        html += '<div class="overflow-x-auto my-6 rounded-2xl border border-slate-200 shadow-sm bg-white"><table class="w-full text-sm border-collapse">';
        if (lines[i + 1]?.trim().match(/^\|[\s\-:|]+\|$/)) {
          const cells = trimmed.split("|").filter(Boolean);
          html += '<thead class="bg-slate-50 border-b border-slate-200"><tr>';
          for (const cell of cells) {
            html += `<th class="px-4 py-3 font-semibold text-slate-700 text-left border-r last:border-0 border-slate-200">${parseInlineMarkdown(cell.trim())}</th>`;
          }
          html += "</tr></thead><tbody>";
          i++; // Skip delimiter
        } else {
          html += "<tbody>";
        }
      } else if (trimmed.startsWith("|") && trimmed !== "---" && !trimmed.match(/^\|[\s\-:|]+\|$/)) {
        const cells = trimmed.split("|").filter(Boolean);
        html += '<tr class="border-b last:border-0 border-slate-100 hover:bg-slate-50/50 transition-colors">';
        for (const cell of cells) {
          html += `<td class="px-4 py-3 text-slate-600 border-r last:border-0 border-slate-100">${parseInlineMarkdown(cell.trim())}</td>`;
        }
        html += "</tr>";
      }
      continue;
    } else if (inTable) {
      inTable = false;
      html += "</tbody></table></div>";
    }

    // 2. Blockquote / Alert Parser
    if (trimmed.startsWith(">")) {
      let contentVal = trimmed.slice(1).trim();
      let alertClass = "border-l-4 border-[var(--brand-violet)] bg-slate-50 text-slate-700";
      let title = "";

      if (contentVal.startsWith("[!IMPORTANT]")) {
        alertClass = "border-l-4 border-amber-500 bg-amber-50/50 text-amber-900";
        contentVal = contentVal.replace("[!IMPORTANT]", "").trim();
        title = "IMPORTANT";
      } else if (contentVal.startsWith("[!WARNING]")) {
        alertClass = "border-l-4 border-red-500 bg-red-50/50 text-red-900";
        contentVal = contentVal.replace("[!WARNING]", "").trim();
        title = "WARNING";
      } else if (contentVal.startsWith("[!CAUTION]")) {
        alertClass = "border-l-4 border-rose-600 bg-rose-50/50 text-rose-950";
        contentVal = contentVal.replace("[!CAUTION]", "").trim();
        title = "CAUTION";
      } else if (contentVal.startsWith("[!NOTE]")) {
        alertClass = "border-l-4 border-blue-500 bg-blue-50/50 text-blue-900";
        contentVal = contentVal.replace("[!NOTE]", "").trim();
        title = "NOTE";
      } else if (contentVal.startsWith("[!TIP]")) {
        alertClass = "border-l-4 border-emerald-500 bg-emerald-50/50 text-emerald-900";
        contentVal = contentVal.replace("[!TIP]", "").trim();
        title = "TIP";
      }

      html += `<div class="p-4 rounded-r-2xl my-5 ${alertClass}">`;
      if (title) {
        html += `<div class="font-bold text-xs uppercase tracking-wider mb-1">${title}</div>`;
      }
      html += `<p class="leading-relaxed text-sm">${parseInlineMarkdown(contentVal)}</p></div>`;
      continue;
    }

    // 3. Horizontal Rule
    if (trimmed === "---") {
      html += '<hr class="my-8 border-slate-200" />';
      continue;
    }

    // 4. Header Parsers
    if (trimmed.startsWith("# ")) {
      const text = trimmed.slice(2).trim();
      const id = generateSlug(text);
      headers.push({ id, text, level: 1 });
      html += `<h1 id="${id}" class="text-3xl font-extrabold mt-10 mb-5 text-slate-900 border-b border-slate-200 pb-2 scroll-mt-24 tracking-tight">${parseInlineMarkdown(text)}</h1>`;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3).trim();
      const id = generateSlug(text);
      headers.push({ id, text, level: 2 });
      html += `<h2 id="${id}" class="text-2xl font-bold mt-8 mb-4 text-slate-800 border-b border-slate-100 pb-1 scroll-mt-24 tracking-tight">${parseInlineMarkdown(text)}</h2>`;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).trim();
      const id = generateSlug(text);
      headers.push({ id, text, level: 3 });
      html += `<h3 id="${id}" class="text-xl font-semibold mt-6 mb-3 text-slate-700 scroll-mt-24 tracking-tight">${parseInlineMarkdown(text)}</h3>`;
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      const text = trimmed.slice(5).trim();
      const id = generateSlug(text);
      headers.push({ id, text, level: 4 });
      html += `<h4 id="${id}" class="text-lg font-semibold mt-4 mb-2 text-slate-700 scroll-mt-24 tracking-tight">${parseInlineMarkdown(text)}</h4>`;
      continue;
    }

    // 5. Unordered List Items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const contentVal = trimmed.slice(2).trim();
      html += `<li class="ml-6 list-disc text-slate-600 mb-2 leading-relaxed text-sm">${parseInlineMarkdown(contentVal)}</li>`;
      continue;
    }

    // 6. Ordered List Items
    const matchOrdered = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (matchOrdered) {
      const num = matchOrdered[1];
      const contentVal = matchOrdered[2];
      html += `<li class="ml-6 list-decimal text-slate-600 mb-2 leading-relaxed text-sm">${parseInlineMarkdown(contentVal)}</li>`;
      continue;
    }

    // 7. Empty line spacer
    if (trimmed === "") {
      html += '<div class="h-2"></div>';
      continue;
    }

    // 8. Regular Paragraphs
    html += `<p class="text-slate-600 mb-4 leading-relaxed text-sm">${parseInlineMarkdown(trimmed)}</p>`;
  }

  if (inTable) {
    html += "</tbody></table></div>";
  }

  return { html, headers };
}

export default async function DocsPage() {
  const filePath = path.join(process.cwd(), "Documentation", "User Documentation.md");
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    content = "# Documentation\n\nDocumentation file not found.";
  }

  const { html, headers } = parseMarkdown(content);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <style dangerouslySetInnerHTML={{ __html: `
        html { scroll-behavior: smooth; }
        .docs-content li { margin-left: 1.5rem; }
        .docs-content li::marker { color: var(--brand-violet); }
      `}} />

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Table of Contents Sidebar */}
        <aside className="lg:w-64 shrink-0 lg:sticky lg:top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Table of Contents</p>
          <nav className="space-y-1.5">
            {headers.map((h) => {
              if (h.level > 3) return null;
              
              const levelClasses = 
                h.level === 1 ? "font-bold text-slate-800 text-sm" :
                h.level === 2 ? "pl-3 text-slate-600 text-xs font-medium" :
                "pl-6 text-slate-500 text-xs";

              return (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className="block hover:text-[var(--brand-violet)] transition-colors py-0.5 truncate font-medium text-slate-500 hover:text-slate-900 border-l border-transparent hover:border-slate-300 pl-3 -ml-px"
                  style={{ 
                    paddingLeft: `${(h.level - 1) * 0.75 + 0.75}rem`,
                    fontSize: h.level === 1 ? '0.875rem' : '0.75rem',
                    fontWeight: h.level === 1 ? 600 : 400
                  }}
                  title={h.text}
                >
                  {h.text}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Document Content */}
        <main className="flex-1 min-w-0">
          <div
            className="docs-content prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </main>
      </div>
    </div>
  );
}
