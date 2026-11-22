import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Save, Trash2 } from 'lucide-react';
import { BilingualField, ImageListEditor, Section, StringListEditor, inputClass } from './fields';
import { adminApi } from '@/lib/adminApi';
import { ADMIN_LANGS, isSameDraft, toDraft, toPayload } from '@/lib/placeForm';
import { slugify } from '@/lib/text';
import { ROUTES } from '@/config/routes';

const CATEGORY_OPTIONS = [
  ['tourism', 'Du lịch'],
  ['cuisine', 'Ẩm thực'],
  ['culture', 'Văn hóa'],
];

// Form sửa nội dung địa điểm. Component được remount (qua `key`) mỗi khi đổi địa điểm đang sửa.
export default function PlaceEditor({ place, token, onSaved, onDeleted, onUnauthorized, onDirtyChange }) {
  const isNew = !place;
  const [draft, setDraft] = useState(() => toDraft(place));
  const [baseline, setBaseline] = useState(() => toDraft(place));
  const [slugTouched, setSlugTouched] = useState(false);
  const [editLang, setEditLang] = useState('en');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text, details? }
  const statusTimer = useRef(null);

  const dirty = !isSameDraft(draft, baseline);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  // Cảnh báo khi đóng tab/tải lại trang lúc còn thay đổi chưa lưu
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  useEffect(() => () => window.clearTimeout(statusTimer.current), []);

  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const setName = (name) =>
    setDraft((current) => ({
      ...current,
      name,
      // Địa điểm mới: tự gợi ý slug từ tên tiếng Việt cho tới khi người dùng tự sửa slug
      slug: isNew && !slugTouched ? slugify(name.vi) : current.slug,
    }));

  const handleError = (error) => {
    if (error.status === 401) {
      onUnauthorized();
      return;
    }
    const details = error.data?.error?.details;
    setStatus({
      type: 'error',
      text: error.name === 'ApiError' ? error.message : 'Không kết nối được tới máy chủ.',
      details: Array.isArray(details) && details.length > 1 ? details : undefined,
    });
  };

  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus(null);
    window.clearTimeout(statusTimer.current);
    try {
      const payload = toPayload(draft);
      const result = isNew
        ? await adminApi.create(token, payload)
        : await adminApi.update(token, place.slug, payload);
      const saved = toDraft(result.place);
      setDraft(saved);
      setBaseline(saved);
      setStatus({ type: 'success', text: 'Đã lưu thay đổi.' });
      statusTimer.current = window.setTimeout(() => setStatus(null), 4000);
      await onSaved(result.place, isNew);
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const label = place.name?.vi || place.slug;
    if (!window.confirm(`Xóa vĩnh viễn "${label}"? Thao tác này không thể hoàn tác.`)) return;
    setBusy(true);
    setStatus(null);
    try {
      await adminApi.remove(token, place.slug);
      onDirtyChange?.(false);
      await onDeleted(place.slug);
    } catch (error) {
      handleError(error);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">{isNew ? 'Thêm địa điểm mới' : draft.name.vi || place.slug}</h2>
        {!isNew && (
          <a
            href={ROUTES.place(place.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Xem trang trên website
          </a>
        )}
      </div>

      <Section title="Thông tin chung">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">Slug (đường dẫn)</span>
            <input
              type="text"
              value={draft.slug}
              onChange={(event) => {
                setSlugTouched(true);
                set('slug', event.target.value.toLowerCase());
              }}
              readOnly={!isNew}
              placeholder="vi-du-pu-luong"
              className={`${inputClass} mt-2 ${isNew ? '' : 'cursor-not-allowed opacity-70'}`}
            />
            <span className="mt-1 block text-xs text-muted">
              {isNew
                ? 'Chữ thường không dấu, số và dấu gạch ngang. Không đổi được sau khi tạo.'
                : 'Không thể đổi sau khi tạo (vì là phần địa chỉ trang).'}
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Danh mục</span>
            <select
              value={draft.category}
              onChange={(event) => set('category', event.target.value)}
              className={`${inputClass} mt-2`}
            >
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Thứ tự hiển thị</span>
            <input
              type="number"
              min="0"
              value={draft.order}
              onChange={(event) => set('order', event.target.value)}
              placeholder="Tự động"
              className={`${inputClass} mt-2`}
            />
            <span className="mt-1 block text-xs text-muted">Số nhỏ hiển thị trước. Để trống để xếp cuối.</span>
          </label>

          <label className="flex items-start gap-3 sm:mt-7">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(event) => set('featured', event.target.checked)}
              className="mt-1 h-4 w-4 accent-[rgb(var(--c-brand))]"
            />
            <span>
              <span className="text-sm font-semibold">Hiển thị ở mục "Nổi bật"</span>
              <span className="block text-xs text-muted">
                Xuất hiện ở trang chủ. Ảnh đầu của địa điểm nổi bật đầu tiên được dùng làm ảnh nền trang chủ.
              </span>
            </span>
          </label>
        </div>
      </Section>

      <Section title="Nội dung" hint="Chọn ngôn ngữ dịch bên cạnh tiếng Việt (để trống sẽ tự dùng tiếng Anh/tiếng Việt).">
        <div className="flex flex-wrap gap-1.5">
          {ADMIN_LANGS.filter((x) => x.code !== 'vi').map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => setEditLang(code)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                editLang === code
                  ? 'border-brand bg-brand text-brand-fg'
                  : 'bg-bg text-muted hover:border-brand hover:text-fg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <BilingualField label="Tên địa điểm" value={draft.name} onChange={setName} activeLang={editLang} required />
        <BilingualField
          label="Mô tả ngắn (hiện trên thẻ)"
          value={draft.summary}
          onChange={(value) => set('summary', value)}
          activeLang={editLang}
          multiline
          rows={3}
          required
        />
        <BilingualField
          label="Mô tả chi tiết (cách đoạn bằng một dòng trống)"
          value={draft.description}
          onChange={(value) => set('description', value)}
          activeLang={editLang}
          multiline
          rows={9}
          required
        />
        <BilingualField
          label="Địa chỉ cụ thể"
          value={draft.address}
          onChange={(value) => set('address', value)}
          activeLang={editLang}
          required
        />
      </Section>

      <Section title="Các nét nổi bật" hint="Mỗi dòng là một thẻ có dấu tick xanh trên trang chi tiết.">
        <div className="grid gap-6 lg:grid-cols-2">
          <StringListEditor
            label="Tiếng Việt"
            items={draft.highlights.vi || []}
            onChange={(vi) => set('highlights', { ...draft.highlights, vi })}
            addLabel="Thêm nét nổi bật"
          />
          <StringListEditor
            label={ADMIN_LANGS.find((x) => x.code === editLang)?.label || editLang.toUpperCase()}
            items={draft.highlights[editLang] || []}
            onChange={(items) => set('highlights', { ...draft.highlights, [editLang]: items })}
            addLabel="Thêm nét nổi bật"
          />
        </div>
      </Section>

      <Section
        title="Hình ảnh"
        hint="Dán URL ảnh (https://...) hoặc đường dẫn ảnh đã đặt trong client/public (ví dụ /images/places/pu-luong-1.jpg). Ảnh đầu tiên là ảnh đại diện."
      >
        <ImageListEditor images={draft.images} onChange={(images) => set('images', images)} />
      </Section>

      <Section title="Vị trí trên bản đồ" hint="Để trống nếu không muốn hiện ghim. Mở Google Maps, bấm chuột phải vào vị trí để sao chép vĩ độ, kinh độ.">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">Vĩ độ (lat)</span>
            <input
              type="text"
              inputMode="decimal"
              value={draft.lat}
              onChange={(event) => set('lat', event.target.value)}
              placeholder="20.4750"
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Kinh độ (lng)</span>
            <input
              type="text"
              inputMode="decimal"
              value={draft.lng}
              onChange={(event) => set('lng', event.target.value)}
              placeholder="105.1900"
              className={`${inputClass} mt-2`}
            />
          </label>
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border bg-surface/95 p-4 shadow-soft backdrop-blur">
        <button type="submit" disabled={busy || (!isNew && !dirty)} className="btn btn-primary disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {isNew ? 'Tạo địa điểm' : 'Lưu thay đổi'}
        </button>

        {!isNew && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="btn border border-red-500/40 text-red-600 hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Xóa
          </button>
        )}

        <div className="min-w-0 flex-1 text-sm" role="status" aria-live="polite">
          {dirty && !status && <span className="text-accent">Có thay đổi chưa lưu</span>}
          {status?.type === 'success' && <span className="text-brand">{status.text}</span>}
          {status?.type === 'error' && (
            <div className="text-red-600 dark:text-red-400">
              <p>{status.text}</p>
              {status.details && (
                <ul className="mt-1 list-disc pl-5 text-xs">
                  {status.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
