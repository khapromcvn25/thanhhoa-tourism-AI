import fs from 'node:fs/promises';
import path from 'node:path';
import { conflict, notFoundError } from './httpError.js';

// Kho dữ liệu địa điểm dạng file JSON. Phù hợp quy mô vài chục địa điểm với một tiến trình server.
// - Ghi nguyên tử (ghi file tạm rồi rename) để không bao giờ để lại file nửa chừng.
// - Mọi thao tác ghi đi qua một hàng đợi nên hai request admin cùng lúc không đè nhau.
// - Lần đầu chạy, tự sao chép từ file mẫu (places.seed.json).

export class PlaceStore {
  constructor({ dataFile, seedFile }) {
    this.dataFile = dataFile;
    this.seedFile = seedFile;
    this.places = [];
    this.queue = Promise.resolve();
    this.ready = false;
  }

  async init() {
    let raw;
    try {
      raw = await fs.readFile(this.dataFile, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const seed = await fs.readFile(this.seedFile, 'utf8');
      const parsedSeed = this.#parse(seed, this.seedFile);
      await this.#write(parsedSeed);
      this.places = parsedSeed;
      this.ready = true;
      return;
    }
    // Nếu file hỏng, ném lỗi thay vì âm thầm ghi đè mất dữ liệu của người dùng
    this.places = this.#parse(raw, this.dataFile);
    this.ready = true;
  }

  #parse(raw, source) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      throw new Error(`File dữ liệu không phải JSON hợp lệ (${source}): ${error.message}`);
    }
    if (!data || !Array.isArray(data.places)) {
      throw new Error(`File dữ liệu thiếu mảng "places" (${source})`);
    }
    return data.places;
  }

  async #write(places) {
    const dir = path.dirname(this.dataFile);
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${this.dataFile}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify({ places }, null, 2)}\n`, 'utf8');
    try {
      await fs.rename(tmp, this.dataFile);
    } catch (error) {
      await fs.rm(tmp, { force: true });
      throw error;
    }
  }

  // Chạy fn(places hiện tại) -> { places mới, result }. Chỉ cập nhật bộ nhớ sau khi ghi file thành công.
  #mutate(fn) {
    const run = this.queue.then(async () => {
      const { places, result } = fn(this.places);
      await this.#write(places);
      this.places = places;
      return result;
    });
    // Giữ hàng đợi sống kể cả khi một thao tác thất bại
    this.queue = run.catch(() => {});
    return run;
  }

  #sorted(list) {
    return [...list].sort(
      (a, b) => (a.order ?? 9999) - (b.order ?? 9999) || a.slug.localeCompare(b.slug),
    );
  }

  list({ category } = {}) {
    const items = category ? this.places.filter((p) => p.category === category) : this.places;
    return structuredClone(this.#sorted(items));
  }

  get(slug) {
    const found = this.places.find((p) => p.slug === slug);
    return found ? structuredClone(found) : null;
  }

  create(value) {
    return this.#mutate((current) => {
      if (current.some((p) => p.slug === value.slug)) {
        throw conflict(`Slug "${value.slug}" đã tồn tại`, { code: 'slug_taken' });
      }
      const maxOrder = current.reduce((max, p) => Math.max(max, p.order ?? 0), 0);
      const place = {
        ...value,
        order: value.order ?? maxOrder + 1,
        updatedAt: new Date().toISOString(),
      };
      return { places: [...current, place], result: structuredClone(place) };
    });
  }

  update(slug, value) {
    return this.#mutate((current) => {
      const index = current.findIndex((p) => p.slug === slug);
      if (index === -1) throw notFoundError('Không tìm thấy địa điểm', { code: 'place_not_found' });
      const previous = current[index];
      // Slug là định danh trong URL nên không đổi khi cập nhật
      const place = {
        ...previous,
        ...value,
        slug: previous.slug,
        order: value.order ?? previous.order,
        updatedAt: new Date().toISOString(),
      };
      const places = [...current];
      places[index] = place;
      return { places, result: structuredClone(place) };
    });
  }

  remove(slug) {
    return this.#mutate((current) => {
      if (!current.some((p) => p.slug === slug)) {
        throw notFoundError('Không tìm thấy địa điểm', { code: 'place_not_found' });
      }
      return { places: current.filter((p) => p.slug !== slug), result: true };
    });
  }
}
