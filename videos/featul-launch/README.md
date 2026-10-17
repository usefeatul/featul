# Featul app showcase

A 30-second, 1920×1080, 30 fps product showcase built with Hyperframes 0.8.166. The app occupies 27.2 seconds, with focused zooms, a request-opening cursor, roadmap highlights, and scrolling public pages. Upbeat electronic music runs throughout, with fades and beat-timed cuts. No narration.

## Preview and render

From this directory:

```sh
npm run dev
npm run check
npm run render -- --quality delivery --workers 1 --output renders/showcase.mp4
```

The scripts run Hyperframes with an isolated Node 22 runtime through npx. FFmpeg and Chrome are required. All production assets are local; no HeyGen account is required.

For a persistent editable Studio preview:

```sh
npx --yes --package=node@22 --package=hyperframes@0.8.166 hyperframes preview --background
```

## Edit

`BRIEF.md` holds the scope, `STORYBOARD.md` the sequence, and `frame.md` the visual specification. The assembled timeline and soundtrack are in `index.html`.

| Active frame | Time | View |
| --- | --- | --- |
| `compositions/frames/workspace.html` | 0–4.8s | Feedback workspace |
| `compositions/frames/request.html` | 4.8–9.6s | Request details |
| `compositions/frames/planning.html` | 9.6–16s | Roadmap |
| `compositions/frames/portal.html` | 16–20.8s | Public feedback board |
| `compositions/frames/updates.html` | 20.8–27.2s | Published changelog |
| `compositions/frames/finish.html` | 27.2–30s | Brand and music attribution |

Animations use paused, deterministic GSAP timelines. These are animated repository screenshots, not a live screen recording. The screens show the sample Convex workspace. UI crops and camera movement are intentional. The earlier five scene sources remain in the folder but are not mounted by the current timeline.

## Delivery

`renders/showcase.mp4` is the revised delivery, also copied to `renders/video.mp4`. The original silent version is preserved as `renders/video-v1.mp4`. Generated renders and Hyperframes caches are ignored by Git.

## Asset provenance

Product screens: `apps/web/public/featulimg/` in the parent repository. Featul logo: `apps/web/public/favicon.svg`. Inter Tight: Google Fonts, under the SIL Open Font License in `assets/OFL.txt`. GSAP 3.14.2: vendored from its official npm distribution via jsDelivr; license header retained. Hyperframes motion-reference sources and their licenses are preserved in `compositions/components/`.

Music: “Cipher” by Kevin MacLeod, 150 BPM, licensed CC BY 3.0. The excerpt begins at source time 32.29s. Attribution appears on the end card and in `CREDITS.txt`; preserve it when sharing.

## Verification

Hyperframes check passed with zero lint, runtime, layout, or motion issues; all 16 text contrast checks passed. Decoded MP4 frames were inspected in all six scenes. The output is exactly 30 seconds, H.264 1920×1080 at 30 fps, with stereo AAC at 48 kHz. Audio peak measured −4.9 dBFS; the ending fade was verified in the encoded audio.
