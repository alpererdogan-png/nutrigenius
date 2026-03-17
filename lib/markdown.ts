export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function extractTOC(markdown: string): TOCItem[] {
  const items: TOCItem[] = [];
  const normalised = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalised.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      items.push({ id: slugify(text), text, level });
    }
  }
  return items;
}

export function markdownToHtml(markdown: string): string {
  let html = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Tables
  html = html.replace(
    /\n(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)*)/g,
    (_match, table) => {
      const rows = table.trim().split("\n");
      const headerCells = rows[0]
        .split("|")
        .filter((c: string) => c.trim())
        .map((c: string) => `<th class="px-4 py-2 text-left text-sm font-semibold text-[#1A2332] border-b border-[#E8ECF1]">${c.trim()}</th>`)
        .join("");
      const bodyRows = rows
        .slice(2)
        .map((row: string) => {
          const cells = row
            .split("|")
            .filter((c: string) => c.trim())
            .map((c: string) => `<td class="px-4 py-2 text-sm text-[#374151] border-b border-[#F1F5F9]">${c.trim()}</td>`)
            .join("");
          return `<tr class="hover:bg-[#F9FBFC]">${cells}</tr>`;
        })
        .join("");
      return `\n<div class="overflow-x-auto my-6 rounded-xl border border-[#E8ECF1]"><table class="w-full border-collapse"><thead><tr class="bg-[#F8FAFC]">${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>\n`;
    }
  );

  // Headings
  html = html.replace(/^##### (.+)$/gm, '<h5 class="text-sm font-semibold text-[#1A2332] mt-4 mb-1">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold text-[#1A2332] mt-5 mb-2">$1</h4>');
  html = html.replace(/^### (.+)$/gm, (_, text) => {
    const id = slugify(text);
    return `<h3 id="${id}" class="text-lg font-bold text-[#1A2332] mt-8 mb-3 scroll-mt-24">${text}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_, text) => {
    const id = slugify(text);
    return `<h2 id="${id}" class="text-xl font-bold text-[#1A2332] mt-10 mb-4 scroll-mt-24">${text}</h2>`;
  });

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#1A2332]">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-[#F1F5F9] text-[#0D9488] text-sm px-1.5 py-0.5 rounded font-mono">$1</code>');

  // Blockquotes
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="border-l-4 border-[#0D9488] pl-4 italic text-[#5A6578] my-4">$1</blockquote>'
  );

  // Lists
  // Unordered
  html = html.replace(
    /((?:^[ \t]*[-*+] .+\n?)+)/gm,
    (match) => {
      const items = match
        .trim()
        .split("\n")
        .map((line) => line.replace(/^[ \t]*[-*+] /, "").trim())
        .filter(Boolean)
        .map((item) => `<li class="flex gap-2 items-start"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0D9488] flex-shrink-0"></span><span>${item}</span></li>`)
        .join("");
      return `<ul class="space-y-2 my-4 text-[#374151]">${items}</ul>\n`;
    }
  );

  // Ordered
  html = html.replace(
    /((?:^\d+\. .+\n?)+)/gm,
    (match) => {
      let i = 1;
      const items = match
        .trim()
        .split("\n")
        .map((line) => line.replace(/^\d+\. /, "").trim())
        .filter(Boolean)
        .map((item) => `<li class="flex gap-3 items-start"><span class="flex-shrink-0 w-6 h-6 rounded-full bg-teal-50 text-[#0D9488] text-xs font-bold flex items-center justify-center mt-0.5">${i++}</span><span>${item}</span></li>`)
        .join("");
      return `<ol class="space-y-2 my-4 text-[#374151]">${items}</ol>\n`;
    }
  );

  // Paragraphs (lines not already in a tag)
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<[h|u|o|b|d|t]/.test(trimmed)) return trimmed;
      return `<p class="text-[#374151] leading-relaxed my-4">${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}
