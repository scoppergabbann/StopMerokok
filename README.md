# StopMerokok

Website pendamping untuk orang yang ingin berhenti atau mengurangi rokok secara bertahap. Fokus awal produk adalah check-in harian, streak bebas rokok, progress sederhana, dan dukungan yang terasa manusiawi.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase untuk auth dan database

## Development

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Supabase

1. Buat project Supabase.
2. Jalankan SQL di `supabase/schema.sql` lewat SQL Editor Supabase.
3. Isi `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Kalau env belum diisi, app akan fallback ke `localStorage` untuk mode demo.
Saat env Supabase aktif, register/login memakai Supabase Auth dan data app disimpan per user dengan RLS.

Tabel awal yang tersedia:

- `profiles`
- `daily_checkins`
- `craving_logs`
- `journals`
- `rewards`
- `user_badges`
- `notification_settings`

## Dokumentasi Produk

PRD awal ada di [docs/StopRokok_PRD.md](docs/StopRokok_PRD.md).

## MVP Scope

- Landing page
- Login/register
- Onboarding
- Dashboard
- Daily check-in
- Streak dan statistik dasar
- Kalender progress
- Savings/donasi
- Journal harian
- Insight trigger kambuh
- Push notification opt-in
- Auth redirect berdasarkan kelengkapan profile
- Badge unlock tersimpan per user
- Setting jam reminder harian
