import { CATEGORIES } from '../lib/validate.js';
import { badRequest, notFoundError } from '../lib/httpError.js';

export function createPlacesController({ store }) {
  return {
    list(req, res) {
      const { category } = req.query;
      if (category !== undefined && !CATEGORIES.includes(category)) {
        throw badRequest(`category phải là một trong: ${CATEGORIES.join(', ')}`, { code: 'invalid_category' });
      }
      res.set('Cache-Control', 'no-cache');
      res.json({ places: store.list({ category }) });
    },

    get(req, res) {
      const place = store.get(req.params.slug);
      if (!place) throw notFoundError('Không tìm thấy địa điểm', { code: 'place_not_found' });
      res.set('Cache-Control', 'no-cache');
      res.json({ place });
    },
  };
}
