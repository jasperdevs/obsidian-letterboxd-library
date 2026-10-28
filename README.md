# Letterboxd Library

An independent Obsidian desktop plugin for watched films, ratings and stats. Requires Obsidian 1.14.5 or later.

- Compact rows with small posters and links to each film on Letterboxd.
- Personal ratings and Letterboxd averages, both out of five.
- Movies and shorts; combined search, rating and decade filters; newest-logged-first by default, with ascending or descending sorting by logged date, title, release date, runtime or rating.
- Copy titles and years for both categories, movies only, or shorts only.
- Clickable release-decade and rating charts, format breakdowns, runtime, longest/shortest films, oldest/newest releases, and rating statistics.

## Install

Copy `main.js`, `styles.css` and `manifest.json` into `.obsidian/plugins/letterboxd-library/`. Enable **Letterboxd Library** under Settings → Community plugins.

Set your username in the plugin settings. Import a Letterboxd export ZIP from the same settings page. Run **Letterboxd Library: Open library** from the command palette. The default note is `Letterboxd.md`; its location is configurable. You can also put this block in any note:

````markdown
```letterboxd-library
```
````

The shareable package contains no account settings or film history.

## Import and refresh

Use Settings → Letterboxd Library → Import export to choose the original Letterboxd export ZIP, or `watched.csv`. ZIP imports also read `ratings.csv`, entry dates from `diary.csv`, and the username from `profile.csv`. Review text, watchlists, deleted entries and private profile fields are not saved. A CSV import uses the username in settings.

Copy tries to refresh the public watched list before copying. Turn off **Refresh before copying** in the plugin settings to copy immediately. If refresh fails, Copy uses the saved library and shows “Saved list used”. Multiple requests share an existing refresh.

Refresh reads the complete public watched list in newest-added order and the recent RSS feed to promote newly logged entries and rewatches. Export imports use their recorded entry dates. The RSS feed alone is never treated as the complete library. Letterboxd can block automated requests; failed refreshes preserve the saved library. Import a new export when that happens. Film details and community averages are cached; refresh checks cached metadata again after seven days.

Switching usernames hides the previous account's library until the new account is imported or refreshed. Importing a ZIP selects the username contained in that export.

## Display and data

The interface inherits Obsidian's fonts, colors and controls. Posters are optional, lazy-loaded at 70 × 105 pixels and displayed at 32 × 48 pixels. Poster requests go to Letterboxd's image CDN. Missing posters or ratings do not prevent browsing or copying.

Shorts have a runtime of 40 minutes or less. Unknown runtimes remain unclassified. Copy → Both includes every film; copy output is plain `Title (Year)`, one per line. Search and sort do not change the copy categories.

Stats count unique watched films. Hours add their known runtimes once, without counting rewatches. Rating charts and the personal average include rated films only. Clicking a chart bar opens its films in the library. Missing sort values stay at the end in either direction. Reset clears all filters and restores newest-logged-first order. A dash indicates an unavailable rating.

Settings and library data are stored locally in the plugin's `data.json`. Use **Export library → Export CSV** in settings to save the complete cached library to your vault, even offline or while a refresh runs. Export includes title, year, full release date where available, type, runtime, both ratings, and the film URL. Existing exports are never overwritten.

Oldest/newest and release-date sorting use year, month and day when available. Year-only dates remain partial and are identified in Stats.

The plugin makes no background requests, uses no credentials or API keys, and does not send vault notes anywhere.

## Development

No runtime dependencies or build step. Run `npm ci` and `npm run check` to run unit and browser-DOM tests. Set `LETTERBOXD_EXPORT` to a local ZIP path to include export checks. jsdom is a development-only test dependency.

Code is licensed under MIT; see [LICENSE](LICENSE). Logo terms are described in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The Letterboxd logo comes from the [official brand assets](https://letterboxd.com/about/brand/) and links to Letterboxd. This plugin is independent of Letterboxd.
