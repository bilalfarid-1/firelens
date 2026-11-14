# Free hosting with GitHub Pages

FireLens is a static HTML/CSS/JavaScript application. GitHub Pages can host a public repository on GitHub Free. No AWS,S3,backend,API key or purchased domain is needed. Source: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages . Cloudflare Pages is another free static-hosting option: https://pages.cloudflare.com/ .

## Prepared deployment — not yet published

The repository includes a manual-only workflow: `.github/workflows/pages.yml`. It deploys the already tested `release/site/` folder, not an unverified rebuild. No website is published merely by pushing source.

Once deployment is explicitly approved:

1. Confirm the repository is public if using GitHub Free. Do not change its visibility without owner approval.
2. In repository Settings → Pages, choose GitHub Actions as the build/deployment source.
3. Open Actions → Publish FireLens to GitHub Pages (manual) → Run workflow on main.
4. Follow the job until success. Expected address: https://bilalfarid-1.github.io/firelens/ . Treat it as live only after checking the successful deployment URL.
5. Verify anonymously: app loads, Nov2018 shows1220VIIRS/735MODIS, Jul2024 shows58/322 with coverage warning, pre2012 VIIRS is unavailable, exports and SVGs work, mobile layout works.

NASA's current guide permits a public website, cloud link or code repository for the final project, and requires reviewer access without login or permission. A public project repository can be the final-project link; the live app is the recommended user experience. Submit the separate public demo link and other required fields through the official team portal. See `OFFICIAL_REQUIREMENTS.md` for the verified guide details and attribution requirements. Free hosting does not guarantee eligibility or judging approval.

Source upload is authorized separately from website deployment. No deployment,account signup,paid service or NASA submission is performed by preparing this workflow.
