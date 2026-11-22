export default function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <section className="hero-bg border-b">
      <div className="container-page py-16 sm:py-20 lg:py-24">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg text-muted">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
