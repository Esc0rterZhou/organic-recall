## Private username accounts

Registration uses a username and password. No email address, university domain, mail sender or GPT account is needed. Usernames are case-insensitive, 3–24 ASCII letters, digits or underscores. Passwords are 10–64 characters and at most 72 UTF-8 bytes.

The registration service creates a Supabase Auth UUID and an opaque internal identity; the synthetic address is never a mailbox or a user-facing login field. Supabase Auth manages password hashing. Each UUID owns its own progress row. Row Level Security and the save function enforce ownership, including the owner captured before asynchronous account switches. Revision conflicts merge records by item timestamp. Guest progress remains separate until explicitly imported.

Registration displays a random 192-bit recovery code. Save it when shown. Only its SHA-256 hash is stored by the backend; the raw code is not stored in progress or backups. Recovery requires the username, code and new password, preserves the UUID and progress, and generates a replacement code. The previous code then stops working. Without the password or recovery code, self-service recovery is unavailable.

To deploy another instance:

1. Run `supabase/username-setup.sql` in the project's SQL editor. It creates private profiles, progress, recovery and rate-limit functions with explicit grants and RLS.
2. Deploy `supabase/functions/username-auth/index.ts` as `username-auth`. Its public registration/recovery endpoint uses its own input, rate-limit and recovery checks; set legacy JWT verification off for this function, as specified in `supabase/config.toml`. The service key stays in Supabase's server environment and is never copied into the browser.
3. Disable direct public Auth signups; this application's server function creates managed users. Keep the Email password provider enabled. No SMTP is required.
4. Set the project's public URL and publishable key in `dist/account-config.json`. Add the deployment origin to the function's explicit CORS allowlist if hosting elsewhere. Use only a public publishable key in frontend files.
5. Set `registrationReady` true after registration, login, owner isolation and recovery work against the live backend. The supplied public configuration points to the deployed Organic Recall project.

Live QA verified two independent users, private progress reads/writes, denied cross-owner access, private recovery hashes, guest denial, recovery rotation, rejected old passwords/codes, preserved progress and revision conflicts. No test credentials are distributed.

