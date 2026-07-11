# Melanin Unity Clips Deployment and Security Notes

## Netlify environment variables

Set these in Netlify for the Production deploy context:

- `SUPABASE_URL`: your Supabase project URL, for example `https://vukmoxdbedjryarhaiia.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key. Keep this only in Netlify/GitHub secrets. Never put it in the Android app or static files.
- `ADMIN_PIN_HASH`: salted PBKDF2 hash for the admin PIN.
- `MAX_UPLOAD_BYTES`: current upload limit in bytes. The default is `52428800` for 50 MB.
- `SUPABASE_STORAGE_BUCKET`: optional. Defaults to `clip-submissions`.

`ADMIN_PIN` still works as a temporary compatibility fallback, but replace it with `ADMIN_PIN_HASH`.

Generate an admin hash locally:

```bash
node -e "const { hashPin } = require('./netlify/functions/_shared'); console.log(hashPin('YOUR_PIN_HERE'))"
```

Then store the printed value as `ADMIN_PIN_HASH`.

## Supabase setup

Run the migrations in order, including:

- `supabase/migrations/003_video_comments.sql`
- `supabase/migrations/004_owner_delete_token.sql`
- `supabase/migrations/008_harden_upload_pipeline.sql`

The active upload bucket is `clip-submissions`. It is private, accepts MP4, MOV, WebM, 3GP, and compatible MKV MIME types, and is set to 50 MB by default for the current plan. To raise the limit, update both:

- Supabase bucket `file_size_limit`
- Netlify `MAX_UPLOAD_BYTES`

Supabase Free plans may reject larger uploads even if SQL sets a larger bucket limit. Larger public video upload usage also increases storage and egress costs.

## Upload architecture

The app uploads video bytes directly from the client to Supabase Storage. Netlify Functions receive only metadata and moderation actions. This avoids sending large videos through a normal JSON API route.

The client checks:

- File size before upload
- Browser MIME type
- Basic file signature bytes for ISO media and EBML containers
- HTTP content type before JSON parsing

The backend returns JSON for success and failure:

```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_TOO_LARGE",
    "message": "The selected video exceeds the current upload limit."
  }
}
```

## Android version

Previous Android version:

- `versionCode`: `2`
- `versionName`: `1.0`

Current Android version:

- `versionCode`: `3`
- `versionName`: `1.0.1`

## GitHub Actions Android build secrets

Add these repository secrets before expecting signed AAB artifacts:

- `ANDROID_RELEASE_KEYSTORE_BASE64`: base64 encoded `.jks` release keystore
- `ANDROID_RELEASE_STORE_PASSWORD`: keystore password
- `ANDROID_RELEASE_KEY_ALIAS`: key alias
- `ANDROID_RELEASE_KEY_PASSWORD`: key password

The workflow artifact is named `melanin-unity-clips-v3-1.0.1-aab`.

## Optional Google Play internal testing upload

For `.github/workflows/google-play-internal.yml`, also add:

- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: the full Google Play service account JSON

The workflow uploads to the `internal` track with `draft` status. It does not deploy to production.
