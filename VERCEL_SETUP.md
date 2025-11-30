# IMPORTANT: Configurare su Vercel Dashboard

> [!WARNING]
> **Prima del deploy su Vercel**, configura queste variabili ambiente nel dashboard:

## Variabili Ambiente Richieste

Vai su: **Vercel Dashboard** → **Tuo Progetto** → **Settings** → **Environment Variables**

Aggiungi le seguenti variabili per **Production**, **Preview** e **Development**:

### Database
```
DATABASE_URL=postgresql://neondb_owner:npg_CpoZUnjVf9z5@ep-young-voice-aba17lvk-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### Stack Auth (opzionale - se in futuro vorrai usarlo)
```
NEXT_PUBLIC_STACK_PROJECT_ID=c1db4ba6-b46a-418d-b5d3-17930d2d35eb
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_dp88fhy4yrrjx0yceepvzyfh8fn73hwgb3bjrxd18ash8
STACK_SECRET_SERVER_KEY=ssk_kpxqh1jqc8hksdz73c23nt1bbny9cn29mqgx3kamt3a48
```

## Come Configurare

1. Copia il `DATABASE_URL` da sopra
2. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
3. Clicca sul progetto **FamilyPlanner**
4. Vai in **Settings** → **Environment Variables**
5. Aggiungi `DATABASE_URL` e incolla il valore
6. Seleziona: **Production**, **Preview**, **Development**
7. Clicca **Save**
8. Fai **Redeploy** dal tab **Deployments**

Il deploy dovrebbe funzionare! 🚀
