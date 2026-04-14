export default function BrandLogo({ className = '', imageClassName = '', size = 'md' }) {
  const sizes = {
    sm: 'h-11 w-11 rounded-2xl p-1.5',
    md: 'h-14 w-14 rounded-[1.35rem] p-2',
    lg: 'h-20 w-20 rounded-[1.75rem] p-2.5',
  };

  return (
    <div
      className={`relative flex items-center justify-center border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(241,245,249,0.92))] shadow-[0_18px_44px_rgba(124,58,237,0.22)] ${sizes[size] ?? sizes.md} ${className}`}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_58%)]" />
      <img
        src="/logo.png"
        alt="WanderSplit logo"
        className={`relative z-10 h-full w-full object-contain ${imageClassName}`}
      />
      <span className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(190,242,100,0.85)]" />
    </div>
  );
}
