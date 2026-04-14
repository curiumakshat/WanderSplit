const variants = {
  default: 'badge-default',
  lime: 'badge-lime',
  violet: 'badge-violet',
  amber: 'badge-amber',
  success: 'badge-success',
  danger: 'badge-danger',
};

export default function Badge({ children, className = '', variant = 'default' }) {
  return <span className={`badge-base ${variants[variant] ?? variants.default} ${className}`}>{children}</span>;
}
