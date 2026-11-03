import { useState } from 'react';
import { Feather } from 'lucide-react';

interface Props {
  onGenerate: (description: string) => void;
  isLoading: boolean;
}

const PLACEHOLDER =
  '写下你的中文名、性格、兴趣、想展现的气质，或名字的使用场景。\n\n例如：我叫李小雨，安静但有主见，喜欢摄影和历史，想用于游戏角色。';

export default function InputSection({ onGenerate, isLoading }: Props) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  const isEmpty = value.trim().length === 0;
  const showError = touched && isEmpty;

  function handleSubmit() {
    setTouched(true);
    if (isEmpty) return;
    onGenerate(value.trim());
  }

  return (
    <section className="mb-2">
      <label className="block mb-2 text-sm font-medium text-stone-600 tracking-wide">
        介绍一下你自己
      </label>
      <textarea
        className={`w-full rounded-xl border bg-white px-4 py-3.5 text-stone-800 text-sm leading-relaxed resize-none outline-none transition-all duration-200 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700/60 ${
          showError ? 'border-red-300 ring-2 ring-red-200' : 'border-stone-200'
        }`}
        rows={5}
        placeholder={PLACEHOLDER}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        disabled={isLoading}
      />
      {showError && (
        <p className="mt-1.5 text-xs text-red-500">请先介绍一下自己，才能为你取名。</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-amber-800 px-8 py-3 text-sm font-medium text-amber-50 tracking-wide transition-all duration-200 hover:bg-amber-900 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        <Feather size={15} className="shrink-0" />
        为我取罗马名
      </button>
    </section>
  );
}
