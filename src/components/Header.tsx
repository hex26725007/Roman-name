export default function Header() {
  return (
    <header className="mb-12 text-center">
      <div className="mb-3 flex items-center justify-center gap-2">
        <div className="h-px w-12 bg-amber-700/40" />
        <span className="text-xs tracking-[0.3em] text-amber-800/70 uppercase">NOMEN EST OMEN</span>
        <div className="h-px w-12 bg-amber-700/40" />
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-stone-800 leading-tight">
        名如其人
      </h1>
      <p className="mt-2 font-serif text-xl sm:text-2xl text-amber-800/80 tracking-wide">
        罗马名顾问
      </p>
      <p className="mt-4 text-stone-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
        用一句话，找到一个像你的罗马名。
      </p>
    </header>
  );
}
