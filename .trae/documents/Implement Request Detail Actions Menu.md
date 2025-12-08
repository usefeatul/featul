I will implement the "More Options" menu for the request detail view.

1.  **Create `RequestActions` component**:
    *   Create a new file `apps/feed/src/components/subdomain/request-detail/RequestActions.tsx`.
    *   Implement a `Popover` menu triggered by a `MoreVertical` icon.
    *   Add menu items for **Edit**, **Share**, **Report**, and **Delete** using `lucide-react` icons.
    *   Use `@feedgot/ui/components/popover` components to match the design system.

2.  **Update `RequestContent` component**:
    *   Modify `apps/feed/src/components/subdomain/request-detail/RequestContent.tsx`.
    *   Import the `RequestActions` component.
    *   Update the layout of the top section (status bar) to include the `RequestActions` component aligned to the right (using `justify-between`).

This will place the vertical dots icon at the top right corner of the request content card, providing the requested design.
