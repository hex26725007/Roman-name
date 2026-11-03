export default function Footer() {
  return (
    <footer className="mt-16 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="h-px w-8 bg-stone-200" />
        <span className="text-xs text-stone-300">✦</span>
        <div className="h-px w-8 bg-stone-200" />
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">
        推荐名字仅供参考，不构成任何历史身份认证。
        <br />
        创作名均标注"古罗马风格创作名"，历史依据因人而异。
      </p>
    </footer>
  );
}
