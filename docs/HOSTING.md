> Current official-guide verification: read OFFICIAL_REQUIREMENTS.md, including SI/AI attribution, media rules, team eligibility and exact public form fields.

# Static deployment handoff

Ready-to-upload folder: `release/site/`. All observations, fonts and scientific exports are bundled locally. No backend, API key or paid runtime service is required. Relative asset paths support a nested URL. View state uses local React navigation and needs no SPA rewrite configuration.

S3 is an optional hosting target, not a NASA requirement. No AWS resource or public permission has been created. Uploading, permission changes, CloudFront setup and any cost require explicit authorization. For an existing approved static host, upload the CONTENTS of site/ so index.html is at the chosen root. Set correct Content-Type for HTML,JS,CSS and license text; serve through the intended public HTTPS URL where available. Do not upload node_modules, private credentials or audit caches. A bare S3 object link is not equivalent to a configured application endpoint.

After publishing, verify the public URL in an unauthenticated browser: November2018, July2024, preVIIRS, date navigation, downloads, all JS/font assets and mobile. Confirm no mixed-content or permission errors. Provide a separate public source/reproducibility link and public demo link as required by the actual portal. Keep the offline HTML as a local demonstration fallback.

No deployment or NASA submission was authorized/performed in this release.
