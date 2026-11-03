import type { RomanName } from '@/types';
import NameCard from '@/components/NameCard';

interface Props {
  names: RomanName[];
}

export default function ResultSection({ names }: Props) {
  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200" />
        <span className="text-xs tracking-[0.25em] text-stone-400 uppercase">为你推荐的三个名字</span>
        <div className="h-px flex-1 bg-stone-200" />
      </div>
      <div className="flex flex-col gap-5">
        {names.map((item, index) => (
          <NameCard key={index} data={item} index={index} />
        ))}
      </div>
    </section>
  );
}
