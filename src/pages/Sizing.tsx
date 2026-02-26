import React, { useState } from 'react';
import { Ruler, AlertTriangle, Info } from 'lucide-react';
import { calculateVoltageDrop } from '../calculations';
import { cn } from '../utils';

const CABLE_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

// Capacidades aproximadas para PVC, 2 condutores carregados, Método B1 (NBR 5410)
const CURRENT_CAPACITIES: Record<number, number> = {
  1.5: 17.5,
  2.5: 24,
  4: 32,
  6: 41,
  10: 57,
  16: 76,
  25: 101,
  35: 125,
  50: 151,
  70: 192,
  95: 232,
  120: 269,
  150: 309,
  185: 353,
  240: 415,
};

export default function Sizing() {
  const [current, setCurrent] = useState<string>('20');
  const [length, setLength] = useState<string>('30');
  const [material, setMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [phases, setPhases] = useState<1 | 3>(1);
  const [voltage, setVoltage] = useState<string>('220');
  const [pf, setPf] = useState<string>('0.92');
  const [reactance, setReactance] = useState<string>('0.1');
  const [temp, setTemp] = useState<string>('70');

  const results = CABLE_SECTIONS.map(section => {
    const i = parseFloat(current) || 0;
    const vNominal = parseFloat(voltage) || 0;
    const drop = calculateVoltageDrop(
      parseFloat(length) || 0, 
      i, 
      section, 
      material, 
      phases,
      parseFloat(pf) || 1,
      parseFloat(reactance) || 0,
      parseFloat(temp) || 20
    );
    const dropPercent = vNominal > 0 ? (drop / vNominal) * 100 : 0;
    const capacity = CURRENT_CAPACITIES[section] || 0;
    const capacityExceeded = i > capacity;
    return { section, drop, dropPercent, capacity, capacityExceeded };
  });

  const recommended = results.find(r => r.dropPercent <= 4 && !r.capacityExceeded);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white">Dimensionamento</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Seção nominal por queda de tensão e capacidade de corrente (NBR 5410).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Circuito</h3>
              <InputGroup label="Corrente (A)" value={current} onChange={setCurrent} />
              <InputGroup label="Comprimento (m)" value={length} onChange={setLength} />
              <InputGroup label="Tensão (V)" value={voltage} onChange={setVoltage} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Condutor</h3>
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Material</label>
                <div className="flex gap-2">
                  {['copper', 'aluminum'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMaterial(m as any)}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-xs font-medium transition-all",
                        material === m 
                          ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                      )}
                    >
                      {m === 'copper' ? 'Cobre' : 'Alumínio'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Sistema</label>
                <div className="flex gap-2">
                  {[1, 3].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPhases(p as 1 | 3)}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-xs font-medium transition-all",
                        phases === p 
                          ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                      )}
                    >
                      {p === 1 ? 'Monofásico' : 'Trifásico'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Parâmetros Técnicos</h3>
              <InputGroup label="Fator de Potência" value={pf} onChange={setPf} />
              <InputGroup label="Reatância (Ω/km)" value={reactance} onChange={setReactance} />
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Temperatura (°C)</label>
                <select 
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg outline-none text-sm dark:text-white"
                >
                  <option value="20">20°C (Ambiente)</option>
                  <option value="70">70°C (PVC)</option>
                  <option value="90">90°C (XLPE/EPR)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          {recommended && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Seção Recomendada</p>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl font-light text-zinc-900 dark:text-white">{recommended.section}</span>
                <span className="text-xl font-medium text-zinc-400">mm²</span>
              </div>
              <p className="text-sm text-zinc-500 mt-2">
                Queda de {recommended.dropPercent.toFixed(2)}% ({recommended.drop.toFixed(2)}V)
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Seção</th>
                  <th className="py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Queda (V)</th>
                  <th className="py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Queda (%)</th>
                  <th className="py-4 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                {results.map((res) => (
                  <tr key={res.section} className={cn(
                    "group transition-colors",
                    res.capacityExceeded && "opacity-50"
                  )}>
                    <td className="py-4 font-medium text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {res.section} mm²
                        {res.capacityExceeded && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-zinc-500">{res.drop.toFixed(2)}V</td>
                    <td className="py-4 text-sm text-zinc-500">{res.dropPercent.toFixed(2)}%</td>
                    <td className="py-4 text-right">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        (res.dropPercent <= 4 && !res.capacityExceeded) ? "text-emerald-600" : "text-rose-500"
                      )}>
                        {(res.dropPercent <= 4 && !res.capacityExceeded) ? 'OK' : res.capacityExceeded ? 'Sobrecarga' : 'Queda Alta'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg focus:border-zinc-300 dark:focus:border-zinc-600 outline-none transition-all dark:text-white text-sm"
      />
    </div>
  );
}
