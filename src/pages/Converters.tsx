import React, { useState } from 'react';
import { ArrowRightLeft, RefreshCcw } from 'lucide-react';
import { CONVERSION_FACTORS } from '../utils';

export default function Converters() {
  const [value, setValue] = useState<string>('1');
  const [type, setType] = useState<'kw_hp' | 'kw_cv' | 'awg_mm' | 'temp'>('kw_hp');

  const convert = () => {
    const v = parseFloat(value) || 0;
    switch (type) {
      case 'kw_hp': return { from: 'kW', to: 'HP', result: v * CONVERSION_FACTORS.KW_TO_HP, reverse: v * CONVERSION_FACTORS.HP_TO_KW };
      case 'kw_cv': return { from: 'kW', to: 'CV', result: v * CONVERSION_FACTORS.KW_TO_CV, reverse: v * CONVERSION_FACTORS.CV_TO_KW };
      case 'temp': return { from: '°C', to: '°F', result: (v * 9/5) + 32, reverse: (v - 32) * 5/9 };
      case 'awg_mm': return { from: 'AWG', to: 'mm²', result: 0.127 * Math.pow(92, (36 - v) / 39), reverse: 36 - 39 * Math.log(v / 0.127) / Math.log(92) };
      default: return { from: '', to: '', result: 0, reverse: 0 };
    }
  };

  const { from, to, result, reverse } = convert();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Conversores Técnicos</h1>
        <p className="text-slate-500 dark:text-slate-400">Conversão rápida de unidades para engenharia e campo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Conversão</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'kw_hp', label: 'kW ↔ HP' },
                  { id: 'kw_cv', label: 'kW ↔ CV' },
                  { id: 'awg_mm', label: 'AWG ↔ mm²' },
                  { id: 'temp', label: 'Celsius ↔ Fahrenheit' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id as any)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
                      type === t.id 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Valor</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white text-lg font-bold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
              <ArrowRightLeft className="text-primary-600 dark:text-primary-400 w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{from} para {to}</p>
            <p className="text-5xl font-black text-slate-900 dark:text-white">{result.toFixed(4)}</p>
            <p className="mt-2 text-xl font-bold text-primary-600 dark:text-primary-400">{to}</p>
          </div>

          <div className="p-8 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
              <RefreshCcw className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Inverso</span>
            </div>
            <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{reverse.toFixed(4)} {from}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
