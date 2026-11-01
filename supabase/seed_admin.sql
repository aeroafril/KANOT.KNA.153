-- ==============================================================================
-- KANOT - AUTOMATIC ADMIN SEED SCRIPT (Supabase Auth + Profiles)
-- ==============================================================================
-- Skrip ini mendaftarkan dan mengonfirmasi secara otomatis akun admin utama:
-- Email   : dedesk159@gmail.com
-- Password: patricia123
-- Role    : Staff dan Admin
--
-- CARA PENGGUNAAN (DI SUPABASE DASHBOARD):
-- 1. Buka Supabase Dashboard -> Proyek Anda -> SQL Editor -> New Query.
-- 2. Salin dan jalankan seluruh isi skrip ini (Klik 'Run').
-- 3. Akun admin otomatis terdaftar, dikonfirmasi (email_confirmed_at), 
--    dan profilnya langsung dibuat di tabel public.profiles.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    admin_id UUID;
    existing_user_id UUID;
BEGIN
    -- 1. Periksa apakah user dengan email dedesk159@gmail.com sudah ada di auth.users
    SELECT id INTO existing_user_id
    FROM auth.users
    WHERE email = 'dedesk159@gmail.com';

    IF existing_user_id IS NULL THEN
        -- Generate ID baru untuk Admin
        admin_id := uuid_generate_v4();

        -- 2. Sisipkan ke auth.users dengan password terenkripsi dan email terkonfirmasi
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data,
            raw_app_meta_data,
            role,
            aud,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            admin_id,
            '00000000-0000-0000-0000-000000000000',
            'dedesk159@gmail.com',
            crypt('patricia123', gen_salt('bf')),
            now(), -- Otomatis konfirmasi email
            '{"name":"Patricia","role":"Staff dan Admin"}'::jsonb,
            '{"provider":"email","providers":["email"]}'::jsonb,
            'authenticated',
            'authenticated',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );

        -- 3. Sisipkan identitas ke auth.identities (wajib di Supabase Auth)
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        )
        VALUES (
            admin_id,
            admin_id,
            jsonb_build_object('sub', admin_id::text, 'email', 'dedesk159@gmail.com'),
            'email',
            'dedesk159@gmail.com',
            now(),
            now(),
            now()
        );

        RAISE NOTICE 'Akun admin dedesk159@gmail.com berhasil didaftarkan di Supabase Auth (id: %)', admin_id;
    ELSE
        admin_id := existing_user_id;

        -- Update password dan pastikan email_confirmed_at sudah terisi
        UPDATE auth.users
        SET 
            encrypted_password = crypt('patricia123', gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            raw_user_meta_data = '{"name":"Patricia","role":"Staff dan Admin"}'::jsonb,
            updated_at = now()
        WHERE id = admin_id;

        RAISE NOTICE 'Akun admin dedesk159@gmail.com sudah ada, password & konfirmasi diperbarui (id: %)', admin_id;
    END IF;

    -- Bersihkan konflik email di public.profiles jika ID berbeda
    DELETE FROM public.profiles WHERE email = 'dedesk159@gmail.com' AND id <> admin_id;

    -- 4. Sisipkan / perbarui profil ke tabel public.profiles
    INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        initial,
        status,
        permissions,
        created_at,
        updated_at
    )
    VALUES (
        admin_id,
        'dedesk159@gmail.com',
        'Patricia',
        'Staff dan Admin',
        'PA',
        'Aktif',
        '["Melihat Anggota", "Menambahkan Anggota", "Mengedit Anggota", "Menghapus Anggota", "Melihat Isi Data Web", "Mengedit Isi Data Web"]'::jsonb,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        initial = EXCLUDED.initial,
        status = EXCLUDED.status,
        permissions = EXCLUDED.permissions,
        updated_at = now();

    RAISE NOTICE 'Profil untuk dedesk159@gmail.com berhasil diperbarui di public.profiles.';
END $$;

DO $$
DECLARE
    knisa_id UUID;
    existing_knisa_id UUID;
BEGIN
    SELECT id INTO existing_knisa_id
    FROM auth.users
    WHERE email = 'knisa7816@gmail.com';

    IF existing_knisa_id IS NULL THEN
        knisa_id := uuid_generate_v4();

        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data,
            raw_app_meta_data,
            role,
            aud,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            knisa_id,
            '00000000-0000-0000-0000-000000000000',
            'knisa7816@gmail.com',
            crypt('nisa1234', gen_salt('bf')),
            now(),
            '{"name":"Khairun Nisa","role":"Notaris Utama"}'::jsonb,
            '{"provider":"email","providers":["email"]}'::jsonb,
            'authenticated',
            'authenticated',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );

        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        )
        VALUES (
            knisa_id,
            knisa_id,
            jsonb_build_object('sub', knisa_id::text, 'email', 'knisa7816@gmail.com'),
            'email',
            'knisa7816@gmail.com',
            now(),
            now(),
            now()
        );

        RAISE NOTICE 'Akun knisa7816@gmail.com berhasil didaftarkan di Supabase Auth (id: %)', knisa_id;
    ELSE
        knisa_id := existing_knisa_id;

        UPDATE auth.users
        SET 
            encrypted_password = crypt('nisa1234', gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            raw_user_meta_data = '{"name":"Khairun Nisa","role":"Notaris Utama"}'::jsonb,
            updated_at = now()
        WHERE id = knisa_id;

        RAISE NOTICE 'Akun knisa7816@gmail.com sudah ada, password & konfirmasi diperbarui (id: %)', knisa_id;
    END IF;

    DELETE FROM public.profiles WHERE email = 'knisa7816@gmail.com' AND id <> knisa_id;

    INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        initial,
        status,
        permissions,
        created_at,
        updated_at
    )
    VALUES (
        knisa_id,
        'knisa7816@gmail.com',
        'Khairun Nisa',
        'Notaris Utama',
        'KN',
        'Aktif',
        '["Melihat Anggota", "Menambahkan Anggota", "Mengedit Anggota", "Menghapus Anggota", "Melihat Isi Data Web", "Mengedit Isi Data Web"]'::jsonb,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        initial = EXCLUDED.initial,
        status = EXCLUDED.status,
        permissions = EXCLUDED.permissions,
        updated_at = now();

    RAISE NOTICE 'Profil untuk knisa7816@gmail.com berhasil diperbarui di public.profiles.';
END $$;
