# Joel — Portfolio (Coming Soon)

A static portfolio holding page built with Three.js and GitHub Pages.

Interactive 3D welcoming committee featuring real-time animation, interactive speech bubbles, and reduced-motion accessibility support.

## Overview
- All model assets and JavaScript are served locally.
- Google Fonts with system fallbacks.
- Zero analytics, trackers, contact forms, or backend dependencies.
- Respects `prefers-reduced-motion` settings.

## Interaction
Tap a character or its label to trigger a hop and speech bubble. Animations respect the device's reduced-motion preference. Dice Challenge and Letter Lock have looping presentation videos with an Unmute preview / Mute preview control. Each new slide starts muted.

## Project players

Word-O-Meter (Zynga Hackathon 2025) runs from `play/word-o-meter/index.html`. It loads Transformers.js and a word-similarity model from external hosts on first use. The portfolio copy adapts the phone layout to its container, hides development controls, and reports module-loading failures through the loading screen. The original supplied file is unchanged.

Chonkimals has a Full screen toggle with a viewport-filling fallback when native fullscreen is unavailable. Exit full screen resizes the existing game without restarting it. The expanded layout keeps close controls visible and respects phone safe areas.

Project clips open in an accessible dialog; closing it unloads the player and stops playback. The carousel holds its current slide while the dialog is open. YouTube and Instagram clips require the provider to permit embedding; an original-clip link is available if playback is blocked.

Chonkimals opens in the same dialog and loads only on demand. `play/chonkimals/` contains the supplied compiled game, its runtime assets, and Three.js 0.170.0. The standalone entry point uses relative URLs so it also works on GitHub Pages under a project path. To update the game, replace `game.js` and `assets/` from a new export; keep the portfolio's standalone `index.html`. Closing the game unloads it; persistent progress follows the supplied game's own save behavior.
`play/chonkimals/game.js` has one export compatibility adjustment: `loadClip` loads the included individual audio files because the supplied export omits its combined sound pack.
