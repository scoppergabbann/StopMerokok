# PRD StopRokok

## 1. Nama Produk

Rekomendasi nama:

- **Lega**: terasa ringan, manusiawi, dan tidak menghakimi.
- **HariLega**: fokus pada perjuangan harian.
- **StopRokok**: jelas, mudah dicari, langsung paham.
- **NapasBaru**: lebih emosional dan positif.

Rekomendasi utama: **Lega** dengan tagline **"Berhenti pelan-pelan, ditemani tiap hari."**

Jika ingin nama yang sangat jelas untuk SEO dan komunikasi awal, gunakan **StopRokok**. Jika ingin brand yang lebih hangat dan tahan lama, gunakan **Lega**.

## 2. Visi Produk

StopRokok adalah teman harian untuk orang yang ingin berhenti atau mengurangi rokok secara bertahap. Produk ini membantu user mencatat kondisi hariannya, melihat progress, memahami pola kambuh, dan merasa tetap didukung bahkan saat belum berhasil.

Prinsip utama:

- Tidak menghakimi.
- Fokus pada progress, bukan kesempurnaan.
- Sederhana untuk dipakai setiap hari.
- Mobile-first.
- Emosional, tenang, dan suportif.

## 3. Target User

- Orang yang ingin berhenti merokok total.
- Orang yang ingin mengurangi rokok perlahan.
- Orang yang pernah gagal berhenti dan butuh sistem sederhana.
- Usia 18-45 tahun.
- User umum, termasuk yang tidak terbiasa memakai aplikasi kompleks.

## 4. Value Proposition

Headline:

**Berhenti merokok tidak harus sendirian.**

Subheadline:

**Catat progress harianmu, lihat uang yang kamu hemat, dan bangun kebiasaan baru satu hari demi satu hari.**

Manfaat utama:

- User tahu progress mereka setiap hari.
- User bisa melihat dampak finansial dari pengurangan rokok.
- User punya ruang aman untuk mencatat kegagalan tanpa merasa dihakimi.
- User bisa mengenali trigger kambuh.
- User mendapat dorongan kecil saat craving muncul.

## 5. Struktur Halaman

### Public

1. **Landing Page**
   - Hero
   - Problem
   - Fitur utama
   - Cara kerja
   - CTA daftar

2. **Login**
   - Email/password
   - OAuth optional
   - Link register

3. **Register**
   - Email/password
   - Setelah sukses diarahkan ke onboarding

### Authenticated

1. **Onboarding**
   - Nama panggilan
   - Baseline rokok per hari
   - Harga per bungkus
   - Batang per bungkus
   - Target berhenti
   - Alasan berhenti

2. **Dashboard**
   - Greeting personal
   - Status absen hari ini
   - Tombol besar absen
   - Current streak
   - Total hari bebas rokok
   - Total uang dihemat
   - Total batang dihindari
   - Progress target
   - Motivasi harian
   - Tombol emergency craving

3. **Daily Check-in**
   - Pilih status hari ini
   - Input batang rokok jika mengurangi/kambuh
   - Mood
   - Trigger jika kambuh
   - Catatan optional
   - Feedback suportif setelah submit

4. **Progress Calendar**
   - Kalender bulanan
   - Warna per status
   - Detail check-in saat tanggal diklik

5. **Statistik**
   - Grafik jumlah rokok per hari
   - Hari bebas rokok per bulan
   - Uang dihemat
   - Bungkus tidak dibeli
   - Trigger kambuh paling sering
   - Mood saat kambuh
   - Progress dibanding baseline

6. **Savings & Reward**
   - Total uang dihemat
   - Estimasi setara kopi/makan/tabungan
   - Target reward pribadi

7. **Motivasi**
   - Quote harian
   - Tips craving
   - Edukasi singkat
   - Reminder alasan berhenti

8. **Craving Mode**
   - Timer 5 menit
   - Instruksi napas
   - Checklist tindakan cepat
   - Tombol berhasil melewati craving

9. **Journal**
   - Tanggal
   - Mood
   - Cerita hari ini
   - Tantangan
   - Hal yang disyukuri
   - Fokus besok

10. **Profile & Settings**
    - Data user
    - Baseline
    - Harga rokok
    - Target
    - Alasan berhenti
    - Edit target
    - Reset progress
    - Logout

## 6. User Flow

### Flow User Baru

1. User membuka landing page.
2. User klik "Mulai perjalanan hari ini".
3. User register.
4. User mengisi onboarding.
5. User masuk dashboard.
6. User melakukan check-in pertama.
7. User mendapat feedback suportif.
8. Dashboard diperbarui dengan progress awal.

### Flow Check-in Harian

1. User membuka dashboard.
2. Sistem menampilkan status "Belum absen hari ini".
3. User klik "Absen Hari Ini".
4. User memilih status:
   - Bebas Rokok
   - Mengurangi
   - Kambuh
5. User mengisi data tambahan sesuai status.
6. User submit.
7. Sistem menyimpan check-in.
8. Sistem menampilkan feedback.
9. Dashboard, streak, statistik, dan savings diperbarui.

### Flow Craving

1. User klik "Saya Lagi Ingin Merokok".
2. Sistem membuka mode bantuan cepat.
3. Timer 5 menit berjalan.
4. User mengikuti checklist.
5. User klik "Saya berhasil melewati craving".
6. Sistem menyimpan craving log.
7. Jika memenuhi kondisi, badge terbuka.

## 7. Fitur Utama

### Authentication & Onboarding

Tujuan: membuat pengalaman awal terasa personal.

Data onboarding dipakai untuk:

- Menghitung baseline.
- Menghitung uang dihemat.
- Menghitung batang rokok yang dihindari.
- Menyesuaikan progress target.
- Menampilkan alasan berhenti di dashboard dan profil.

### Dashboard

Dashboard harus terasa seperti sapaan dari teman, bukan panel rumah sakit.

Komponen utama:

- Greeting personal.
- Card status hari ini.
- CTA besar "Absen Hari Ini".
- Ringkasan progress.
- Motivasi harian.
- Emergency craving button.

### Daily Check-in

Status:

- **Bebas Rokok**: smoked_count = 0.
- **Mengurangi**: smoked_count diisi user dan dibandingkan baseline.
- **Kambuh**: smoked_count diisi user, trigger ditanyakan.

Catatan penting:

- Jangan pakai kata "gagal" sebagai label utama UI.
- Pakai "Kambuh" karena lebih manusiawi.
- Setelah kambuh, berikan pesan mulai ulang, bukan hukuman.

### Streak System

Data:

- Current streak: hari berturut-turut bebas rokok.
- Longest streak: streak bebas rokok terpanjang.
- Total smoke-free days.
- Total reduced days.
- Total relapse days.

Aturan:

- Bebas Rokok menambah current streak.
- Mengurangi tidak menambah streak bebas rokok, tapi tetap dihitung progress.
- Kambuh reset current streak.
- Tampilkan "recovery streak" atau "Mulai lagi hari ini" untuk menjaga motivasi.

### Calendar Progress

Warna:

- Hijau lembut: Bebas Rokok.
- Kuning hangat: Mengurangi.
- Merah lembut: Kambuh.
- Abu-abu muda: Belum absen.

Saat tanggal diklik:

- Status.
- Jumlah batang.
- Mood.
- Trigger.
- Catatan.

### Statistik & Insight

Grafik:

- Jumlah rokok per hari.
- Hari bebas rokok per bulan.
- Progress dibanding baseline.

Insight:

- Trigger paling sering.
- Mood paling sering saat kambuh.
- Estimasi pengurangan konsumsi.

Contoh insight:

**Kamu paling sering kambuh saat stres. Mungkin kamu bisa siapkan alternatif kecil: jalan 5 menit, minum air, atau tarik napas dalam.**

### Savings Tracker

Rumus:

```
harga_per_batang = pack_price / sticks_per_pack
batang_dihindari = max(0, smoking_baseline_per_day - smoked_count)
uang_dihemat = batang_dihindari * harga_per_batang
```

Untuk hari bebas rokok:

```
batang_dihindari = smoking_baseline_per_day
```

Untuk hari mengurangi:

```
batang_dihindari = baseline - smoked_count
```

Untuk hari kambuh:

```
batang_dihindari = max(0, baseline - smoked_count)
```

### Motivation & Education

Format konten harus pendek.

Tipe:

- Quote.
- Tips craving.
- Edukasi singkat.
- Cerita kecil.
- Reminder alasan berhenti.

### Emergency Craving Button

Nama tombol:

**Saya Lagi Ingin Merokok**

Isi mode:

- Timer 5 menit.
- Instruksi napas.
- Checklist:
  - Minum air putih.
  - Jalan sebentar.
  - Cuci muka.
  - Jauhkan rokok.
  - Chat teman.
- Motivasi singkat.
- Tombol "Saya berhasil melewati craving".

### Badge

Badge awal:

- Hari Pertama
- 3 Hari Bertahan
- 7 Hari Bebas Rokok
- 30 Hari Perjalanan Baru
- Hemat Rp50.000
- Hemat Rp100.000
- Mengurangi 50 Batang
- Bangkit Lagi Setelah Kambuh
- Berhasil Lewati Craving

### Journal

Field:

- Tanggal.
- Mood.
- Cerita hari ini.
- Tantangan hari ini.
- Hal yang disyukuri.
- Besok ingin lebih baik dalam hal apa.

## 8. UI Copywriting

### Landing

Headline:

**Berhenti merokok tidak harus sendirian.**

Subheadline:

**Catat progress harianmu, lihat uang yang kamu hemat, dan bangun kebiasaan baru satu hari demi satu hari.**

CTA:

**Mulai perjalanan hari ini**

Problem:

**Banyak orang gagal berhenti bukan karena lemah. Sering kali, mereka hanya belum punya sistem sederhana dan dukungan yang cukup.**

### Dashboard

- **Halo, {name}. Gimana kabarmu hari ini?**
- **Tidak harus sempurna. Yang penting hari ini kamu tetap mencoba.**
- **Kamu sudah absen hari ini. Terima kasih sudah jujur sama dirimu sendiri.**
- **Belum absen hari ini. Yuk catat sebentar, cuma butuh satu menit.**

### Check-in

Pilihan:

- **Hari ini saya tidak merokok**
- **Hari ini saya mengurangi**
- **Hari ini saya kambuh**

Feedback:

- Bebas Rokok: **Keren. Hari ini kamu menang satu langkah lagi.**
- Mengurangi: **Bagus. Mengurangi tetap progress. Besok kita coba lebih baik lagi.**
- Kambuh: **Tidak apa-apa. Kambuh bukan akhir. Yang penting kamu sadar dan mau mulai lagi.**

### Empty State

- **Belum ada data. Mulai dari satu absen kecil hari ini.**
- **Progress kamu akan muncul di sini setelah beberapa hari check-in.**
- **Setiap catatan adalah bahan belajar, bukan bahan menghakimi.**

### Craving

- **Tahan 5 menit dulu. Craving biasanya datang seperti ombak: naik, tinggi, lalu turun.**
- **Tarik napas pelan. Kamu tidak perlu menang selamanya, cukup lewati momen ini dulu.**
- **Saya berhasil melewati craving**

## 9. Rekomendasi UI Design

### Karakter Visual

- Clean.
- Calm.
- Supportive.
- Banyak whitespace.
- Mobile-first.
- Tidak terasa seperti aplikasi medis formal.

### Color Palette

- Background: `#F6F8F7`
- Surface/card: `#FFFFFF`
- Primary green: `#4FAE7B`
- Soft green: `#DFF3E8`
- Calm blue: `#7BB7C9`
- Soft blue: `#E3F3F7`
- Text primary: `#1F2933`
- Text secondary: `#64748B`
- Yellow reduced: `#F4C95D`
- Soft yellow bg: `#FFF4CC`
- Soft red relapse: `#E98080`
- Soft red bg: `#FBE3E3`

### Typography

- Font: Inter, Plus Jakarta Sans, atau Geist.
- Heading: tegas tapi ramah.
- Body: 15-16px untuk mobile.
- Hindari teks terlalu panjang di card.

### Component Style

- Rounded cards 16-20px.
- Soft shadow ringan.
- CTA besar dan mudah ditekan.
- Bottom navigation di mobile:
  - Home
  - Progress
  - Absen
  - Motivasi
  - Profil

### Layout Mobile

Dashboard mobile:

1. Greeting.
2. Status hari ini.
3. CTA absen.
4. Ringkasan 2x2:
   - Streak
   - Hari bebas rokok
   - Uang dihemat
   - Batang dihindari
5. Motivasi harian.
6. Emergency craving button.

## 10. Database Schema Supabase

### profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  smoking_baseline_per_day integer not null check (smoking_baseline_per_day >= 0),
  pack_price numeric not null check (pack_price >= 0),
  sticks_per_pack integer not null check (sticks_per_pack > 0),
  target_type text not null check (target_type in ('quit_total', 'reduce_slowly', 'seven_days', 'thirty_days')),
  reason_to_quit text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### daily_checkins

```sql
create table daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  status text not null check (status in ('smoke_free', 'reduced', 'relapsed')),
  smoked_count integer not null default 0 check (smoked_count >= 0),
  mood text check (mood in ('calm', 'stressed', 'happy', 'tired', 'sad', 'motivated')),
  trigger text check (trigger in ('stress', 'hangout', 'coffee', 'work', 'angry_sad', 'after_meal', 'other')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);
```

### craving_logs

```sql
create table craving_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date timestamptz not null default now(),
  status text not null check (status in ('passed', 'smoked')),
  note text,
  created_at timestamptz not null default now()
);
```

### badges

```sql
create table badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  condition_type text not null,
  condition_value integer,
  created_at timestamptz not null default now()
);
```

### user_badges

```sql
create table user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, badge_id)
);
```

### rewards

```sql
create table rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  target_amount numeric check (target_amount >= 0),
  target_days integer check (target_days >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
```

### journals

```sql
create table journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  mood text,
  story text,
  challenge text,
  gratitude text,
  tomorrow_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);
```

### RLS Policy Minimum

```sql
alter table profiles enable row level security;
alter table daily_checkins enable row level security;
alter table craving_logs enable row level security;
alter table user_badges enable row level security;
alter table rewards enable row level security;
alter table journals enable row level security;

create policy "Users can manage own profile"
on profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can manage own checkins"
on daily_checkins for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own craving logs"
on craving_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own badges"
on user_badges for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own rewards"
on rewards for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own journals"
on journals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## 11. MVP Priority

### Phase 1 — MVP Core

- Login/register dengan Supabase Auth.
- Onboarding.
- Dashboard.
- Daily check-in.
- Streak calculation.
- Basic statistics.

Output phase 1:

- User bisa daftar, isi data awal, absen harian, dan melihat progress dasar.

### Phase 2 — Progress & Motivation

- Calendar progress.
- Savings tracker.
- Badge system.
- Motivation content.

Output phase 2:

- User bisa melihat perjalanan secara visual dan mendapat dorongan harian.

### Phase 3 — Support System

- Emergency craving button.
- Journal.
- Insight trigger kambuh.
- Reward tracker.

Output phase 3:

- Website mulai terasa seperti support system, bukan hanya tracker.

### Phase 4 — Polish

- Framer Motion untuk animasi halus.
- Mobile optimization.
- Empty state.
- Copywriting lebih matang.
- Reminder harian.
- Accessibility pass.

Output phase 4:

- Produk terasa halus, ramah, dan siap dipakai user awal.

## 12. Step-by-Step Development Plan

### Step 1 — Setup Project

- Buat Next.js app.
- Install Tailwind CSS.
- Setup Supabase client.
- Setup route structure.
- Buat design tokens warna, spacing, radius, shadow.

### Step 2 — Authentication

- Implement register.
- Implement login.
- Implement logout.
- Protect authenticated routes.
- Redirect user tanpa profile ke onboarding.

### Step 3 — Onboarding

- Buat form onboarding.
- Validasi input.
- Simpan ke `profiles`.
- Redirect ke dashboard.

### Step 4 — Dashboard MVP

- Ambil profile.
- Ambil check-in hari ini.
- Hitung summary:
  - current streak
  - total smoke-free days
  - total reduced days
  - total relapse days
  - saved money
  - avoided sticks
- Render dashboard mobile-first.

### Step 5 — Daily Check-in

- Buat form status.
- Conditional fields untuk reduced/relapsed.
- Mood dan note optional.
- Simpan/update check-in berdasarkan tanggal.
- Tampilkan feedback setelah submit.

### Step 6 — Statistics Basic

- Query check-ins.
- Hitung trend rokok per hari.
- Hitung savings.
- Tampilkan chart sederhana.

### Step 7 — Calendar

- Buat monthly calendar.
- Map status ke warna.
- Tampilkan detail tanggal.

### Step 8 — Motivation & Badge

- Buat daftar konten motivasi statis dulu.
- Buat rules badge.
- Unlock badge setelah check-in atau craving success.

### Step 9 — Craving Mode

- Buat halaman/modal craving.
- Timer 5 menit.
- Checklist.
- Simpan craving log.

### Step 10 — Polish

- Tambah Framer Motion.
- Tambah loading state.
- Tambah empty state.
- Review mobile layout.
- Review copywriting.
- Testing flow utama.

## 13. Tech Stack Recommendation

- Next.js App Router.
- Tailwind CSS.
- Supabase Auth + Database.
- React Hook Form + Zod untuk form.
- Recharts untuk chart sederhana.
- Framer Motion untuk animasi.
- date-fns untuk date handling.
- Lucide React untuk ikon.

## 14. Route Recommendation

```txt
/
/login
/register
/onboarding
/dashboard
/check-in
/calendar
/stats
/savings
/motivation
/craving
/journal
/profile
```

Untuk mobile, `/dashboard` bisa menjadi home setelah login.

## 15. Success Metrics

- User menyelesaikan onboarding.
- User melakukan check-in hari pertama.
- User kembali check-in dalam 3 hari.
- Jumlah check-in per user per minggu.
- Jumlah user yang memakai craving mode.
- Jumlah user yang membuka statistik/savings.
- Retention 7 hari dan 30 hari.

## 16. Tone Produk

Gunakan nada:

- Hangat.
- Jujur.
- Tidak menggurui.
- Tidak menyalahkan.
- Optimis tapi realistis.

Hindari:

- "Kamu gagal."
- "Harus berhenti sekarang."
- "Kalau kambuh berarti progress hilang."
- Copy yang terlalu medis atau menakut-nakuti.

Gunakan:

- "Mulai lagi hari ini."
- "Mengurangi tetap progress."
- "Terima kasih sudah jujur sama dirimu sendiri."
- "Kamu tidak harus sempurna untuk tetap bergerak maju."
