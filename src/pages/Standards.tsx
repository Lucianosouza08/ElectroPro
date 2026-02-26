import React, { useState } from 'react';
import { BookOpen, Search, ExternalLink, ChevronRight, Star } from 'lucide-react';
import { cn } from '../utils';

const STANDARDS = [
  {
    id: 'nbr5410',
    title: 'ABNT NBR 5410',
    subtitle: 'Instalações elétricas de baixa tensão',
    summary: 'Estabelece as condições que as instalações elétricas de baixa tensão devem satisfazer a fim de garantir a segurança de pessoas e animais, o funcionamento adequado da instalação e a conservação dos bens.',
    topics: [
      'Dimensionamento de condutores por capacidade de condução',
      'Proteção contra choques elétricos e sobretensões',
      'Aterramento e equipotencialização',
      'Dispositivos de proteção (DR, DPS, Disjuntores)'
    ]
  },
  {
    id: 'nbr5419',
    title: 'ABNT NBR 5419',
    subtitle: 'Proteção contra descargas atmosféricas (PDA)',
    summary: 'Fixa as condições para projeto, instalação e manutenção de sistemas de proteção contra descargas atmosféricas (SPDA) para proteger as edificações e as pessoas.',
    topics: [
      'Análise de risco (Parte 2)',
      'Danos físicos a estruturas e perigo à vida (Parte 3)',
      'Sistemas elétricos e eletrônicos internos (Parte 4)'
    ]
  },
  {
    id: 'nr10',
    title: 'NR-10',
    subtitle: 'Segurança em Instalações e Serviços em Eletricidade',
    summary: 'Norma Regulamentadora que estabelece os requisitos e condições mínimas objetivando a implementação de medidas de controle e sistemas preventivos.',
    topics: [
      'Medidas de controle de risco elétrico',
      'Habilitação, qualificação, capacitação e autorização',
      'Trabalhos em proximidade e zonas de risco',
      'Equipamentos de Proteção Individual (EPI)'
    ]
  },
  {
    id: 'iec60364',
    title: 'IEC 60364',
    subtitle: 'Low-voltage electrical installations',
    summary: 'International standard for electrical installations of buildings. Base for many national standards including NBR 5410.',
    topics: [
      'Protection for safety',
      'Selection and erection of electrical equipment',
      'Verification and testing'
    ]
  }
];

export default function Standards() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = STANDARDS.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Normas e Referências</h1>
          <p className="text-slate-500 dark:text-slate-400">Resumos técnicos e guias práticos das principais normas do setor.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar norma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {filtered.map((standard) => (
            <button
              key={standard.id}
              onClick={() => setSelectedId(standard.id)}
              className={cn(
                "w-full text-left p-6 rounded-3xl border transition-all group",
                selectedId === standard.id
                  ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-primary-200 dark:hover:border-primary-900"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                  selectedId === standard.id ? "bg-white/20 text-white" : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                )}>
                  {standard.id.toUpperCase()}
                </span>
                <Star className={cn("w-4 h-4", selectedId === standard.id ? "text-white" : "text-slate-300 group-hover:text-primary-400")} />
              </div>
              <h3 className="font-bold text-lg leading-tight">{standard.title}</h3>
              <p className={cn(
                "text-xs mt-1 font-medium",
                selectedId === standard.id ? "text-white/70" : "text-slate-500 dark:text-slate-400"
              )}>
                {standard.subtitle}
              </p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selectedId ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {(() => {
                const s = STANDARDS.find(st => st.id === selectedId)!;
                return (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{s.title}</h2>
                        <p className="text-lg font-medium text-primary-600 dark:text-primary-400 mt-1">{s.subtitle}</p>
                      </div>
                      <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary-600 rounded-2xl transition-all">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Resumo Técnico</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {s.summary}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Tópicos Principais</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {s.topics.map((topic, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs shadow-sm">
                              {i + 1}
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                      <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all">
                        Acessar Guia de Campo Completo
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Selecione uma norma</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs">Escolha uma norma na lista ao lado para visualizar o resumo técnico e tópicos principais.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
