# FireLens frontend

React/TypeScript/Vite/Tailwind application. Use npm ci, npm run typecheck, npm test, npm run build. No Figma server is assumed. Python ../pipeline/prepare_frontend.py generates src/generated/bundle.json from verified scientific products; do not hand-edit generated measurements. ../pipeline/package_site.py creates the static site and single-file offlineHTML. Never change original NASA archives or results/ as part of UI work. Keep null/zero/estimated states distinct and scientific limitations visible. No publishing without explicit authorization.
