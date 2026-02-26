import React, { useState } from 'react';
import { MessageSquare, Bug, Lightbulb, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils';

export default function Feedback() {
  const [type, setType] = useState<'bug' | 'feature'>('bug');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description, email }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setDescription('');
        setEmail('');
      }
    } catch (error) {
      console.error('Failed to submit feedback', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-light text-zinc-900 dark:text-white">Obrigado pelo seu feedback!</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Sua mensagem foi enviada com sucesso. Nossa equipe técnica irá analisar sua sugestão ou relato de bug.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium transition-all hover:opacity-90"
        >
          Enviar outro feedback
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white">Feedback</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Ajude-nos a melhorar o ElectroPro relatando bugs ou sugerindo novas funcionalidades.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tipo de Feedback</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('bug')}
              className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-xl border transition-all",
                type === 'bug'
                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              )}
            >
              <Bug className="w-5 h-5" />
              <span className="font-medium">Relatar Bug</span>
            </button>
            <button
              type="button"
              onClick={() => setType('feature')}
              className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-xl border transition-all",
                type === 'feature'
                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              )}
            >
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">Sugerir Opção</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'bug' ? "Descreva o problema que você encontrou..." : "Qual funcionalidade você gostaria de ver no app?"}
            rows={6}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-300 transition-all text-sm dark:text-white resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Seu E-mail (Opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-300 transition-all text-sm dark:text-white"
          />
          <p className="text-[10px] text-zinc-400">Usaremos seu e-mail apenas se precisarmos de mais detalhes sobre seu relato.</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !description}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
}
