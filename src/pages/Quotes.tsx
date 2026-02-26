import React, { useState } from 'react';
import { FileText, Plus, Download, Trash2, User, Package, Calendar, X, Printer } from 'lucide-react';
import { useElectroData } from '../hooks/useElectroData';
import { formatCurrency, cn } from '../utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Quotes() {
  const { clients, materials, quotes, refresh } = useElectroData();
  const [isCreating, setIsCreating] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<any | null>(null);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  const fetchQuoteDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/quotes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setViewingQuote(data);
      }
    } catch (e) {
      console.error("Failed to fetch quote details", e);
    }
  };

  const deleteQuote = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      if (res.ok) refresh();
    } catch (e) {
      console.error("Failed to delete quote", e);
    }
  };

  const addItem = () => {
    const firstMaterial = materials[0];
    setItems([...items, { 
      materialId: firstMaterial?.id || 0, 
      quantity: 1, 
      unitPrice: firstMaterial?.price || 0, 
      total: firstMaterial?.price || 0 
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'materialId') {
      const mat = materials.find(m => m.id === parseInt(value));
      if (mat) {
        item.unitPrice = mat.price;
      }
    }
    
    item.total = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const saveQuote = async () => {
    if (!selectedClient || items.length === 0) {
      alert("Selecione um cliente e adicione pelo menos um item.");
      return;
    }

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          date: new Date().toISOString().split('T')[0],
          items,
          notes
        })
      });

      if (response.ok) {
        setIsCreating(false);
        setItems([]);
        setSelectedClient(null);
        setNotes('');
        refresh();
      }
    } catch (e) {
      console.error("Failed to save quote", e);
    }
  };

  const exportPDF = async (quoteId: number) => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`);
      if (!res.ok) return;
      const quote = await res.json();

      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text('ElectroPro', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Proposta Técnica de Serviços Elétricos', 14, 28);
      
      doc.setDrawColor(240);
      doc.line(14, 32, 196, 32);

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Informações do Cliente', 14, 42);
      doc.setFontSize(10);
      doc.text(`Nome: ${quote.clientName}`, 14, 48);
      doc.text(`Endereço: ${quote.clientAddress || 'N/A'}`, 14, 53);
      doc.text(`Contato: ${quote.clientPhone || 'N/A'}`, 14, 58);

      doc.text(`Orçamento Nº: ${quote.id}`, 140, 48);
      doc.text(`Data: ${quote.date}`, 140, 53);
      doc.text(`Status: ${quote.status.toUpperCase()}`, 140, 58);

      const tableHead = [['Item', 'Material/Serviço', 'Qtd', 'Unid', 'V. Unit', 'Total']];
      const tableBody = quote.items.map((item: any, index: number) => [
        index + 1,
        item.materialName,
        item.quantity,
        item.materialUnit,
        formatCurrency(item.unitPrice),
        formatCurrency(item.total)
      ]);

      (doc as any).autoTable({
        startY: 65,
        head: tableHead,
        body: tableBody,
        theme: 'striped',
        headStyles: { fillStyle: [20, 20, 20] }
      });

      const finalY = (doc as any).lastAutoTable.finalY;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Valor Total: ${formatCurrency(quote.total)}`, 140, finalY + 15);

      if (quote.notes) {
        doc.setFontSize(12);
        doc.text('Observações:', 14, finalY + 25);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitNotes = doc.splitTextToSize(quote.notes, 180);
        doc.text(splitNotes, 14, finalY + 32);
      }

      doc.save(`electropro_orcamento_${quote.id}.pdf`);
    } catch (e) {
      console.error("Failed to export PDF", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white">Orçamentos</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Propostas técnicas e comerciais.</p>
        </div>
        {!isCreating && !viewingQuote && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium transition-all hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Cliente</label>
              <select 
                value={selectedClient || ''} 
                onChange={(e) => setSelectedClient(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg outline-none text-sm dark:text-white"
              >
                <option value="">Selecione um cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Data</label>
              <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg outline-none text-sm dark:text-white" />
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Itens</h3>
              <button onClick={addItem} className="text-xs font-bold text-zinc-900 dark:text-white hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Adicionar Item
              </button>
            </div>

            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <p className="text-xs text-zinc-400">Nenhum item adicionado.</p>
                </div>
              ) : items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-700">
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Material</label>
                    <select 
                      value={item.materialId} 
                      onChange={(e) => updateItem(index, 'materialId', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg outline-none text-xs dark:text-white"
                    >
                      {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Qtd</label>
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg outline-none text-xs dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">V. Unit</label>
                    <input 
                      type="number" 
                      value={item.unitPrice} 
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg outline-none text-xs dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Total</label>
                    <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                  <div className="md:col-span-1 flex justify-center">
                    <button onClick={() => removeItem(index)} className="p-2 text-zinc-300 hover:text-rose-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 mb-12">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Observações</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl outline-none dark:text-white h-24 resize-none text-sm"
              placeholder="Notas adicionais..."
            />
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-2xl font-light text-zinc-900 dark:text-white">
              Total: <span className="font-bold">{formatCurrency(items.reduce((acc, item) => acc + item.total, 0))}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-zinc-500 text-sm font-medium hover:text-zinc-900 transition-all">Cancelar</button>
              <button onClick={saveQuote} className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium transition-all hover:opacity-90">Salvar Orçamento</button>
            </div>
          </div>
        </div>
      ) : viewingQuote ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Orçamento #{viewingQuote.id}</h2>
              <p className="text-sm text-zinc-500">Cliente: {viewingQuote.clientName}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => window.print()} 
                className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-100 transition-all no-print"
                title="Imprimir Orçamento"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button onClick={() => exportPDF(viewingQuote.id)} className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-100 transition-all no-print">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => setViewingQuote(null)} className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-100 transition-all no-print">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Data</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{viewingQuote.date}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Status</p>
              <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-bold rounded-full uppercase">
                {viewingQuote.status}
              </span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Total</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">{formatCurrency(viewingQuote.total)}</p>
            </div>
          </div>

          <div className="space-y-4 mb-12">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Itens</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold uppercase text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="py-2">Material/Serviço</th>
                    <th className="py-2">Qtd</th>
                    <th className="py-2">V. Unit</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                  {viewingQuote.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3 text-sm font-medium text-zinc-900 dark:text-white">{item.materialName}</td>
                      <td className="py-3 text-sm text-zinc-500">{item.quantity} {item.materialUnit}</td>
                      <td className="py-3 text-sm text-zinc-500">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-sm font-bold text-zinc-900 dark:text-white text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {viewingQuote.notes && (
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-2">Observações</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{viewingQuote.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {quotes.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-zinc-400 text-sm">Nenhum orçamento encontrado.</p>
            </div>
          ) : (
            quotes.map((quote) => (
              <div key={quote.id} className="group p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => fetchQuoteDetails(quote.id)}>
                  <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                    <FileText className="text-zinc-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{(quote as any).clientName}</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">#{quote.id} • {quote.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{formatCurrency(quote.total)}</p>
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
                      quote.status === 'approved' ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                    )}>
                      {quote.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => exportPDF(quote.id)}
                      className="p-2 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteQuote(quote.id)}
                      className="p-2 text-zinc-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
