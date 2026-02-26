import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  calculateOhmsLaw, 
  calculatePower, 
  calculatePFC, 
  calculateVoltageDrop,
  calculateConduitFill,
  calculateShortCircuit,
  calculateLighting
} from '../calculations';
import { cn } from '../utils';
import { 
  Zap, 
  Activity, 
  ArrowDownCircle, 
  Scale, 
  Box, 
  ShieldAlert, 
  Lightbulb,
  Plus,
  Trash2
} from 'lucide-react';

type CalcTab = 'ohms' | 'power' | 'pfc' | 'drop' | 'conduit' | 'short' | 'lighting';

export default function Calculators() {
  const [activeCalc, setActiveCalc] = useState<CalcTab>('ohms');

  const tabs = [
    { id: 'ohms', label: 'Lei de Ohm', icon: Zap },
    { id: 'power', label: 'Potência', icon: Activity },
    { id: 'pfc', label: 'Fator de Potência', icon: Scale },
    { id: 'drop', label: 'Queda de Tensão', icon: ArrowDownCircle },
    { id: 'conduit', label: 'Eletrodutos', icon: Box },
    { id: 'short', label: 'Curto-Circuito', icon: ShieldAlert },
    { id: 'lighting', label: 'Iluminação', icon: Lightbulb },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white">Calculadoras</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Ferramentas de precisão para cálculos fundamentais.</p>
      </div>

      <div className="flex gap-6 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCalc(tab.id as any)}
            className={cn(
              "pb-4 text-sm font-medium transition-all relative flex items-center gap-2 whitespace-nowrap",
              activeCalc === tab.id 
                ? "text-zinc-900 dark:text-white" 
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeCalc === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeCalc === 'ohms' && <OhmsLawCalc />}
        {activeCalc === 'power' && <PowerCalc />}
        {activeCalc === 'pfc' && <PFCCalc />}
        {activeCalc === 'drop' && <VoltageDropCalc />}
        {activeCalc === 'conduit' && <ConduitCalc />}
        {activeCalc === 'short' && <ShortCircuitCalc />}
        {activeCalc === 'lighting' && <LightingCalc />}
      </div>
    </div>
  );
}

function OhmsLawCalc() {
  const [v, setV] = useState<string>('');
  const [r, setR] = useState<string>('');
  const [i, setI] = useState<string>('');

  const result = calculateOhmsLaw(
    v ? parseFloat(v) : undefined,
    r ? parseFloat(r) : undefined,
    i ? parseFloat(i) : undefined
  );

  const handleClear = () => {
    setV('');
    setR('');
    setI('');
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <button 
          onClick={handleClear}
          className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          Limpar Campos
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <InputGroup label="Tensão (V)" value={v} onChange={setV} placeholder="220" />
        <InputGroup label="Resistência (Ω)" value={r} onChange={setR} placeholder="10" />
        <InputGroup label="Corrente (A)" value={i} onChange={setI} placeholder="22" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-y border-zinc-100 dark:border-zinc-800">
        <ResultItem label="Tensão" value={result.v !== undefined ? result.v.toFixed(2) : '-'} unit="V" />
        <ResultItem label="Resistência" value={result.r !== undefined ? result.r.toFixed(2) : '-'} unit="Ω" />
        <ResultItem label="Corrente" value={result.i !== undefined ? result.i.toFixed(2) : '-'} unit="A" />
        <ResultItem label="Potência" value={result.p !== undefined ? result.p.toFixed(2) : '-'} unit="W" />
      </div>
    </div>
  );
}

function PowerCalc() {
  const [v, setV] = useState<string>('220');
  const [i, setI] = useState<string>('');
  const [fp, setFp] = useState<string>('0.92');
  const [phases, setPhases] = useState<1 | 3>(1);

  const result = calculatePower(parseFloat(v) || 0, parseFloat(i) || 0, parseFloat(fp) || 0, phases);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Tensão (V)" value={v} onChange={setV} />
        <InputGroup label="Corrente (A)" value={i} onChange={setI} />
        <InputGroup label="Fator de Potência" value={fp} onChange={setFp} />
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sistema</label>
          <div className="flex gap-2">
            {[1, 3].map((p) => (
              <button
                key={p}
                onClick={() => setPhases(p as 1 | 3)}
                className={cn(
                  "flex-1 py-3 rounded-xl border font-bold transition-all",
                  phases === p 
                    ? "bg-primary-600 border-primary-600 text-white" 
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                {p === 1 ? 'Monofásico' : 'Trifásico'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
        <ResultItem label="Potência Ativa" value={result.p.toFixed(2)} unit="W" />
        <ResultItem label="Potência Aparente" value={result.s.toFixed(2)} unit="VA" />
        <ResultItem label="Potência Reativa" value={result.q.toFixed(2)} unit="VAr" />
      </div>
    </div>
  );
}

function PFCCalc() {
  const [p, setP] = useState<string>('');
  const [fpI, setFpI] = useState<string>('0.80');
  const [fpT, setFpT] = useState<string>('0.92');

  const qc = calculatePFC(parseFloat(p) || 0, parseFloat(fpI) || 0, parseFloat(fpT) || 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputGroup label="Potência Ativa (W)" value={p} onChange={setP} />
        <InputGroup label="FP Atual" value={fpI} onChange={setFpI} />
        <InputGroup label="FP Desejado" value={fpT} onChange={setFpT} />
      </div>

      <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-900/30">
        <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-2">Capacitância Necessária</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-primary-700 dark:text-primary-300">{qc.toFixed(2)}</span>
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">VAr</span>
        </div>
        <p className="mt-4 text-xs text-primary-600/70 dark:text-primary-400/70">
          Cálculo baseado na compensação de potência reativa para atingir o fator de potência alvo.
        </p>
      </div>
    </div>
  );
}

function LightingCalc() {
  const [l, setL] = useState('5');
  const [w, setW] = useState('4');
  const [lux, setLux] = useState('300');
  const [lumens, setLumens] = useState('1000');

  const result = calculateLighting(
    parseFloat(l) || 0,
    parseFloat(w) || 0,
    parseFloat(lux) || 0,
    parseFloat(lumens) || 1
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <InputGroup label="Comprimento (m)" value={l} onChange={setL} />
        <InputGroup label="Largura (m)" value={w} onChange={setW} />
        <InputGroup label="Iluminância (Lux)" value={lux} onChange={setLux} />
        <InputGroup label="Lúmens por Lâmpada" value={lumens} onChange={setLumens} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-zinc-100 dark:border-zinc-800">
        <ResultItem label="Área Total" value={result.area.toFixed(2)} unit="m²" />
        <ResultItem label="Fluxo Necessário" value={result.totalLumens.toFixed(0)} unit="lm" />
        <ResultItem label="Qtd. Lâmpadas" value={result.numLamps.toString()} unit="un" />
      </div>
    </div>
  );
}

function ShortCircuitCalc() {
  const [v, setV] = useState('220');
  const [l, setL] = useState('20');
  const [s, setS] = useState('2.5');
  const [m, setM] = useState<'copper' | 'aluminum'>('copper');

  const icc = calculateShortCircuit(
    parseFloat(v) || 0,
    parseFloat(l) || 0,
    parseFloat(s) || 1,
    m
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <InputGroup label="Tensão (V)" value={v} onChange={setV} />
        <InputGroup label="Distância do Quadro (m)" value={l} onChange={setL} />
        <InputGroup label="Seção do Cabo (mm²)" value={s} onChange={setS} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-zinc-100 dark:border-zinc-800">
        <ResultItem label="Icc Estimada" value={(icc/1000).toFixed(2)} unit="kA" />
        <div className="flex items-center gap-2 text-zinc-400">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <p className="text-[10px] uppercase font-bold tracking-widest">Use para especificar disjuntores</p>
        </div>
      </div>
    </div>
  );
}

function ConduitCalc() {
  const [cables, setCables] = useState<{ section: number, count: number }[]>([{ section: 2.5, count: 3 }]);

  const addCable = () => setCables([...cables, { section: 2.5, count: 1 }]);
  const removeCable = (index: number) => setCables(cables.filter((_, i) => i !== index));
  const updateCable = (index: number, field: string, val: any) => {
    const next = [...cables];
    next[index] = { ...next[index], [field]: val };
    setCables(next);
  };

  const result = calculateConduitFill(cables);

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Cabos no Eletroduto</h3>
          <button onClick={addCable} className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white hover:opacity-70">
            <Plus className="w-4 h-4" /> Adicionar Cabo
          </button>
        </div>
        <div className="space-y-3">
          {cables.map((c, idx) => (
            <div key={idx} className="flex items-end gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Seção (mm²)</label>
                <select 
                  value={c.section} 
                  onChange={(e) => updateCable(idx, 'section', parseFloat(e.target.value))}
                  className="w-full bg-transparent outline-none text-sm font-medium dark:text-white"
                >
                  {[1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120].map(s => <option key={s} value={s}>{s} mm²</option>)}
                </select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Quantidade</label>
                <input 
                  type="number" 
                  value={c.count} 
                  onChange={(e) => updateCable(idx, 'count', parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent outline-none text-sm font-medium dark:text-white"
                />
              </div>
              <button onClick={() => removeCable(idx)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-zinc-100 dark:border-zinc-800">
        <ResultItem label="Área dos Cabos" value={result.totalArea.toFixed(1)} unit="mm²" />
        <ResultItem label="Diâmetro Mínimo" value={result.requiredDiameter.toFixed(1)} unit="mm" />
        <ResultItem label="Taxa de Ocupação" value={result.limit.toFixed(0)} unit="%" />
      </div>
    </div>
  );
}
function VoltageDropCalc() {
  const [length, setLength] = useState<string>('30');
  const [current, setCurrent] = useState<string>('20');
  const [section, setSection] = useState<string>('2.5');
  const [material, setMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [phases, setPhases] = useState<1 | 3>(1);
  const [voltage, setVoltage] = useState<string>('220');
  const [pf, setPf] = useState<string>('0.92');
  const [reactance, setReactance] = useState<string>('0.1');
  const [temp, setTemp] = useState<string>('70');

  const drop = calculateVoltageDrop(
    parseFloat(length) || 0,
    parseFloat(current) || 0,
    parseFloat(section) || 1,
    material,
    phases,
    parseFloat(pf) || 1,
    parseFloat(reactance) || 0,
    parseFloat(temp) || 20
  );

  const vNominal = parseFloat(voltage) || 0;
  const dropPercent = vNominal > 0 ? (drop / vNominal) * 100 : 0;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Circuito</h3>
          <InputGroup label="Comprimento (m)" value={length} onChange={setLength} placeholder="Ex: 30" />
          <InputGroup label="Corrente (A)" value={current} onChange={setCurrent} placeholder="Ex: 20" />
          <InputGroup label="Tensão Nominal (V)" value={voltage} onChange={setVoltage} placeholder="Ex: 220" />
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Condutor</h3>
          <InputGroup label="Seção (mm²)" value={section} onChange={setSection} placeholder="Ex: 2.5" />
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Material</label>
            <div className="flex gap-2">
              {['copper', 'aluminum'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMaterial(m as any)}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg border text-xs font-medium transition-all",
                    material === m 
                      ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                      : "border-zinc-100 dark:border-zinc-800 text-zinc-500"
                  )}
                >
                  {m === 'copper' ? 'Cobre' : 'Alumínio'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Sistema</label>
            <div className="flex gap-2">
              {[1, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setPhases(p as 1 | 3)}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg border text-xs font-medium transition-all",
                    phases === p 
                      ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                      : "border-zinc-100 dark:border-zinc-800 text-zinc-500"
                  )}
                >
                  {p === 1 ? 'Monofásico' : 'Trifásico'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Parâmetros Técnicos</h3>
          <InputGroup label="Fator de Potência" value={pf} onChange={setPf} placeholder="0.92" />
          <InputGroup label="Reatância (Ω/km)" value={reactance} onChange={setReactance} placeholder="0.1" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 border-y border-zinc-100 dark:border-zinc-800">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Queda de Tensão Total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-light text-zinc-900 dark:text-white">{drop.toFixed(2)}</span>
            <span className="text-xl font-medium text-zinc-400">V</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Percentual de Queda</p>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-5xl font-light",
              dropPercent > 4 ? "text-rose-500" : "text-emerald-500"
            )}>
              {dropPercent.toFixed(2)}
            </span>
            <span className="text-xl font-medium text-zinc-400">%</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-2">Limite recomendado: 4% (NBR 5410)</p>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg focus:border-zinc-300 dark:focus:border-zinc-600 outline-none transition-all dark:text-white text-sm"
      />
    </div>
  );
}

function ResultItem({ label, value, unit }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-light text-zinc-900 dark:text-white">{value}</span>
        <span className="text-xs font-medium text-zinc-400">{unit}</span>
      </div>
    </div>
  );
}
