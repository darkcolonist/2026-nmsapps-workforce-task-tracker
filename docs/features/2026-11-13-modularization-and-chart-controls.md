# Modularization & Chart Controls

## Overview
Refactored the application from a single monolithic `index.html` into ES modules under `js/` and added interactive date filtering, weekend toggling, weekday axis formatting, and a per-project breakdown view.

## Module Architecture
- `index.html` — Page layout, Tailwind configuration, CDN dependencies, and `<script type="module" src="js/app.js"></script>`.
- `js/config.js` — Application constants (`CSV_URL`, `MAX_DEFAULT_DAYS`, `PROJECT_COLORS`).
- `js/dateUtils.js` — Timezone-safe local date parsing (`parseLocalDate`), `isWeekend`, `formatWeekday`, `formatFullDate`, and `formatShortDate`.
- `js/data.js` — CSV fetching, `Content-Disposition` title extraction, and PapaParse row normalization.
- `js/chart.js` — Chart.js initialization, `updateConsolidatedChart`, `updatePerProjectChart`, weekday X-axis labels, and full-date hover tooltips.
- `js/ui.js` — KPI ribbon updates, failover state handling, modal controls, dropdown/table population, and date range label formatting.
- `js/app.js` — Application state, event bindings, and `renderView()` orchestration.

## Features
- **Date Range Slider (`#dateStartSlider`, `#dateEndSlider`)**: Filters the visible date window on the chart and KPIs.
- **30-Day Default Window**: Defaults to the last 30 available days (`MAX_DEFAULT_DAYS = 30`), or all available days when fewer than 30 exist.
- **Weekend Toggle (`#weekendToggle`)**: Shows or hides Saturday and Sunday snapshots.
- **Weekday Axis & Full-Date Tooltip**: X-axis ticks display weekday names (e.g., `Monday`), while hovering displays the full date (e.g., `Friday, November 13, 2026`).
- **Consolidated vs. By Project View (`#viewModeSelect`)**: Switches between the consolidated view (Remaining & Completed for the selected project) and the per-project breakdown (a solid Remaining line and dashed Done line for each project).

