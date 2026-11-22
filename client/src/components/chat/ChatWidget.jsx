import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatMessage from './ChatMessage';
import { api, ApiError } from '@/lib/api';
import { OPEN_CHAT_EVENT } from '@/lib/chatBus';

const MAX_INPUT = 500;

function errorCodeOf(error) {
  if (error instanceof ApiError) return error.data?.error?.code || 'unknown';
  if (error?.name === 'TypeError') return 'network'; // fetch không tới được server
  return 'unknown';
}

// Widget chat nổi của KAT. Trình duyệt chỉ gọi POST /api/chat; khóa Gemini nằm hoàn toàn ở server.
export default function ChatWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content, error? }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const launcherRef = useRef(null);

  const pendingPromptRef = useRef(null);

  // Cho phép nút "Hỏi KAT" ở trang chủ hoặc trang chi tiết mở widget (và gửi sẵn câu hỏi nếu có)
  useEffect(() => {
    const onOpen = (event) => {
      setOpen(true);
      const prompt = event?.detail?.prompt;
      if (typeof prompt === 'string' && prompt.trim()) {
        pendingPromptRef.current = prompt.trim();
      }
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  // Hủy yêu cầu đang chạy khi widget bị gỡ
  useEffect(() => () => abortRef.current?.abort(), []);

  // Tự cuộn xuống tin mới nhất
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape đóng widget và trả focus về nút mở
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const send = useCallback(
    async (rawText) => {
      const text = rawText.trim().slice(0, MAX_INPUT);
      if (!text || loading) return;

      // Chỉ gửi lịch sử hợp lệ: bỏ các bong bóng lỗi
      const history = messages
        .filter((m) => !m.error)
        .map(({ role, content }) => ({ role, content }));
      const next = [...messages, { role: 'user', content: text }];
      setMessages(next);
      setInput('');
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await api.post(
          '/chat',
          { messages: [...history, { role: 'user', content: text }] },
          { signal: controller.signal },
        );
        setMessages([...next, { role: 'assistant', content: data.reply }]);
      } catch (error) {
        if (error?.name === 'AbortError') return;
        const code = errorCodeOf(error);
        setMessages([
          ...next,
          {
            role: 'assistant',
            error: true,
            content: t(`kat.errors.${code}`, { defaultValue: t('kat.errors.unknown') }),
          },
        ]);
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, loading, t],
  );

  useEffect(() => {
    if (open && pendingPromptRef.current && !loading) {
      const prompt = pendingPromptRef.current;
      pendingPromptRef.current = null;
      send(prompt);
    }
  }, [open, loading, send]);

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setLoading(false);
    inputRef.current?.focus();
  };

  const onSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  const suggestions = t('kat.suggestions', { returnObjects: true });
  const showSuggestions = messages.length === 0 && Array.isArray(suggestions);

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label={t('kat.name')}
          className="fixed bottom-24 right-4 z-[60] flex h-[min(34rem,calc(100svh-7.5rem))] w-[calc(100vw-2rem)] max-w-sm animate-fade-down flex-col overflow-hidden rounded-3xl border bg-surface shadow-soft sm:right-6"
        >
          <header className="flex items-center gap-3 border-b bg-brand px-4 py-3 text-brand-fg">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-fg/15">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold leading-none">{t('kat.name')}</p>
              <p className="mt-1 truncate text-xs opacity-80">{t('kat.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label={t('kat.reset')}
              title={t('kat.reset')}
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-brand-fg/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-fg"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label={t('kat.close')}
              title={t('kat.close')}
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-brand-fg/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-fg"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            <ChatMessage role="assistant" content={t('kat.welcome')} />

            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} error={message.error} />
            ))}

            {loading && (
              <div className="flex justify-start" role="status" aria-label={t('kat.thinking')}>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border bg-surface-2 px-4 py-3">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-2 w-2 animate-bounce rounded-full bg-muted"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {showSuggestions && (
              <div className="pt-1">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {t('kat.suggestionsLabel')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => send(question)}
                      disabled={loading}
                      className="rounded-full border bg-bg px-3 py-1.5 text-left text-xs text-fg transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t bg-surface p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={MAX_INPUT}
                placeholder={t('kat.placeholder')}
                aria-label={t('kat.placeholder')}
                className="min-w-0 flex-1 rounded-full border bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label={t('kat.send')}
                title={t('kat.send')}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-brand-fg transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] leading-snug text-muted">{t('kat.disclaimer')}</p>
          </form>
        </section>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? t('kat.close') : t('kat.open')}
        className="fixed bottom-5 right-4 z-[60] flex h-14 items-center gap-2 rounded-full bg-brand px-5 text-brand-fg shadow-soft transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:right-6"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="font-display text-base font-semibold">{t('kat.name')}</span>
      </button>
    </>
  );
}
