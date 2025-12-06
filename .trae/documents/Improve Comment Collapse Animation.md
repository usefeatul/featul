I will improve the collapse animation in `AnimatedReplies.tsx` and fix the "jumping" issue by adjusting the styles in `CommentThread.tsx`.

### 1. Fix "Jumping" and Layout Shift
- **Issue**: The `mt-2` (margin-top) on the `AnimatedReplies` component in `CommentThread.tsx` causes a jump because the margin persists until the animation completely finishes, then disappears instantly.
- **Fix**: In `CommentThread.tsx`, I will change `mt-2` to `pt-2` (padding-top). This moves the spacing *inside* the collapsible container so it animates smoothly with the height.

### 2. Smoother Animation in `AnimatedReplies.tsx`
- **Issue**: The current animation lacks `overflow: "hidden"`, which can cause content to spill out during collapse. The easing might also feel sluggish.
- **Fix**:
    - Add `overflow-hidden` to the `motion.div`.
    - Update the transition to use a `spring` animation (or a tuned bezier) for a more natural, responsive feel.
    - Ensure `opacity` animates in sync with height to prevent the "sluggish" ghosting effect.

### 3. Optional: Icon Animation (if desired)
- I will also inspect `CommentCollapseToggle.tsx` to see if we can add a subtle rotation to the chevron, though the main focus will be the container animation.

I will verify these changes by checking the code structure to ensure no broken styles.
