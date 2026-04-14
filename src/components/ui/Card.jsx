export default function Card({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'surface-card',
    glass: 'surface-card surface-glass',
    muted: 'surface-card bg-white/[0.04]',
    gradient: 'surface-card bg-[linear-gradient(135deg,rgba(124,58,237,0.22),rgba(15,23,42,0.92))]',
  };

  return (
    <section className={`${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </section>
  );
}
