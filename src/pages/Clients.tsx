import React, { useState } from 'react';
import { User, Plus, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { useElectroData } from '../hooks/useElectroData';

export default function Clients() {
  const { clients, refresh } = useElectroData();
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });

      if (res.ok) {
        setIsAdding(false);
        setNewClient({ name: '', email: '', phone: '', address: '' });
        refresh();
      }
    } catch (e) {
      console.error("Failed to add client", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white">Clientes</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Gerencie sua base de contatos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium transition-all hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAddClient} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup label="Nome Completo" value={newClient.name} onChange={(v: string) => setNewClient({...newClient, name: v})} placeholder="João Silva" />
              <InputGroup label="E-mail" value={newClient.email} onChange={(v: string) => setNewClient({...newClient, email: v})} placeholder="joao@email.com" />
              <InputGroup label="Telefone" value={newClient.phone} onChange={(v: string) => setNewClient({...newClient, phone: v})} placeholder="(11) 99999-9999" />
              <InputGroup label="Endereço" value={newClient.address} onChange={(v: string) => setNewClient({...newClient, address: v})} placeholder="Rua Exemplo, 123" />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-zinc-500 text-sm font-medium hover:text-zinc-900 transition-all">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium transition-all hover:opacity-90">Salvar Cliente</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clients.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <p className="text-zinc-400 text-sm">Nenhum cliente cadastrado.</p>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="group p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <User className="text-zinc-400 w-5 h-5" />
                </div>
                <button className="p-2 text-zinc-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">{client.name}</h3>
              <div className="mt-4 space-y-1.5">
                {client.email && <p className="text-xs text-zinc-500 flex items-center gap-2"><Mail className="w-3 h-3" /> {client.email}</p>}
                {client.phone && <p className="text-xs text-zinc-500 flex items-center gap-2"><Phone className="w-3 h-3" /> {client.phone}</p>}
                {client.address && <p className="text-xs text-zinc-500 flex items-center gap-2"><MapPin className="w-3 h-3" /> {client.address}</p>}
              </div>
            </div>
          ))
        )}
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
