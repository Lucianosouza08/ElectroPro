import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Calculator, 
  Ruler, 
  FileText, 
  BookOpen, 
  Settings, 
  Menu, 
  X,
  Sun,
  Moon,
  TrendingDown,
  ArrowRightLeft,
  ChevronRight,
  Plus,
  User,
  Package,
  MessageSquare,
  Accessibility,
  Eye,
  Type,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils';
import Calculators from './pages/Calculators';
import Sizing from './pages/Sizing';
import Converters from './pages/Converters';
import Quotes from './pages/Quotes';
import Standards from './pages/Standards';
import Clients from './pages/Clients';
import Materials from './pages/Materials';
import Feedback from './pages/Feedback';

import { useElectroData } from './hooks/useElectroData';
import { formatCurrency } from './utils';

type Tab = 'dashboard' | 'calculators' | 'sizing' | 'converters' | 'quotes' | 'standards' | 'clients' | 'materials' | 'feedback';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isAccessibleFocus, setIsAccessibleFocus] = useState(false);
  const [isScreenReader, setIsScreenReader] = useState(false);
  const { clients, quotes, isLoading } = useElectroData();

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!isScreenReader) return;
      
      const target = e.target as HTMLElement;
      const textToSpeak = target.ariaLabel || target.innerText || target.title || (target as HTMLInputElement).placeholder;
      
      if (textToSpeak && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isScreenReader]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');

    if (isHighContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');

    if (isLargeText) root.classList.add('large-text');
    else root.classList.remove('large-text');

    if (isAccessibleFocus) root.classList.add('accessible-focus');
    else root.classList.remove('accessible-focus');
  }, [isDarkMode, isHighContrast, isLargeText, isAccessibleFocus]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Zap },
    { id: 'calculators', label: 'Calculadoras', icon: Calculator },
    { id: 'sizing', label: 'Dimensionamento', icon: Ruler },
    { id: 'converters', label: 'Conversores', icon: ArrowRightLeft },
    { id: 'quotes', label: 'Orçamentos', icon: FileText },
    { id: 'clients', label: 'Clientes', icon: User },
    { id: 'materials', label: 'Materiais', icon: Package },
    { id: 'standards', label: 'Normas', icon: BookOpen },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} clients={clients} quotes={quotes} isLoading={isLoading} />;
      case 'calculators': return <Calculators />;
      case 'sizing': return <Sizing />;
      case 'converters': return <Converters />;
      case 'quotes': return <Quotes />;
      case 'clients': return <Clients />;
      case 'materials': return <Materials />;
      case 'standards': return <Standards />;
      case 'feedback': return <Feedback />;
      default: return <Dashboard onNavigate={setActiveTab} clients={clients} quotes={quotes} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 transition-colors duration-300 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 no-print",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center gap-3">
            <Zap className="text-zinc-900 dark:text-white w-6 h-6" />
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">ElectroPro</span>
          </div>

          <nav className="flex-1 px-6 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-zinc-900 dark:text-white" : "text-zinc-400")} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
              </div>
            </button>

            <div className="pt-2 pb-1 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                <Accessibility className="w-3 h-3" />
                Acessibilidade
              </p>
            </div>

            <button 
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 rounded-lg text-xs font-medium transition-all",
                isHighContrast ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              aria-pressed={isHighContrast}
            >
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4" />
                Alto Contraste
              </div>
            </button>

            <button 
              onClick={() => setIsLargeText(!isLargeText)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 rounded-lg text-xs font-medium transition-all",
                isLargeText ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              aria-pressed={isLargeText}
            >
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4" />
                Texto Ampliado
              </div>
            </button>

            <button 
              onClick={() => setIsAccessibleFocus(!isAccessibleFocus)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 rounded-lg text-xs font-medium transition-all",
                isAccessibleFocus ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              aria-pressed={isAccessibleFocus}
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-current rounded-sm" />
                Destaque de Foco
              </div>
            </button>

            <button 
              onClick={() => setIsScreenReader(!isScreenReader)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 rounded-lg text-xs font-medium transition-all",
                isScreenReader ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              aria-pressed={isScreenReader}
            >
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4" />
                Narrador (Voz)
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 no-print">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-400">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="text-primary-600 w-5 h-5" />
            <span className="font-bold text-slate-900 dark:text-white">ElectroPro</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Dashboard({ onNavigate, clients, quotes, isLoading }: { onNavigate: (tab: Tab) => void, clients: any[], quotes: any[], isLoading: boolean }) {
  const stats = [
    { label: 'Orçamentos', value: quotes.length.toString(), icon: FileText },
    { label: 'Clientes', value: clients.length.toString(), icon: User },
    { label: 'Total Orçado', value: formatCurrency(quotes.reduce((acc, q) => acc + q.total, 0)), icon: Calculator },
  ];

  const recentQuotes = quotes.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Visão geral da sua atividade técnica.</p>
        </div>
        <button 
          onClick={() => onNavigate('quotes')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium transition-all hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{stat.label}</p>
            <p className="text-3xl font-light text-zinc-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Acesso Rápido</h2>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Lei de Ohm', tab: 'calculators', icon: Calculator },
              { label: 'Queda de Tensão', tab: 'calculators', icon: TrendingDown },
              { label: 'Dimensionamento de Cabos', tab: 'sizing', icon: Ruler },
              { label: 'Conversores Técnicos', tab: 'converters', icon: ArrowRightLeft },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => onNavigate(item.tab as Tab)}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-all" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Últimos Orçamentos</h2>
            <button onClick={() => onNavigate('quotes')} className="text-xs font-bold text-zinc-900 dark:text-white hover:underline">Ver todos</button>
          </div>
          <div className="space-y-4">
            {recentQuotes.length > 0 ? recentQuotes.map((quote, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{quote.clientName}</p>
                  <p className="text-xs text-zinc-400">{quote.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-zinc-900 dark:text-white">{formatCurrency(quote.total)}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">{quote.status}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-zinc-400 py-8">Nenhum orçamento recente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
