# Feature Change Form

---

## 1. Metadata
- **Date**: 2026-11-06
- **Author / Contributor**: Antigravity Assistant & Christian
- **Feature / Change Title**: Cute Failover State for Unavailable Datasource
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
When the Google Sheets datasource is unreachable (offline network, DNS failure, 404/500 HTTP errors, or missing snapshot rows), the user should see a friendly, cute failover state with `"sorry, the datasource is unavailable"` rather than a broken or blank graph.

### Proposed Solution
1. Designed an inline kawaii robot/monitor illustration with subtle blush, wavy mouth, and disconnected signal indicators.
2. Added `#failoverState` overlay inside the main visualizer card with the exact message: `"sorry, the datasource is unavailable"`, descriptive explanation, and a "Retry Connection" button.
3. Implemented `setFailoverState(isUnavailable)` to:
   - Toggle the failover overlay and adjust chart opacity.
   - Switch the header pulse indicator and footer status indicator from green/blue to rose (`bg-rose-500`).
   - Update `document.title` and `#headerTitle` to `"sorry, the datasource is unavailable"`.
   - Update the settings modal snapshots table with an unavailable status notice.
4. Seamlessly clears failover mode when connection is restored.

---

## 4. Key Changes & Impacted Files
### Summary of Changes
- **`index.html`**:
  - Added `#statusDot` and `#footerStatusDot` status indicators.
  - Added `#chartContainer` and cute `#failoverState` overlay with SVG graphic.
  - Added `setFailoverState(isUnavailable)` logic.
  - Updated `loadData()` to trigger failover on HTTP failure, fetch error, or empty data, and restore upon success.
- **`docs/features/2026-11-06-datasource-failover-state.md`**: Feature change form created.

---

## 5. Verification & Testing
### Test Scenarios
- [x] Tested JS syntax parsing via Node.js function constructor.
- [x] Verified failover overlay styling with Tailwind CSS classes and dark mode compatibility.
- [x] Verified `setFailoverState(false)` properly restores normal view upon successful fetch.
- [x] Verified "Retry Connection" button re-invokes `loadData(true)`.

### Environment Tested
- [x] Desktop browser environment / Node.js DOM syntax validation.

---

## 6. Pre-Push Checklist
- [x] Code is formatted and clean of debugging artifacts / console logs.
- [x] No breaking changes introduced to existing views or filters.
- [x] Tested locally and verified functioning.
- [x] Documentation updated with this change form in `docs/features/`.

