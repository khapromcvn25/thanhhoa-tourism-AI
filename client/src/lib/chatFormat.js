// Phân tích Markdown rất nhỏ trong câu trả lời của KAT thành các khối để React tự render
// (không dùng dangerouslySetInnerHTML nên không có nguy cơ XSS).
// Hỗ trợ: đoạn văn, danh sách gạch đầu dòng (-, *, •), danh sách đánh số, **in đậm**.

const BULLET = /^\s*(?:[-*•])\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

export function parseBlocks(text) {
  const blocks = [];
  let current = null;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  for (const rawLine of String(text || '').replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }

    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);

    if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      if (!current || current.type !== type) {
        flush();
        current = { type, items: [] };
      }
      current.items.push((bullet || numbered)[1]);
      continue;
    }

    const heading = HEADING.exec(line);
    const content = heading ? `**${heading[1].replace(/\*+/g, '')}**` : line.trim();

    if (current && current.type === 'p') current.text += `\n${content}`;
    else {
      flush();
      current = { type: 'p', text: content };
    }
  }
  flush();
  return blocks;
}

// Tách chuỗi thành các đoạn { text, bold } theo cú pháp **...**
export function parseInline(text) {
  const parts = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), bold: false });
    parts.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts.length ? parts : [{ text, bold: false }];
}
