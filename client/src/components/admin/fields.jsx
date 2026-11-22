import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import SafeImage from '@/components/common/SafeImage';

export const inputClass =
  'w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

const iconButton =
  'grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-surface text-muted transition hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-30';

export function Section({ title, hint, children }) {
  return (
    <fieldset className="rounded-2xl border bg-surface p-5 sm:p-6">
      <legend className="px-2 font-display text-lg font-semibold">{title}</legend>
      {hint && <p className="-mt-1 mb-4 text-xs text-muted">{hint}</p>}
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

// Một trường đa ngôn ngữ: hiển thị tiếng Việt (bắt buộc) + các ngôn ngữ khác theo tab
export function BilingualField({ label, value, onChange, multiline = false, rows = 6, required = false, activeLang = 'en' }) {
  const Control = multiline ? 'textarea' : 'input';
  const base = multiline ? { rows } : { type: 'text' };
  const langLabels = { vi: 'Tiếng Việt', en: 'English', ja: '日本語', ko: '한국어', zh: '中文', fr: 'Français' };
  const secondLang = activeLang === 'vi' ? 'en' : activeLang;

  return (
    <div>
      <p className="text-sm font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <div className="mt-2 grid gap-3 lg:grid-cols-2">
        {[
          ['vi', langLabels.vi],
          [secondLang, langLabels[secondLang] || secondLang.toUpperCase()],
        ].map(([lang, langLabel]) => (
          <label key={lang} className="block">
            <span className="mb-1 block text-xs text-muted">{langLabel}</span>
            <Control
              {...base}
              value={value[lang] ?? ''}
              onChange={(event) => onChange({ ...value, [lang]: event.target.value })}
              className={`${inputClass} ${multiline ? 'resize-y leading-relaxed' : ''}`}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

// Danh sách chuỗi (nét nổi bật): thêm, sửa, xóa từng dòng
export function StringListEditor({ label, items, onChange, addLabel = 'Thêm dòng', max = 12 }) {
  const update = (index, text) => onChange(items.map((item, i) => (i === index ? text : item)));
  const remove = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div>
      <p className="mb-1 block text-xs text-muted">{label}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(event) => update(index, event.target.value)}
              aria-label={`${label} ${index + 1}`}
              className={inputClass}
            />
            <button type="button" onClick={() => remove(index)} aria-label="Xóa dòng" className={iconButton}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        disabled={items.length >= max}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  );
}

// Danh sách URL ảnh: xem trước, sắp xếp lại, xóa. Ảnh đầu tiên là ảnh đại diện.
export function ImageListEditor({ images, onChange, max = 12 }) {
  const update = (index, value) => onChange(images.map((url, i) => (i === index ? value : url)));
  const remove = (index) => onChange(images.filter((_, i) => i !== index));
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <ul className="space-y-3">
        {images.map((url, index) => (
          <li key={index} className="flex items-center gap-3 rounded-xl border bg-bg p-2.5">
            <SafeImage
              src={url.trim()}
              alt=""
              width={160}
              className="h-14 w-20 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={url}
                onChange={(event) => update(index, event.target.value)}
                placeholder="https://... hoặc /images/places/ten-anh.jpg"
                aria-label={`URL ảnh ${index + 1}`}
                className={inputClass}
              />
              {index === 0 && <span className="mt-1 block text-[11px] font-semibold text-accent">Ảnh đại diện</span>}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Chuyển lên"
                className={iconButton}
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === images.length - 1}
                aria-label="Chuyển xuống"
                className={iconButton}
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => remove(index)} aria-label="Xóa ảnh" className={iconButton}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...images, ''])}
        disabled={images.length >= max}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Thêm ảnh
      </button>
    </div>
  );
}
