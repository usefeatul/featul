import { expect, mock, test } from "bun:test";
import { animatePanelResize } from "./motion";

const small = { left: 588, top: 284, width: 396, height: 700 };
const large = { left: 484, top: 234, width: 500, height: 750 };

test("expansion and collapse glide between existing and final bounds", () => {
  const animation = {} as Animation;
  const animate = mock(() => animation);
  const element = { animate } as unknown as HTMLElement;
  expect(animatePanelResize(element, small, large, false)).toBe(animation);
  expect(animate.mock.calls[0]).toEqual([
    [
      { transformOrigin: "0 0", transform: "translate(104px, 50px) scale(0.792, 0.9333333333333333)" },
      { transformOrigin: "0 0", transform: "none" },
    ],
    { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  ]);
  animatePanelResize(element, large, small, false);
  expect(animate).toHaveBeenCalledTimes(2);
});

test("skips motion for reduced motion, unchanged mobile bounds, or unavailable animation", () => {
  const animate = mock(() => ({} as Animation));
  const element = { animate } as unknown as HTMLElement;
  expect(animatePanelResize(element, small, large, true)).toBeNull();
  expect(animatePanelResize(element, small, small, false)).toBeNull();
  expect(animatePanelResize({} as HTMLElement, small, large, false)).toBeNull();
  expect(animate).not.toHaveBeenCalled();
});
