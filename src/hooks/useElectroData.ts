import { useState, useEffect } from 'react';
import { Client, Material, Quote, QuoteItem } from '../types';

// This is a mock service that will eventually use the backend if needed,
// but for now we'll use localStorage to ensure it works in the preview
// without needing a complex backend setup immediately.
// However, the prompt asked for SQLite. I'll implement a simple Express backend
// with better-sqlite3 as requested in the "Full-Stack" section.

export function useElectroData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cRes, mRes, qRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/materials'),
        fetch('/api/quotes')
      ]);
      if (cRes.ok) setClients(await cRes.json());
      if (mRes.ok) setMaterials(await mRes.json());
      if (qRes.ok) setQuotes(await qRes.json());
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { clients, materials, quotes, isLoading, refresh: fetchData };
}
