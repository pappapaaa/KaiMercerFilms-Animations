# Independent source-level findings

These are code-derived risks, not claims about final rendered appearance.

## DOG-01 — planted walking feet slide despite contact claim

Status at 14:50 UTC: corrected by performance owner, independently rechecked analytically. Corrected amplitude81.375px gives maximum absolute stance world-foot drift below3e-16m. Owner test also checks990 action frames (`qa/max-contact-tests.json`). Actual integrated root/travel agreement and pixels remain pending.

`maxFootPhase` uses stride length .62m and stance fraction .63, so the root moves .3906m during a planted stance. Local foot draws from +48 to -48 design units at .0024m/unit: only .2304m of compensating travel. The planted foot therefore moves forward .1602m per stance if integration obeys the supplied travel contract. Bark/idle fixed-paw poses are not affected.

Correction options: derive half-excursion as `strideLength * stance / (2*U) = 81.375` design units, or revise stride length to `.2304/.63 ≈ .365714m`. Numeric verification must calculate root+local paw position across planted intervals, not merely inspect local paw y=0.

## DOG-02 — scratch paw hook is not its leading contact edge

Status at 14:54 UTC: performance owner moved leading-edge hook to true drawn edge; world owner confirmed inner plasterx2.69; lead reports barkrootx1.70 and scratchrootx1.68, so scratch edge2.66 is safely inside room. Independent pixel check pending.

At rootx1.78, scratch hookx.98 gives anchor2.76. But the paw bean is centred +6 designpx and radius35px, so its drawn leading edge lies about .0984m beyond the hook, at x2.8584. This exceeds nominal wallx2.8 even before its inner-face thickness is considered. Move hook back by paw's leading extent or define a contact-edge hook from exact wall face. Requires pixel confirmation because wall rendering/cutaway may change apparent overlap.
