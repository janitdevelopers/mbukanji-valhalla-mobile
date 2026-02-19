# Standalone repo: GitHub + npm

This package is published as its own GitHub repo and npm package (like `mbukanji-valhalla-wasm`).

**Repo:** [github.com/janitdevelopers/mbukanji-valhalla-mobile](https://github.com/janitdevelopers/mbukanji-valhalla-mobile)

## 1. Create the GitHub repo

1. On GitHub (e.g. github.com/janitdevelopers), click **New repository**.
2. **Repository name:** `mbukanji-valhalla-mobile` (or your preferred name).
3. **Visibility:** Public (or Private if you keep it internal).
4. Do **not** initialize with README, .gitignore, or license (this repo already has content).
5. Create the repository.

## 2. Push this folder to the new repo

From this directory (`mbukanji-valhalla-mobile`):

```bash
git init
git add .
git commit -m "Initial commit: Valhalla native mobile package"
git remote add origin https://github.com/janitdevelopers/mbukanji-valhalla-mobile.git
git branch -M main
git push -u origin main
```

## 3. Publish to npm

### Option A — Publish from GitHub Actions (recommended)

1. **Add npm token to GitHub:**  
   In this repo: **Settings → Secrets and variables → Actions** → **New repository secret**.  
   - **Name:** `NPM_TOKEN`  
   - **Value:** an npm access token with “Automation” or “Publish” permission (create at [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~yourusername/tokens)).

2. **Run the workflow:**  
   - **Actions** → **Publish to npm** → **Run workflow**, or  
   - Create a **Release** (publishing the release triggers the workflow).

3. The workflow installs deps, builds, and runs `npm publish --access public`.

### Option B — Publish from your machine

1. **Log in to npm** (if needed):  
   `npm login`  
   Use your npm account (create one at npmjs.com if needed).

2. **Ensure package name and version** in `package.json`:  
   - `"name": "@jansoft/mbukanji-valhalla-mobile"` (or your scope).  
   - Bump `version` for each publish (e.g. `0.1.0` → `0.1.1`).

3. **Build:**  
   `pnpm install`  
   `pnpm run build`

4. **Publish (scoped package):**  
   `npm publish --access public`

## 4. Use from JanPAMS monorepo

- **Option A — Local clone (development):**  
  Clone this repo as a **sibling** of JanPAMS, e.g.:
  - `c:\Projects\janpams`
  - `c:\Projects\mbukanji-valhalla-mobile`
  In JanPAMS, `pnpm-workspace.yaml` includes `'../mbukanji-valhalla-mobile'` and root `package.json` has  
  `"pnpm": { "overrides": { "@jansoft/mbukanji-valhalla-mobile": "workspace:*" } }`  
  so the monorepo uses the local clone.

- **Option B — From npm:**  
  In JanPAMS (or any app), add the dependency:  
  `"@jansoft/mbukanji-valhalla-mobile": "^0.1.0"`  
  and remove the workspace entry for this package so it resolves from npm.

## 5. JanPAMS CI (parity workflow)

The JanPAMS repo runs parity tests with `pnpm --filter @jansoft/mbukanji-valhalla-mobile test`. For that to work in CI, either:

- **Option A:** In the JanPAMS workflow, add a step before `pnpm install` that clones this repo as a sibling of the JanPAMS root (e.g. `git clone … mbukanji-valhalla-mobile` in the parent of the workspace), so `../mbukanji-valhalla-mobile` exists.
- **Option B:** Run parity tests only in this repo’s CI and skip or gate the parity job in JanPAMS when the sibling is not present.

## 6. References

- [VALHALLA_MOBILE_TASKS.md](https://github.com/janitdevelopers/JanPAMS/blob/main/docs/VALHALLA_MOBILE_TASKS.md) (in JanPAMS repo)
- [VALHALLA_ANDROID_BUILD.md](https://github.com/janitdevelopers/JanPAMS/blob/main/docs/VALHALLA_ANDROID_BUILD.md)
- [VALHALLA_IOS_BUILD.md](https://github.com/janitdevelopers/JanPAMS/blob/main/docs/VALHALLA_IOS_BUILD.md)
