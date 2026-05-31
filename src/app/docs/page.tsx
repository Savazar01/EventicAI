import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdown(content: string): string {
  const lines = content.split("\n");
  let html = "";
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!inTable) {
        inTable = true;
        html += '<div class="overflow-x-auto mb-4"><table class="w-full text-sm border-collapse border border-slate-200">';
        if (lines[i + 1]?.trim().match(/^\|[\s\-:|]+\|$/)) {
          const cells = trimmed.split("|").filter(Boolean);
          html += "<thead><tr>";
          for (const cell of cells) {
            html += `<th class="border border-slate-200 px-3 py-2 bg-slate-50 font-semibold text-left">${escapeHtml(cell.trim())}</th>`;
          }
          html += "</tr></thead><tbody>";
          i++;
        } else {
          html += "<tbody>";
        }
      }
      if (trimmed.startsWith("|") && trimmed !== "---" && !trimmed.match(/^\|[\s\-:|]+\|$/)) {
        const cells = trimmed.split("|").filter(Boolean);
        html += "<tr>";
        for (const cell of cells) {
          html += `<td class="border border-slate-200 px-3 py-2">${escapeHtml(cell.trim())}</td>`;
        }
        html += "</tr>";
      }
      continue;
    } else if (inTable) {
      inTable = false;
      html += "</tbody></table></div>";
    }

    if (trimmed === "---") {
      html += '<hr class="my-8 border-slate-200" />';
    } else if (trimmed.startsWith("# ")) {
      html += `<h1 class="text-3xl font-extrabold mt-8 mb-4">${escapeHtml(trimmed.slice(2))}</h1>`;
    } else if (trimmed.startsWith("## ")) {
      html += `<h2 class="text-2xl font-bold mt-8 mb-3 text-slate-800">${escapeHtml(trimmed.slice(3))}</h2>`;
    } else if (trimmed.startsWith("### ")) {
      html += `<h3 class="text-xl font-bold mt-6 mb-2 text-slate-700">${escapeHtml(trimmed.slice(4))}</h3>`;
    } else if (trimmed.startsWith("- ")) {
      html += `<li class="ml-4 list-disc text-slate-700 mb-1">${escapeHtml(trimmed.slice(2))}</li>`;
    } else if (trimmed === "") {
      html += "<br />";
    } else {
      html += `<p class="text-slate-700 mb-2 leading-relaxed">${escapeHtml(trimmed)}</p>`;
    }
  }
  if (inTable) html += "</tbody></table></div>";

  return html;
}

export default async function DocsPage() {
  const filePath = path.join(process.cwd(), "Documentation", "User Documentation.md");
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    content = "# Documentation\n\nDocumentation file not found.";
  }

  const html = renderMarkdown(content);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        .prose pre { background: #f1f5f9; padding: 1rem; border-radius: 0.75rem; overflow-x: auto; font-size: 0.875rem; }
        .prose code { background: #f1f5f9; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875rem; }
        .prose table { min-width: 100%; }
        .prose th, .prose td { font-size: 0.875rem; }
      `}</style>
    </div>
  );
}
