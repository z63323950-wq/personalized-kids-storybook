import { useEffect, useState } from 'react';
export function useSpeech(text: string) {
  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;
  const [status, setStatus] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [error, setError] = useState('');
  useEffect(() => {
    setStatus('idle');
    setError('');
    if (supported) window.speechSynthesis.cancel();
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [text, supported]);
  function stop() {
    if (supported) window.speechSynthesis.cancel();
    setStatus('idle');
  }
  function toggle() {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (status === 'speaking') {
      synth.pause();
      setStatus('paused');
      return;
    }
    if (status === 'paused') {
      synth.resume();
      setStatus('speaking');
      return;
    }
    try {
      synth.cancel();
      setError('');
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'zh-CN';
      speech.rate = 0.85;
      const chinese = synth.getVoices().find((v) => v.lang.startsWith('zh'));
      if (chinese) speech.voice = chinese;
      speech.onend = () => setStatus('idle');
      speech.onerror = (e) => {
        setStatus('idle');
        if (!['canceled', 'interrupted'].includes(e.error))
          setError('语音暂时不可用，请继续阅读文字故事。');
      };
      setStatus('speaking');
      synth.speak(speech);
    } catch {
      setStatus('idle');
      setError('语音暂时不可用，请继续阅读文字故事。');
    }
  }
  return { supported, status, error, toggle, stop };
}
