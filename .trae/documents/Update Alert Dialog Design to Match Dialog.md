I will update `packages/ui/src/components/alert-dialog.tsx` to match the design and implementation patterns of `packages/ui/src/components/dialog.tsx`.

### Implementation Steps
1.  **Update Imports**: Add `import { motion } from "framer-motion"` to `alert-dialog.tsx`.
2.  **Refactor Components**:
    -   Convert components to use `React.forwardRef` to maintain consistency with `dialog.tsx`.
    -   **`AlertDialogOverlay`**: Implement using `motion.div` wrapped in `AlertDialogPrimitive.Overlay` with the same `initial`, `animate`, and `exit` props as `DialogOverlay`. Update classes to `bg-black/30 backdrop-blur-sm`.
    -   **`AlertDialogContent`**: Implement using `motion.div` wrapped in `AlertDialogPrimitive.Content` with the spring transition animation. Update classes to match `DialogContent` (e.g., `w-[min(92vw,600px)]`, `shadow-2xl`, `p-8`).
    -   **`AlertDialogTitle`**: Update class to `text-2xl font-semibold` to match `DialogTitle`.
    -   **`AlertDialogHeader` & `AlertDialogFooter`**: Update layout classes (e.g., using `space-y-2`) to match `DialogHeader` and `DialogFooter`.
3.  **Verify**: Ensure all exports remain correct and the file compiles without errors.
