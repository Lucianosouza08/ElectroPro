import React, { useState, useMemo } from 'react';
import { Package, Plus, Trash2, Tag, DollarSign, Layers, Search, Filter } from 'lucide-react';
import { useElectroData } from '../hooks/useElectroData';
import { formatCurrency, cn } from '../utils';

export default function Materials() {
  const { materials, refresh } = useElectroData();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUnit, setFilterUnit] = useState('all');

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    unit: 'un',
    price: 0,
    category: 'Material'
  });

  const categories = useMemo(() => {
    const cats = new Set(materials.map(m => m.category || 'Material'));
    return ['all', ...Array.from(cats)];
  }, [materials]);

  const units = useMemo(() => {
    const u = new Set(materials.map(m => m.unit));
    return ['all', ...Array.from(u)];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        item.name.toLowerCase().includes(searchLower) ||
        (item.category || 'Material').toLowerCase().includes(searchLower);
      
      const matchesCategory = filterCategory === 'all' || (item.category || 'Material') === filterCategory;
      const matchesUnit = filterUnit === 'all' || item.unit === filterUnit;
      return matchesSearch && matchesCategory && matchesUnit;
    });
  }, [materials, searchQuery, filterCategory, filterUnit]);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.name) return;

    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      });

      if (res.ok) {
        setIsAdding(false);
        setNewMaterial({ name: '', unit: 'un', price: 0, category: 'Material' });
        refresh();
      }
    } catch (e) {
      console.error("Failed to add material", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white">Materiais</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Lista de preços e insumos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium transition-all hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Novo Item
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAddMaterial} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="md:col-span-2">
                <InputGroup label="Nome do Item" value={newMaterial.name} onChange={(v: string) => setNewMaterial({...newMaterial, name: v})} placeholder="Disjuntor 20A" />
              </div>
              <InputGroup label="Categoria" value={newMaterial.category} onChange={(v: string) => setNewMaterial({...newMaterial, category: v})} placeholder="Material" />
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Unidade</label>
                <select 
                  value={newMaterial.unit}
                  onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg outline-none text-sm dark:text-white"
                >
                  <option value="un">Unidade (un)</option>
                  <option value="m">Metro (m)</option>
                  <option value="kg">Quilo (kg)</option>
                  <option value="h">Hora (h)</option>
                  <option value="serviço">Serviço</option>
                </select>
              </div>
              <InputGroup label="Preço (R$)" value={newMaterial.price.toString()} onChange={(v: string) => setNewMaterial({...newMaterial, price: parseFloat(v)})} placeholder="0.00" />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-zinc-500 text-sm font-medium hover:text-zinc-900 transition-all">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium transition-all hover:opacity-90">Salvar Item</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-300 transition-all text-sm dark:text-white"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl outline-none text-xs font-medium text-zinc-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'Categorias' : cat}</option>
            ))}
          </select>
          <select 
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl outline-none text-xs font-medium text-zinc-500"
          >
            {units.map(u => (
              <option key={u} value={u}>{u === 'all' ? 'Unidades' : u}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Item</th>
              <th className="py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Unidade</th>
              <th className="py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Preço</th>
              <th className="py-4 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-zinc-400 text-sm">
                  Nenhum item encontrado.
                </td>
              </tr>
            ) : (
              filteredMaterials.map(item => (
                <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all">
                  <td className="py-4">
                    <p className="font-medium text-zinc-900 dark:text-white">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{item.category || 'Material'}</p>
                  </td>
                  <td className="py-4 text-sm text-zinc-500">{item.unit}</td>
                  <td className="py-4 font-medium text-zinc-900 dark:text-white">{formatCurrency(item.price)}</td>
                  <td className="py-4 text-right">
                    <button className="p-2 text-zinc-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg outline-none focus:border-zinc-300 dark:focus:border-zinc-600 transition-all dark:text-white text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}
