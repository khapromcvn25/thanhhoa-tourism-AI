import { parseBlocks, parseInline } from '@/lib/chatFormat';

function Inline({ text }) {
  return parseInline(text).map((part, index) =>
    part.bold ? <strong key={index}>{part.text}</strong> : <span key={index}>{part.text}</span>,
  );
}

// Hiển thị câu trả lời của KAT: đoạn văn, danh sách và **in đậm**, toàn bộ qua React (không chèn HTML thô).
export default function ChatMessage({ role, content, error = false }) {
  const isUser = role === 'user';

  const bubble = isUser
    ? 'rounded-2xl rounded-br-md bg-brand text-brand-fg'
    : error
      ? 'rounded-2xl rounded-bl-md border border-red-500/30 bg-red-500/10 text-fg'
      : 'rounded-2xl rounded-bl-md border bg-surface-2 text-fg';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] px-4 py-2.5 text-sm leading-relaxed ${bubble}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <div className="space-y-2 break-words">
            {parseBlocks(content).map((block, index) => {
              if (block.type === 'ul') {
                return (
                  <ul key={index} className="list-disc space-y-1 pl-5">
                    {block.items.map((item, i) => (
                      <li key={i}>
                        <Inline text={item} />
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.type === 'ol') {
                return (
                  <ol key={index} className="list-decimal space-y-1 pl-5">
                    {block.items.map((item, i) => (
                      <li key={i}>
                        <Inline text={item} />
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={index} className="whitespace-pre-line">
                  <Inline text={block.text} />
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
