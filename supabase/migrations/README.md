# Supabase migrations

Jalankan file di folder ini berurutan dari nomor paling kecil.

`schema.sql` tetap dipertahankan sebagai snapshot lengkap, sedangkan folder
`migrations` memecah perubahan berdasarkan fitur agar lebih mudah dicek,
diulang, dan dirun manual di Supabase SQL Editor.

Urutan saat ini:

1. `202606110001_core_profiles_checkins.sql`
2. `202606110002_engagement_savings_notifications.sql`
3. `202606110003_community.sql`
4. `202606110004_leaderboard.sql`
