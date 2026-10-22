# My Quran — Supabase setup

This version replaces the application's ChatGPT login with Supabase email/password authentication. It uses project `lhtnaypdowuwegjyrozj` and its public anon key. No service-role key is required. Supabase access and refresh tokens are kept in HttpOnly, SameSite cookies; the server validates the user against Supabase Auth and the admin membership table. Database policies also enforce permissions.

## One-time setup

1. Open your Supabase project dashboard.
2. Under **Authentication → Users**, confirm `at-tahajji@test.com` exists. If it does not, create it using **Add user**, choose a password, and confirm it through the dashboard. Do not post that password in chat. If it already exists, keep its existing password.
3. Open **SQL Editor**, paste the complete `supabase/setup.sql`, and run it. It adds this existing user's UUID to the admin table. It creates separate `myquran_admins`, `myquran_content`, and `myquran-media` resources; it does not migrate or overwrite the old site's tables.
4. Under **Authentication → URL Configuration**, set your production Site URL and add exact redirect URLs:
   - `http://localhost:3000/admin/reset-password`
   - `https://YOUR-DOMAIN/admin/reset-password`
   - If testing the hosted preview: `https://my-quran-serumpun.steadyroot1.chatgpt.site/admin/reset-password`
5. Run the website and open `/admin`. Sign in with your Supabase admin email and password.
6. Save once to copy the included homepage content into Supabase. Upload a test image and confirm it survives a reload.

The address `at-tahajji@test.com` must have a real accessible mailbox for emailed password reset to work. Otherwise use Supabase's owner dashboard to manage the account, or change to an email you control. Configure Supabase SMTP for production email delivery. This app does not expose public registration.

## Windows localhost

Extract the ZIP into a new folder. In the folder containing package.json:

```powershell
npm.cmd install
npm.cmd run dev:next
```

Open http://localhost:3000/admin. Use Node.js >=22.13.0.

## Vercel / your own hosting

Use framework Next.js and build command `npm run build:next`. Leave output directory at the framework default. A Node server additionally runs `npm run start:next`.

The supplied Supabase URL and anon key are public configuration in `lib/supabase/config.ts`; optionally override them using server environment variables `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never put a service-role key in that file or in client environment variables. Optional Quran API credentials remain server-only.

The application's admin no longer uses ChatGPT. The existing ChatGPT-hosted preview remains owner-private at its outer hosting layer; that platform access screen is separate from the app's Supabase login. Your own deployment has no ChatGPT hosting access screen.

## Existing website data

This source includes the homepage content and bundled brand images. Content previously saved to the ChatGPT-hosted database or images uploaded there are not automatically copied into Supabase. Re-enter/import that content and re-upload those images before switching your domain. Existing bookmarks and reading progress remain browser-local.

## Permissions and verification

- Visitors can read published homepage content and public images.
- Only owner-assigned UUIDs in `myquran_admins` can save or upload.
- A matching email alone does not grant permissions; creating a new user with that email later does not restore deleted membership.
- No browser or anon access to grant admin roles.
- Concurrent content saves require matching revisions and return a conflict instead of silently overwriting.
- Before the SQL is run, the homepage displays bundled defaults, while admin saving remains unavailable.

Test correct and incorrect password, logout, a non-admin account, save/reload, an image upload, and password recovery after configuration. Build checks cannot prove those live account and database flows without this setup.
