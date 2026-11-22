import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Khu vực "Các nét nổi bật": mỗi mục là một thẻ nổi có icon tick xanh.
export default function Highlights({ items = [] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="highlights-title" className="mt-12">
      <h2 id="highlights-title" className="text-2xl sm:text-3xl">
        {t('place.highlights')}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            data-aos="fade-up"
            data-aos-delay={(index % 2) * 100}
            className="flex items-start gap-3 rounded-2xl border bg-surface p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-soft"
          >
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
            <span className="text-[15px] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
