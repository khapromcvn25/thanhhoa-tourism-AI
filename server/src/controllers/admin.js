import { pinMatches } from '../lib/auth.js';
import { validatePlace } from '../lib/validate.js';
import { HttpError, badRequest } from '../lib/httpError.js';

export function createAdminController({ store, tokens, adminPin }) {
  const validated = (body, options) => {
    const { value, errors } = validatePlace(body, options);
    if (errors.length) {
      throw badRequest(errors[0], { code: 'validation_failed', details: errors });
    }
    return value;
  };

  return {
    login(req, res) {
      if (!adminPin) {
        throw new HttpError(503, 'Trang quản trị chưa được bật (thiếu ADMIN_PIN trên server)', {
          code: 'admin_disabled',
        });
      }
      const pin = req.body?.pin;
      if (typeof pin !== 'string' || pin.length === 0 || pin.length > 100) {
        throw badRequest('Vui lòng nhập mã PIN', { code: 'invalid_pin' });
      }
      if (!pinMatches(pin, adminPin)) {
        throw new HttpError(401, 'Mã PIN không đúng', { code: 'invalid_pin' });
      }
      const { token, expiresAt } = tokens.issue();
      res.json({ token, expiresAt });
    },

    session(req, res) {
      res.json({ ok: true });
    },

    async create(req, res) {
      const value = validated(req.body, { requireSlug: true });
      const place = await store.create(value);
      res.status(201).json({ place });
    },

    async update(req, res) {
      const value = validated({ ...req.body, slug: req.params.slug }, { requireSlug: false });
      const place = await store.update(req.params.slug, value);
      res.json({ place });
    },

    async remove(req, res) {
      await store.remove(req.params.slug);
      res.status(204).end();
    },
  };
}
