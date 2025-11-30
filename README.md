# BudgetManager - Family Planner App

Applicazione completa per la gestione familiare: lista della spesa, dispensa, budget, storico acquisti e ricette.

## 🚀 Setup Rapido

### 1. Database Neon (Gratuito)

1. Vai su [neon.tech](https://neon.tech)
2. Crea un account gratuito
3. Crea un nuovo progetto PostgreSQL
4. Copia il **connection string**

### 2. Configurazione Locale

```bash
# Installa dipendenze
npm install

# Configura variabili ambiente
cp .env.example .env
# Incolla il tuo DATABASE_URL da Neon in .env

# Esegui le migrazioni del database
npx prisma db push

# Avvia in sviluppo
npm run dev
```

### 3. Primo Accesso

- **Username**: `Arena`
- **Password**: `Arena`

## 📦 Funzionalità

### ✅ Lista della Spesa
- Aggiungi/modifica/elimina prodotti
- Checkbox per prodotti acquistati
- Categorie personalizzate
- Funzione "Concludi Spesa" per aggiornare budget e storico

### 🏠 Dispensa
- Gestisci prodotti in casa
- Modifica quantità
- Sposta prodotti nella lista della spesa
- Filtri per categoria

### 💰 Budget
- Imposta budget mensile
- Visualizzazione circolare progressiva
- Colori dinamici: verde (<70%), giallo (70-90%), rosso (90-100%)
- Aggiornamento automatico dalle spese

### 📊 Storico
- Visualizzazione acquisti fino a 24 mesi
- Selezione mese
- Totale speso per mese

### 👨‍🍳 Ricette
- Importa ricette da file PDF o Word
- Estrazione automatica: nome, ingredienti, preparazione
- CRUD completo (aggiungi, modifica, elimina)
- Espandi/comprimi ricette

## 🚀 Deploy su Vercel

1. Push del codice su GitHub
2. Importa progetto su [vercel.com](https://vercel.com)
3. Aggiungi la variabile `DATABASE_URL` nelle impostazioni ambiente
4. Deploy automatico ✨

## 🎨 Tecnologie

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Parsing**: pdf-parse, mammoth
- **UI**: next-themes (dark mode), sonner (notifications)

## 📱 Mobile-First

L'app è ottimizzata per dispositivi mobili con:
- Navbar fissa in basso
- Design responsive
- Touch-friendly
- Dark mode

---

**Buon utilizzo! 🎉**
