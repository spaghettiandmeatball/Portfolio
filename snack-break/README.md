# Snack Break 3D playtest

Open `/snack-break/` on the portfolio preview server. This remains a separate test page; the portfolio entry and loader are unchanged. Nothing is deployed.

The game now uses Three.js, the portfolio's optimized animated Chonkimals GLBs, a perspective camera, shadowed woodland geometry, an open 3D picnic basket, and a tumbling cookie. The aim dots, characters, hoop and obstacles share world coordinates with the throw physics. The view faces into the picnic; pull the cookie toward you and release. Horizontal pull steers the opposite direction, like a slingshot.

A run lasts 90 seconds, starting at the first throw. Five misses end the run early. Every three deliveries brings the next course: warm-up, a bank off the right board around a stump, a moving gap, a spinning parasol, a rolling log, a bouncy mushroom, and a sloped ramp. The last two boost the snack into elevated picnic baskets. Later rounds tighten the catch area and add movement. Clean catches build a multiplier up to 4x; perfect placement, hoop passes and successful banks add bonus points. Results show catches, precision, hoops, banks and streak. Personal best is stored in this browser only.

Keyboard: focus the playfield; left/right steer, up/down adjust power, Space throws. Pause holds the timer and simulation. Practice controls select any of the seven courses and adjust launch pitch/power. Resizing cancels an in-flight shot without a penalty; background tabs pause the run. Optional synthesized sound starts after a user gesture. Pulling back builds a quiet rising tone. Board banks get a wooden tok, flex and impact sparks. Catches snap the hinged picnic basket shut, trigger a munch pose and burst crumbs; perfects and banks get a stronger camera bump (disabled for reduced motion). Misses bounce and settle visibly, then an ant team carries them away. Cosmetic missed snacks are capped at three and never cost extra lives. No shot replay is included.

Prototype art: cookie, picnic basket, woodland and obstacle geometry. Joel can replace these with authored props, environments and UI. Existing crew assets are reused from `assets/optimized/{bear,dog,frog}.glb`; their original animation library is retained. The scene caps pixel ratio at 1.25 and updates only the visible character.

Checks: `node snack-break/physics.test.mjs`, `node snack-break/arcade.test.mjs`, `node snack-break/courses.test.mjs`. These cover depth collision, moving targets, scoring, timers, end states, reflection, blockers and viable routes. Loading integration remains a later step.

