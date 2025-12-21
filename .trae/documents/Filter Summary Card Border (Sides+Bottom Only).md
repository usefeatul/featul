## Goal
Apply a border only on the left, right, and bottom edges of the filter summary card; keep the top edge borderless.

## Change
- In `apps/feed/src/components/requests/FilterSummary.tsx:130`, replace the card container classes:
  - From: `bg-card shadow-sm border-t-transparent overflow-hidden`
  - To: `bg-card shadow-sm border-x border-b border-border overflow-hidden rounded-b-md`

## Rationale
- `border-x` and `border-b` add borders to sides and bottom only.
- `border-border` uses the design token color for borders.
- `rounded-b-md` keeps bottom corners rounded while top remains flush.
- Removes `border-t-transparent` since we no longer render a top border at all.

## Verification
- Open the feed page with active filters so the summary renders.
- Confirm visible border on left/right/bottom; top edge has no border.
- Check overflow scroll and focus styles still behave as before.

## Optional Tweaks (if needed)
- If the theme doesn’t define `border-border`, use just `border-x border-b` and rely on default border color.
- Adjust the radius size (`rounded-b-sm`/`rounded-b`) to match design system.