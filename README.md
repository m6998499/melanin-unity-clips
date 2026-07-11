# Melanin Unity Clips

Mobile-first Next.js MVP for a scroll-only vertical video discovery app. The app includes a public feed, upload surface, admin moderation dashboard, legal/support pages, PWA manifest, Supabase schema, and Capacitor packaging configuration.

## Local Run

1. Install dependencies: `pnpm install`
2. Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the Next.js shell, or edit `outputs/netlify-site/supabase-config.js` for the static Netlify build.
3. Start development: `pnpm dev`
4. Open `http://localhost:3000`.

The production static feed loads approved videos from Supabase through Netlify Functions.

## Supabase Setup

1. Create a Supabase project.
2. Run the migration files in `supabase/migrations` in order.
3. Confirm the private Storage bucket `clip-submissions` exists.
4. Set Netlify environment variables for `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PIN_HASH`, and `MAX_UPLOAD_BYTES`.
5. Keep the service-role key only in server-side secrets.

## Deployment

1. Push the repository to GitHub.
2. Import it into Netlify.
3. Add Supabase environment variables.
4. Run `pnpm build` before production promotion.
5. Confirm `/`, `/upload`, `/admin`, `/privacy`, `/terms`, `/community-guidelines`, `/delete-account`, `/support`, and `/app-store-info`.

## Native Packaging

1. Build/export the web app for Capacitor.
2. Run `pnpm cap add android` and `pnpm cap add ios` after dependencies install.
3. Run `pnpm cap sync`.
4. Open Android with `pnpm cap open android`, then configure signing in Android Studio and produce an Android App Bundle.
5. Open iOS with `pnpm cap open ios`, then configure signing, bundle identifier `com.melaninunity.clips`, icons, splash screens, and archive in Xcode.
6. Test on real devices before store submission.

## Manual Launch Items

- Replace placeholder emails and business contact details.
- Have legal counsel review policies and terms.
- Generate final app icons and splash screens.
- Connect upload/admin forms to Supabase mutations.
- Create reviewer demo account credentials for Apple and Google.

## Deployment and Security

See `docs/deployment-and-security.md` for the current Netlify variables, Supabase migration order, admin PIN hash setup, Android version values, and GitHub Actions signing secrets.
