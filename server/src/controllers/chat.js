import { askGemini, buildSystemPrompt, sanitizeMessages } from '../lib/gemini.js';
import { HttpError } from '../lib/httpError.js';

export function createChatController({ store, apiKey, model, ask = askGemini }) {
  return {
    async reply(req, res) {
      const contents = sanitizeMessages(req.body?.messages);
      if (!contents.length) {
        throw new HttpError(400, 'Vui lòng nhập câu hỏi', { code: 'empty_message' });
      }

      const reply = await ask({
        apiKey,
        model,
        systemPrompt: buildSystemPrompt(store.list()),
        contents,
      });
      res.json({ reply });
    },
  };
}
