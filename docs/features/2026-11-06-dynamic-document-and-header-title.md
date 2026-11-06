# Feature Change Form

---

## 1. Metadata
- **Date**: 2026-11-06
- **Author / Contributor**: Antigravity Assistant & Christian
- **Feature / Change Title**: Dynamic Document and Header Title from Loaded Spreadsheet
- **Target Branch**: `main`
- **Related Issue / Task / Ticket**: N/A

---

## 2. Change Classification
- [x] New Feature
- [x] Enhancement / Improvement
- [ ] Bug Fix
- [x] UI / UX Redesign
- [ ] Performance Optimization
- [ ] Documentation / Refactoring

---

## 3. Overview & Context
### Problem Statement / Objective
The document and application header had static titles. While the spreadsheet is loading, the title should indicate `"loading document"` (both in the browser tab `<title>` and in the top navigation header `<h1>`). Once the Google Spreadsheet data is loaded, the actual title of the spreadsheet should dynamically update both elements.

### Proposed Solution
1. Initialized `<title>` and `<h1 id="headerTitle">` to `"loading document"`.
2. Updated `loadData()` to use `fetch()` so HTTP response headers (specifically `Content-Disposition`) can be accessed.
3. Extracted the published spreadsheet name from `Content-Disposition` (parsing UTF-8 filename metadata and removing the tab/file extension suffix).
4. Dynamically applied the extracted spreadsheet title to `document.title` and `#headerTitle` upon successful data load.

---

## 4. Key Changes & Impacted Files
### Summary of Changes
- Set initial HTML `<title>` to `"loading document"`.
- Added `id="headerTitle"` and initial text `"loading document"` to the header `<h1>`.
- Refactored `loadData()` to `async/await` with `fetch()`.
- Implemented robust `Content-Disposition` filename and spreadsheet title parser with UTF-8 decoding support.
- Updated `document.title` and `#headerTitle` dynamically when the spreadsheet finishes loading.

### Impacted Files
- `index.html` — Updated title, header, and `loadData()` function.
- `docs/features/2026-11-06-dynamic-document-and-header-title.md` — Feature change form.

---

## 5. Verification & Testing
### Test Scenarios
- [x] Verified initial state: `<title>` and `#headerTitle` are set to `"loading document"`.
- [x] Verified extraction: Script accurately parses `Content-Disposition` header from published Google Sheets endpoint to yield `"2026-nmsapps workforce task tracker"`.
- [x] Verified PapaParse integration: CSV text is correctly parsed into snapshot objects.

### Environment Tested
- [x] Node.js test harness against live Google Sheets CSV endpoint
- [x] HTML & JavaScript syntax validation

---

## 6. Pre-Push Checklist
- [x] Code is formatted and clean of debugging artifacts / console logs.
- [x] No breaking changes introduced to existing views or filters.
- [x] Tested locally and verified functioning.
- [x] Documentation updated with this change form in `docs/features/`.

