import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("electropro.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unit TEXT,
    price REAL,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER,
    date TEXT,
    total REAL,
    status TEXT,
    notes TEXT,
    FOREIGN KEY(clientId) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS quote_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quoteId INTEGER,
    materialId INTEGER,
    quantity REAL,
    unitPrice REAL,
    total REAL,
    FOREIGN KEY(quoteId) REFERENCES quotes(id),
    FOREIGN KEY(materialId) REFERENCES materials(id)
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT, -- 'bug' or 'feature'
    description TEXT,
    email TEXT,
    date TEXT
  );
`);

// Seed some data if empty
const clientCount = db.prepare("SELECT count(*) as count FROM clients").get() as { count: number };
if (clientCount.count === 0) {
  db.prepare("INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)").run(
    "Cliente Exemplo", "contato@exemplo.com", "(11) 99999-9999", "Rua das Flores, 123"
  );
  db.prepare("INSERT INTO materials (name, unit, price, category) VALUES (?, ?, ?, ?)").run("Cabo Flexível 2.5mm²", "m", 4.50, "Cabo");
  db.prepare("INSERT INTO materials (name, unit, price, category) VALUES (?, ?, ?, ?)").run("Disjuntor Monopolar 20A", "un", 15.90, "Proteção");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/clients", (req, res) => {
    try {
      const clients = db.prepare("SELECT * FROM clients ORDER BY name ASC").all();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", (req, res) => {
    try {
      const { name, email, phone, address } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
      
      const result = db.prepare("INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)").run(name, email, phone, address);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.get("/api/materials", (req, res) => {
    try {
      const materials = db.prepare("SELECT * FROM materials ORDER BY name ASC").all();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch materials" });
    }
  });

  app.post("/api/materials", (req, res) => {
    try {
      const { name, unit, price, category } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
      
      const result = db.prepare("INSERT INTO materials (name, unit, price, category) VALUES (?, ?, ?, ?)").run(name, unit, price, category || 'Material');
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create material" });
    }
  });

  app.get("/api/quotes", (req, res) => {
    try {
      const quotes = db.prepare(`
        SELECT q.*, c.name as clientName 
        FROM quotes q 
        JOIN clients c ON q.clientId = c.id
        ORDER BY q.date DESC, q.id DESC
      `).all();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", (req, res) => {
    try {
      const quote = db.prepare(`
        SELECT q.*, c.name as clientName, c.email as clientEmail, c.phone as clientPhone, c.address as clientAddress
        FROM quotes q 
        JOIN clients c ON q.clientId = c.id
        WHERE q.id = ?
      `).get(req.params.id);
      
      if (!quote) return res.status(404).json({ error: "Quote not found" });
      
      const items = db.prepare(`
        SELECT qi.*, m.name as materialName, m.unit as materialUnit
        FROM quote_items qi
        JOIN materials m ON qi.materialId = m.id
        WHERE qi.quoteId = ?
      `).all(req.params.id);
      
      res.json({ ...quote, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote details" });
    }
  });

  app.post("/api/quotes", (req, res) => {
    try {
      const { clientId, date, items, notes } = req.body;
      if (!clientId || !items || !items.length) {
        return res.status(400).json({ error: "Client and items are required" });
      }

      const total = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);
      
      const insertQuote = db.transaction((quoteData) => {
        const result = db.prepare("INSERT INTO quotes (clientId, date, total, status, notes) VALUES (?, ?, ?, ?, ?)").run(
          quoteData.clientId, quoteData.date, quoteData.total, 'draft', quoteData.notes
        );
        const quoteId = result.lastInsertRowid;
        
        const itemStmt = db.prepare("INSERT INTO quote_items (quoteId, materialId, quantity, unitPrice, total) VALUES (?, ?, ?, ?, ?)");
        for (const item of quoteData.items) {
          itemStmt.run(quoteId, item.materialId, item.quantity, item.unitPrice, item.quantity * item.unitPrice);
        }
        return quoteId;
      });

      const id = insertQuote({ clientId, date, total, items, notes });
      res.json({ id, total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create quote" });
    }
  });

  app.delete("/api/quotes/:id", (req, res) => {
    try {
      const deleteTransaction = db.transaction((id) => {
        db.prepare("DELETE FROM quote_items WHERE quoteId = ?").run(id);
        db.prepare("DELETE FROM quotes WHERE id = ?").run(id);
      });
      deleteTransaction(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quote" });
    }
  });

  app.post("/api/feedback", (req, res) => {
    try {
      const { type, description, email } = req.body;
      if (!description) return res.status(400).json({ error: "Description is required" });
      
      const date = new Date().toISOString();
      db.prepare("INSERT INTO feedback (type, description, email, date) VALUES (?, ?, ?, ?)").run(type, description, email, date);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
