const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  success: 'btn-success',
};

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  return (
    <button className={`btn-base ${variants[variant] ?? variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
