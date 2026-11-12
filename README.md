# Nested iframe DOM Exporter

Export a page and its readable nested frames as one local HTML source file for debugging and AI-assisted analysis.

## Install and automatic updates

[Install the userscript](https://raw.githubusercontent.com/elsebit/nested-iframe-dom-exporter/main/export-dom.user.js) with Tampermonkey enabled, then confirm installation.

The script uses explicit GitHub `@updateURL` and `@downloadURL` addresses. After the one-time installation on each device, Tampermonkey checks for newer versions according to its update settings. No Greasy Fork account or access is needed. Your devices must be able to reach `raw.githubusercontent.com`; GitHub hosting does not bypass network restrictions.

For copies previously installed by pasting code or importing a local file, install from the link above once to adopt this update channel. Keep only one installed copy enabled. The namespace is unchanged for compatibility.

## Usage

1. Reload the target HTTP/HTTPS page and wait for its frames to load.
2. Open the Tampermonkey menu and select **Export page and nested iframe DOM**.
3. Read the downloaded `finance-dom-*.html` source in a text editor or AI tool, not as an offline web page.

The file contains raw document sources separated by `DOM-EXPORT` comments with frame IDs, parent relationships, status, and capture limitations. Output uses UTF-8 with a BOM. Only the menu action triggers capture.

## Scope and privacy

Captures currently loaded ordinary DOM and readable nested frames, through depth 50 and up to 500 frame records. Same-origin and sandbox restrictions apply. Shadow DOM, canvas pixels, unloaded pages, runtime JavaScript objects, and network logs are not captured.

No telemetry, uploads, external runtime dependencies, direct cookie/storage access, or business-button clicks. Recognizable password/credential form fields are redacted, but other page content and attributes may contain sensitive information. Review exports before sharing. Scripts in exports are source text only: do not execute the exported HTML.

## Development

Requires Node.js 20 or newer.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm test
npm run check:artifacts
```

Edit `src/export-dom.js` and the build configuration, not generated artifacts. The build produces readable and obfuscated userscripts and a SHA-256 manifest. The readable file is the supported public installation/update channel. The obfuscated artifact is retained for reproducibility and testing only; do not install both.

## Release

See [PUBLISHING.md](PUBLISHING.md). Release versions are published to this repository's `main` branch. CI checks tests, generated artifacts, English-only project files, and update metadata. Increasing the version and pushing regenerated artifacts makes the new version available to Tampermonkey automatically; no separate hosting service is involved.

## License

All rights reserved. See [LICENSE](LICENSE).
