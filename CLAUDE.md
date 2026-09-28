# Book'd — working rules for Claude sessions

Book'd is a single-file PWA (`index.html` + `sw.js` + `manifest.json` + icons) served from GitHub Pages at
https://bhennyjmu.github.io/bookd/. Two machines (PC and MacBook) run Claude sessions against this repo.
GitHub is the master copy. These rules keep the two from stepping on each other.

## Before you edit anything

1. `git pull --ff-only` first, every time, even mid-conversation. The other machine may have shipped since your last step.
2. Read the current version from the files. Never assume it from memory or from an earlier step:
   - `APP_V=NNN` in `index.html`
   - `const CACHE = 'bookd-vNNN'` in `sw.js`
   They must be equal. If they are not, stop and say so.
3. Finish one request completely (edit, verify, commit, push, confirm live) before the other machine starts one.

## Shipping a change

1. Bump BOTH `APP_V` and `CACHE` by one, together, in the same commit. Every user-visible change ships as a new version;
   phones only update when the number changes.
2. Extract the inline `<script>` blocks and run `node --check` on them before committing. Bulk text replacements have
   broken the JavaScript before (unescaped apostrophes, cut template literals). Use double-quoted JS strings for text with apostrophes.
3. Commit message: one line saying what changed, ending with the trailer
   `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
4. `git push`, then poll `https://bhennyjmu.github.io/bookd/sw.js` until it reports the new `bookd-vNNN` (usually under a minute).
5. Say plainly what shipped, what was verified, and anything left out.

## Cloud functions

Live in `C:\Users\bradh\bookd-cloud` (not in this repo). Deploy with
`firebase deploy --only functions --project bookd-78e02 --force`. Push notification copy follows the same copy rules below.

## Copy rules (user-visible text)

- No em-dashes or en-dashes anywhere. Rewrite with a period, comma, or colon.
- At most one middle dot (·) per line.
- No banking vocabulary (deposit, withdrawal, balance, ledger, passbook, vault, account statement, FDIC). The only kept phrases are
  "on the books" and "same books".
- No punitive mechanics or shaming copy. A missed goal is "a nudge, not a grade". Never red for "behind".
- Plain, warm, short. Sentence case for section labels; all-caps only on form labels, the two Home tiles, and the month block.
- Every destructive action gets a confirmation sheet.

## Design rules

- Typefaces: Fraunces (headlines), Karla (everything else), Spline Sans Mono (digits and codes only). Do not propose a font swap.
- One primary color: `.cta.pink`. Secondary actions are outlined (`ghostd`). `cta.danger` only for erase/delete. Destructive actions
  elsewhere are text links in the warning color under a hairline.
- Icons and markers are inline SVG, never text symbols or emoji (iOS turns text hearts into uncolorable emoji). No sparkle icon.
- Light and dark themes share tokens on `:root`; test both.
- Banners show on Home only. Settings is behind the header gear, not a tab.

## Testing in the browser pane

- Serve the local folder and test offline logic only. Never run scripted network calls (invites, uploads, Firestore) from the pane;
  they crash the desktop app. Fake pairing in memory with `sync={cid:'PREVIEW-ONLY',role:'me'}` and never persist it.
- Unregister the service worker and clear caches before checking a new build. Use case-insensitive text checks (CSS uppercases labels).
- Reset the viewport to desktop when done.

## Who you are working with

Brad is not a developer. Explain in plain language with everyday analogies, label claims as Confirmed / Pretty sure / Need to check,
and give at most three steps at a time. He tests on his iPhone; Marilee tests on hers.
