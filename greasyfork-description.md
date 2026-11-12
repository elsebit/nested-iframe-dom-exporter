# Nested iframe DOM Exporter

Export the current page and its readable nested iframe/frame DOM sources into a single local HTML file using the Tampermonkey menu. Useful for AI-assisted debugging and inspecting nested pages without copying each frame manually.

## Usage

1. Install Tampermonkey and this userscript.
2. Reload the target page and wait for the content and frames you need to finish loading.
3. Open the Tampermonkey menu and select **Export page and nested iframe DOM**.
4. Save the downloaded `finance-dom-*.html` file. Read its source with an AI tool or text editor; do not open it as a replayable offline page.
5. Each document appears in a separate section. `DOM-EXPORT` comments identify frames, parent-child relationships, capture status, and failure reasons. Output uses UTF-8 with a BOM.

## Features

- Works on HTTP/HTTPS pages where userscripts are allowed.
- Recursively captures readable iframe/frame documents, preserving HTML source, page titles, loading state, and nesting metadata.
- Combines document sources directly in one file, without JSON or srcdoc nesting.
- Preserves current ordinary form values and selection states; redacts password fields and recognizable credential form fields.
- Supports nesting through depth 50 and records up to 500 pages/frames. A failed frame does not stop other frames from being processed.
- Reports incomplete captures through `summary.incomplete` and per-frame `status` and `reason` fields.
- Runs only when selected from the menu. No external runtime dependencies, advertising, telemetry, or automatic uploads.

## Limitations and privacy

The same-origin policy and iframe sandbox restrictions still apply. Inaccessible frames are recorded with their location and failure reason. Browser internal pages and other pages that prohibit userscripts are not supported.

Only the currently loaded ordinary DOM is captured. Unloaded pages, Shadow DOM, canvas pixels, JavaScript runtime objects, and network logs are not included. The tool does not navigate pages, click page controls, rewrite frame URLs, or download external stylesheets, images, or fonts.

The script does not directly read cookies, browser storage, or authorization headers. URLs in frame metadata omit query strings and fragments; original DOM attributes are retained. Frame srcdoc attributes are omitted and readable loaded child documents are captured separately.

Exported content may contain personal or business information in page text, attributes, form values, or inline scripts. Redaction is limited and does not guarantee removal of all sensitive data. Review exported files before sharing them. Original scripts are preserved as source text; do not execute the export or open it as an offline web page.

## License

All rights reserved. No open-source permission to modify or redistribute is granted. Installation and use remain subject to the applicable hosting platform rules.
