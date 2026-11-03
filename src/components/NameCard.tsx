import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { RomanName } from '@/types';

interface Props {
  data: RomanName;
  index: number;
}

const CARD_ACCENTS = [
  'border-l-amber-700',
  'border-l-stone-500',
  'border-l-red-800',
];

const TAG_COLORS = [
  'bg-amber-100 text-amber-800',
  'bg-stone-100 text-stone-600',
  'bg-red-50 text-red-800',
];

export default function NameCard({ data, index }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = `${data.name}（${data.cn}）\n读法：${data.pronunciation}\n含义：${data.meaning}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const accentClass = CARD_ACCENTS[index % CARD_ACCENTS.length];
  const tagColorClass = TAG_COLORS[index % TAG_COLORS.length];

  return (
    <article
      className={`relative rounded-xl border border-stone-200 border-l-4 ${accentClass} bg-white px-6 py-5 shadow-sm transition-shadow duration-200 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800 tracking-wide">
              {data.name}
            </h2>
            <span className="font-serif text-lg text-stone-500">{data.cn}</span>
          </div>
          <p className="mt-1 text-xs text-stone-400 tracking-wide">{data.pronunciation}</p>
        </div>
        <button
          onClick={handleCopy}
          title="复制名字"
          className="shrink-0 flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-500 transition-all duration-150 hover:border-amber-700/40 hover:text-amber-800 hover:bg-amber-50 active:scale-95"
        >
          {copied ? (
            <>
              <Check size={13} className="text-green-600" />
              <span className="text-green-600">已复制</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              复制
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.tags.map((tag) => (
          <span
            key={tag}
            className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${tagColorClass}`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <h3 className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-1">名字含义</h3>
          <p className="text-sm text-stone-600 leading-relaxed">{data.meaning}</p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-1">为什么适合我</h3>
          <p className="text-sm text-stone-600 leading-relaxed">{data.reason}</p>
        </div>
      </div>

      {data.note && (
        <div className="mt-4 rounded-lg bg-stone-50 border border-stone-100 px-3 py-2">
          <p className="text-xs text-stone-400 leading-relaxed">
            <span className="font-medium text-stone-500">注：</span>
            {data.note}
          </p>
        </div>
      )}
    </article>
  );
}
