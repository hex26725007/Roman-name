import { useState } from 'react';
import Header from '@/components/Header';
import InputSection from '@/components/InputSection';
import ResultSection from '@/components/ResultSection';
import Footer from '@/components/Footer';
import type { RomanName } from '@/types';

type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; names: RomanName[] }
  | { status: 'error'; message: string };

export default function App() {
  const [state, setState] = useState<AppState>({ status: 'idle' });

  async function handleGenerate(description: string) {
    setState({ status: 'loading' });
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const endpoint = import.meta.env.DEV
        ? '/api/generate-roman-names'
        : `${supabaseUrl}/functions/v1/generate-roman-names`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(import.meta.env.DEV
            ? {}
            : {
                Authorization: `Bearer ${anonKey}`,
                Apikey: anonKey,
              }),
        },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'NO_API_KEY') {
          setState({
            status: 'error',
            message: '尚未配置 DeepSeek API Key，请在项目根目录 .env 中填写 DEEPSEEK_API_KEY 后重启。',
          });
        } else if (data.detail === 401 || data.detail === 403) {
          setState({ status: 'error', message: 'DeepSeek API Key 无效，请检查密钥是否正确。' });
        } else if (data.detail === 402 || data.detail === 429) {
          setState({ status: 'error', message: 'DeepSeek 额度不足或请求过于频繁，请稍后重试。' });
        } else {
          setState({ status: 'error', message: 'AI 服务暂时不可用，请稍后重试。' });
        }
        return;
      }

      if (!data.names || !Array.isArray(data.names) || data.names.length === 0) {
        setState({ status: 'error', message: 'AI 返回的数据格式有误，请重试。' });
        return;
      }

      setState({ status: 'success', names: data.names });
    } catch {
      setState({ status: 'error', message: '网络连接失败，请检查网络后重试。' });
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <Header />
        <InputSection
          onGenerate={handleGenerate}
          isLoading={state.status === 'loading'}
        />
        {state.status === 'loading' && <LoadingState />}
        {state.status === 'error' && <ErrorState message={state.message} />}
        {state.status === 'success' && <ResultSection names={state.names} />}
        <Footer />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-12 flex flex-col items-center gap-4 text-stone-500">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 rounded-full bg-amber-700 opacity-70 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-sm tracking-wide">正在翻阅罗马历史典籍……</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mt-10 rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
      {message}
    </div>
  );
}
