# Publishing

This project is hosted at https://github.com/elsebit/nested-iframe-dom-exporter and updates directly from GitHub. Greasy Fork is not required.

## Publish an update

1. Edit the source and add an English changelog entry.
2. Run `npm version patch --no-git-tag-version` (or select a minor/major version).
3. Run `npm run build && npm test && npm run check:artifacts`.
4. Commit the source, version files, generated userscripts, and release manifest.
5. Push to `main`. GitHub Actions validates the release. Tampermonkey can then detect the increased version from the stable raw URL.

Never push generated artifacts until local checks pass: the raw update channel reflects `main` immediately, even before CI finishes. Use pull requests and branch protection if updates need mandatory server-side checks.

The readable script contains stable `@updateURL` and `@downloadURL` metadata. Keep its namespace and file location unchanged. Tampermonkey update intervals are configured on each device; updates are not instantaneous. GitHub raw access is required on every device. If installation opens source text instead of an installation prompt, use Tampermonkey's URL installation/import option.

Do not commit real DOM exports, logs, personal information, access tokens, or local dependencies. GitHub credentials are only needed by maintainers to push code, never by the installed script.
