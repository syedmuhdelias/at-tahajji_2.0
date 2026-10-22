# My Quran

A working Quran reader built with **Next.js App Router, TypeScript, React, Tailwind CSS, Lucide React, and HTML5 Audio**. The homepage uses the supplied aT-Tahajji logo, imagery and cream/forest-green design. The Quran reader is at `/quran`, with Surah Al-Masad in Dark Gold and Malay translation as its initial view. Reading progress is restored on subsequent visits.

Live private site: https://my-quran-serumpun.steadyroot1.chatgpt.site

## Install and run with Next.js

Use Node.js **24 LTS** (or a supported version >=22.13) and pnpm.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:next
```

Open http://localhost:3000. Production:

```bash
pnpm build:next
pnpm start:next
```

npm also works with `npm install`, `npm run dev:next`, `npm run build:next`, and `npm run start:next`. The included pnpm lockfile is the reproducible dependency specification.

The default `dev`, `build`, and `start` scripts retain the supplied **Sites/Vinext adapter** for Cloudflare hosting. The `*:next` scripts run the real Next.js toolchain directly; this project was built successfully with both toolchains. Keep `build/`, the Sites scripts, and `.openai/hosting.json` for managed deployment. Local Next.js use does not require a Sites account.

## Homepage and admin

Start with [SUPABASE-SETUP.md](SUPABASE-SETUP.md). Create or confirm the Supabase admin user, then run `supabase/setup.sql` in the project's SQL Editor. Open `/admin` and sign in with your authorised Supabase email/password.

Edit the brand/logo, hero, teachers, gallery, YouTube/Vimeo lessons, testimonials and contact details. The Quran provider content is not editable through the CMS. Supabase stores published content and uploaded images. Initial content comes from `lib/site/defaults.ts`; saved content takes priority.

Saves use optimistic revisions. PNG, JPEG and WebP uploads are checked for signature, type and a 5 MB limit. Admin membership is assigned by user UUID in a protected table; public readers cannot grant membership or write. Existing D1/R2 content and images are not automatically migrated. Re-upload any older uploaded media before switching your domain.

The application's admin uses Supabase on both localhost and hosted deployments. The ChatGPT-hosted preview remains owner-private at the platform layer. Your own hosting does not use that platform access screen.

## Quran provider and optional credentials

The app currently works without credentials through the public legacy Quran.com v4 API. Every content request goes through the server route at `app/api/quran/route.ts`. No Quran text, translation database, audio file, or font file is bundled with the project.

For the approved production Quran Foundation Content API, copy `.env.example` to `.env.local` and set:

```dotenv
QURAN_CLIENT_ID=your-approved-client-id
QURAN_CLIENT_SECRET=your-approved-client-secret
```

Obtain these from the [Quran Foundation Developer Console](https://dev-console.quran.foundation/). Access approval is controlled by the provider. The adapter automatically uses the Foundation production endpoint when both values are set, obtains a server-side `content` token, and renews it before expiry. The public and authenticated modes share the same normalized reading experience. The approved-credentials path is implemented but was not exercised because credentials were not supplied. Do not use the prelive endpoint for a complete Quran: its content is limited.

For the hosted site, configure these names as server runtime secrets through the hosting environment, then redeploy. Never put credentials in client code, any `NEXT_PUBLIC_*` variable, the hosting manifest, or version control. `.env.example` contains names only.

The public API may change or require access approval in the future. The UI reports provider errors instead of inventing content. Network access to `api.quran.com`, `apis.quran.foundation`, `oauth2.quran.foundation`, and `verses.quran.foundation` is required for the relevant mode.

## Implemented features

- All 114 surahs and 6,236 ayahs in standard Hafs numbering; catalogue totals are validated at runtime.
- Runtime-loaded Uthmanic Arabic, Malay, English, and Indonesian translations.
- Page-specific QCF V2 glyphs and fonts, with official Uthmanic Hafs Unicode fallback.
- Real recitations, play/pause, previous/next ayah, seeking, volume, speed, repeat, and automatic continuation across surahs.
- Word highlighting from the recording's authentic timing intervals, synchronized to `HTMLAudioElement.currentTime`.
- Clickable word meanings, transliteration, and separate word-learning audio.
- English Ibn Kathir tafsir with source and verse-range attribution.
- Surah-name search, direct `surah:ayah` navigation, provider translation search, and Juz/page navigation.
- Copy and native-share controls (clipboard link fallback), bookmarks, resume reading, and local preferences.
- Five themes, custom highlight/background/Arabic colors, adjustable typography, and reading/translation display modes.
- Responsive navigation drawer, expandable mobile player, keyboard controls, native modal focus management, loading states, errors, and offline notices.

Use **Ctrl/Cmd+K** or **/** to open search. **Escape** closes dialogs. A direct link such as `/quran#111:2` opens the referenced ayah. Original `/#111:2` links redirect to the reader. English word meanings are labeled as such even when the verse translation is Malay or Indonesian. Translation search may return a different source translation than the selected reading translation; its actual source is shown.

## Font and timing integrity

QCF V2 is glyph-based: a word's `code_v2` is rendered only with the font identified by its `v2_page` (or its matching `page_number`). Loading a single font for an entire long surah would be incorrect. Fonts are lazy-loaded from the provider's documented CDN. Until the page font is available, the reader uses the **matching `text_qpc_hafs` representation** with **UthmanicHafs1Ver18**. Words remain whole; Arabic is never split into individual Unicode code units. Copying uses the source verse's actual Unicode Arabic, not QCF private glyph codes.

Ayah audio segments use `[startWordIndex0, endWordIndexExclusive0, startMs, endMs]`. The adapter also accepts `[wordPosition1, startMs, endMs]` triplets and numeric strings. A recorded multiword interval highlights that range together; it is never divided into estimated timestamps. Silence gaps have no highlighted word. The audio clock is sampled with `requestAnimationFrame` while playing and with media events while paused or seeking. A stale audio request is cancelled when a verse or reciter changes.

Missing timing metadata produces **verse-only highlighting with a visible notice**. Timing quality and coverage depend on the source recording. Changing reciter restarts the selected ayah because the recordings have different timelines. Autoplay can be restricted by a browser, in which case a Play gesture is requested. Word-learning audio is independent of the selected reciter and pauses verse playback to avoid overlap.

## Project structure

```text
app/
  page.tsx                  aT-Tahajji-inspired homepage
  quran/page.tsx            Quran reader entry point
  admin/page.tsx            Content editor with Supabase sign-in
  api/site/route.ts         Validated, revision-aware content reads and saves
  api/media/                Authenticated image upload and image delivery
  layout.tsx                Metadata and global styles
  globals.css               Responsive design and CSS theme variables
  api/quran/route.ts         Validated server-side provider adapter
  privacy/page.tsx           Privacy policy
  terms/page.tsx             Terms and attribution
components/quran/
  QuranReader.tsx            Reading and navigation orchestration
  Sidebar.tsx               Surah, ayah, Juz, and page navigation
  VerseCard.tsx              Arabic words, translation, verse actions
  AudioPlayer.tsx            Recitation controls and mobile expansion
  Settings.tsx              Immediate theme and reading preferences
  SearchDialog.tsx           Surah/reference/translation search
  TafsirDialog.tsx           Attributed authentic commentary
  Dialog.tsx                Native accessible modal shell
hooks/
  use-quran-audio.ts         Media lifecycle and synchronized highlighting
  use-quran-fonts.ts         Page-font loading and Unicode fallback
  use-reader-state.ts        Validated LocalStorage state
lib/quran/
  types.ts                  Typed data contracts
  config.ts                 Sources, reciters, themes, display helpers
  timing.ts                 Real interval normalization and lookup
  server.ts                 Provider access, OAuth, bounded caching
  client.ts                 Request handling and short-lived cache
tests/timing.test.ts         Synchronization edge cases
```

The additional `build/`, connector helper, and hosting configuration files belong to the supplied Sites runtime. They are not used to connect any external user accounts in this reader.

## Validation

```bash
pnpm typecheck
pnpm test
pnpm build:next
```

Verified during implementation:

- Next.js 16.3.4 production build and Sites/Vinext production build.
- Strict TypeScript checks.
- Eleven tests: content and URL validation plus seven timing tests covering actual Alafasy Al-Masad segments, seek jumps, pause stability, numeric strings, triplets, multiword ranges, missing/invalid timestamps, and repeated intervals.
- Live server-adapter requests: 114 surahs / 6,236 verses, Al-Masad's five verses with all three translations and QCF glyphs, Al-Baqarah ayahs 281–286, audio timings, translation search, Juz 30, and page 603.
- Live QCF page 603, official Hafs font, recitation audio, and tafsir source availability.

The redesigned homepage and content editor were visually checked in the browser at desktop, 768 px tablet and 390 px mobile widths. Mobile navigation and admin section switching were checked; a narrow-screen sign-in layout issue was corrected. The current admin requires Supabase sign-in before showing the editor. Hosted authenticated save/upload flows were not exercised with the owner's account. The preview environment could not connect to the external Quran provider, so live audio and font loading were not reverified in that preview; the existing provider adapter is preserved and the timing tests pass.

## Attribution, privacy, and content use

**Quran data provided by Quran.Foundation.**

| Content                          | Source                                                          |
| -------------------------------- | --------------------------------------------------------------- |
| Arabic and QCF V2 glyphs         | Quran Foundation / Quran.com Content API                        |
| QCF V2 and Uthmanic Hafs         | King Fahd Quran Complex fonts via the documented Foundation CDN |
| Malay, resource 39               | Abdullah Muhammad Basmeih                                       |
| English, resource 20             | Saheeh International                                            |
| Indonesian, resource 33          | Indonesian Islamic Affairs Ministry                             |
| English tafsir, resource 169     | Ibn Kathir (Abridged)                                           |
| Verse recitation                 | Selected reciter, credited in the player                        |
| Word meanings and learning audio | Quran Foundation word data                                      |

Bookmarks, reading position, and preferences stay in LocalStorage. This app has no analytics, advertisements, or Quran Foundation user-account login. Content requests use the provider and hosting infrastructure described in `/privacy`.

Regular content responses are cached for at most one hour server-side and five minutes in the browser request cache. Cache sizes are bounded. No offline corpus is built, no audio is bundled, and raw content is not offered as a downloadable dataset. Fonts and audio stream from documented provider URLs. Any future offline content feature must use the provider's approved Content Sync workflow and comply with its terms.

Review [Quran Foundation Developer Terms](https://api-docs.quran.foundation/legal/developer-terms/), [font rendering documentation](https://api-docs.quran.foundation/docs/tutorials/fonts/font-rendering/), and [API documentation](https://api-docs.quran.foundation/). Before a public launch, confirm your approved provider access, required public privacy/contact details, and all current attribution and usage obligations. The delivered deployment remains private to its owner.
