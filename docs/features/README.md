# Features & Changes Documentation

This directory tracks all latest feature additions, enhancements, bug fixes, and change forms before each `git push`.

## Workflow Before Every Push

1. **Copy the Template**:
   Copy [`template.md`](./template.md) to a new file named with the date and feature name:
   ```bash
   docs/features/YYYY-MM-DD-<feature-or-change-name>.md
   ```
   *(Example: `docs/features/2026-11-06-workforce-burndown-tracker.md`)*

2. **Fill in the Form**:
   - Provide change summary, impacted files, rationale, and test verification.
   - Complete the pre-push checklist.

3. **Stage and Commit**:
   Include the change form along with your code changes:
   ```bash
   git add docs/features/YYYY-MM-DD-<feature-or-change-name>.md
   git commit -m "feat: description of change"
   git push origin <branch>
   ```

---

## Directory Contents

- [`template.md`](./template.md) — Standard Feature Change Form template.

