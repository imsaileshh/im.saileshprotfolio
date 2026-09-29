# Dashboard repair and verification — 29 September 2026

Scope: the case-study/dashboard failures in the supplied specification, plus the shared action transport responsible for editor remounts. Existing static dashboard pages, consolidated API routes, and server authorization were preserved. No schema changes or deployment were performed.

## Root causes found

1. DashboardPage refreshed page data on every window focus, unmounting editors after a file picker closed.
2. The shared action client independently dispatched a dashboard refresh after successful case-study saves.
3. Visual image errors survived a change of source URL.
4. Truthiness-based synchronization left a stale `url` when `imageUrl` was cleared; normalization preferred the stale URL.
5. Upload failures fell back to local disk even in production, and clients accepted unvalidated upload responses.
6. Every image path was labeled permanent, including local paths.
7. Visual normalization generated random IDs repeatedly.
8. Structured media and legacy image arrays were normalized separately and could disagree.
9. The top Preview loaded a saved page instead of current editor state.
10. Save actions invalidated listings without invalidating affected old/new public detail URLs.
11. Section deletion/recreation and project updates were separate writes, allowing partial saves. Invalid section JSON could silently become an empty section list.
12. Technology and homepage settings sent by the editor were ignored. Save failures thrown by the API transport were not handled by the editor.
13. Supabase project URL and service-role key were both absent from the local environment at verification time.

## Files changed

- `src/components/dashboard/DashboardPage.tsx`: removed generic focus refresh; retained explicit `dashboard:refresh` and retry.
- `src/lib/dashboard/action-client.ts`: case-study create/update saves no longer dispatch a global refresh; other mutations retain existing refresh behavior.
- `src/components/dashboard/case-studies/AdvancedCaseStudyEditor.tsx`: remembers section per record; sanitizes save payload; keeps editor mounted after create/update; handles transport errors; preserves edits made during a save; updates draft status; previews current state.
- `src/components/dashboard/case-studies/CaseStudyEditorPreview.tsx`: accessible native dialog rendering current unsaved data with the production CaseStudyContent component; no public-page data fetch.
- `src/components/dashboard/case-studies/CaseStudyVisualEditor.tsx`: clears both URL fields, synchronizes empty values, validates upload responses, labels local/remote storage accurately, retains current visual settings during asynchronous uploads, and supports typing a URL before validating it on blur.
- `src/components/case-study/CaseStudyVisualBlock.tsx`: resets image errors when source changes; preserves eager preview/lazy public loading.
- `src/components/dashboard/ImageUploader.tsx`: canonicalizes upload responses, rejects nonpermanent production upload results, clears preview errors, and resets the file input after upload.
- `src/app/api/upload/route.ts`: production storage failures return HTTP 500 instead of writing local files; validates File input and aligns GIF support with uploaders; keeps requireAdmin and server-only credentials.
- `src/app/dashboard/(protected)/case-studies/actions.ts`: canonical media synchronization; transactional create/update; invalid JSON rejection; persists technology/homepage settings; revalidates actual old/new slugs by project type; synchronizes publication toggles with the linked project.
- `src/components/case-study/CaseStudyContent.tsx`: removes invalid media and falls back to valid legacy images; uses deterministic indexed fallback IDs.
- `src/types/case-study-visual.ts`: deterministic fallback IDs; preserves existing IDs and visual settings.
- `src/lib/media/resolve-image-url.ts`: respects explicitly cleared canonical image fields; rejects unsupported schemes and malformed remote URLs.
- `src/lib/media/case-study-media.ts`: shared persisted-media normalization and strict upload-result validation.
- `tests/case-study-media.test.cjs`: ten executable regression tests for media, uploads, refresh events, preview recovery, unsaved preview, editor section preservation, and revalidation.

## Required verification report

“Automated” below means executable tests of application logic/component state with controlled dependencies. It does not claim that a real storage upload or native OS file picker was exercised.

| Check | Result |
| --- | --- |
| Focus refresh removed | YES — automated subscription check |
| Upload causes DashboardSkeleton | NO through the removed focus-refresh path; authenticated browser test pending |
| Active section preserved after upload | YES — automated editor-state test |
| Supabase permanent URL | FAIL / BLOCKED — local URL and service key missing; live upload not verified |
| Production local filesystem fallback removed | YES — production failure returns 500; no disk write in regression test |
| Inline image preview | PASS — controlled component tests; live upload pending |
| Broken image → replace → recovery | PASS — component test |
| Remove image clears both URL fields | PASS — editor and normalization tests |
| Save preserves current section | PASS — editor-state and action-transport tests |
| Public page revalidation | PASS — mocked action verifies old/new case-study and actual project paths; live cache refresh pending |
| Unsaved preview | PASS — current unsaved title and visual settings passed directly to production renderer |
| Public image HTTP status | NOT VERIFIED — no configured public Supabase host available for the allowed check |
| npm run build | PASS — Next.js production build, including TypeScript and prerendering |
| Dashboard routes still static | YES — dashboard routes remain Static/SSG; 36 page entries |
| npx vercel@latest build | FAIL — Next.js succeeds, Windows denies a symbolic link during Vercel packaging |
| Serverless function count | NOT CONFIRMED — packaging stopped after one partial function directory; seven API route entries remain, with no new routes |
| Final status | NEEDS FIXES / LIVE VERIFICATION — environment and packaging blockers remain |

## Test results and limitations

- New regression suite: **10/10 pass** (`node tests/case-study-media.test.cjs`).
- Existing authorization/transport boundary suite: **6/6 pass** (`node tests/dashboard-boundaries.test.cjs`).
- Broader legacy dashboard suite plus boundary tests: **12/24 pass**. Failures include assumptions that dashboard pages perform Prisma reads or server redirects, references to API routes replaced by consolidated handlers, and older schema/service contracts. These tests need a separate update to match the current architecture; the application was not reverted to dynamic SSR to satisfy them.
- Browser smoke check: unauthenticated `/dashboard` redirects to the PIN sign-in page. Authenticated upload/save/publish/reload flows remain pending user sign-in.
- Real Supabase persistence and public image HTTP 200 remain unverified. Configure `NEXT_PUBLIC_SUPABASE_URL`, server-only `SUPABASE_SERVICE_ROLE_KEY`, and a public `portfolio-images` bucket in the local and deployment environments. Restart the local server after configuration.
- Supabase public URL behavior requires a public bucket, as described in the [official getPublicUrl documentation](https://supabase.com/docs/reference/javascript/file-buckets-getpublicurl).
- Vercel packaging error: `EPERM: operation not permitted, symlink '..\\dashboard\\case-studies\\[id].func' -> '.vercel\\output\\functions\\case-studies\\[slug].func'`. Validate packaging on a host with symbolic-link support, such as the deployment build environment. No deployment has been initiated.
- An initial broad URL-status command was rejected by automatic approval review because arbitrary stored URLs could carry sensitive query data. The approved replacement restricted checks to the configured Supabase public bucket, stripped query parameters, and prohibited redirects; it found the storage settings missing.
