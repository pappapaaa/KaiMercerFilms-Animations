# Character performance QA status

## Opening (native encoded pixels inspected)
Source: `outputs/preview_v01/shots/part_0.mp4`, source freezeSHA2565d3d413277a442da7168481852d693f8a41c5465a7fa1ff1620039f4427ce5b5. Native1080x1920,30fps. Decoded sampledframes0,5,10,15,20,25,30,40,50,60,70,78, not a new renderer run.

**PASS, sampled opening dog performance:** visible repeating jawopen/close; restrained head/earresponse and tailchange; allfourpaws remain groundedrelativefloor; collar remains attached to neck; whole silhouette stays withinframe. Dog reads as a quadruped, not a humanrig. Coolnightworld +warmtanMax coherent with plum characterink. See `max_bark_motion_sheet.png` and `max_bark_motion_late_sheet.png` (review sheets scaleddown; source MP4 native).

Native stills `contact_v4-f0299.png`, `contact_v4-f0325.png` show narratorcompleteface/hand withinframe, replacing prior emptywall and clippedhead. Fronthead listeningpose no longer presses the profilenose throughwall. Lightcream narrator socks were confirmed in earlier nativeframe240.

## Numeric/source checks
- 990dogactionframes and90exacthumanhandframes pass `test_max_contacts.cjs`.
- True unchangedrepo bodySide,624actualsourcefootStroke stances: worldslip3.61e-16m; soleswithin2.3mmground.
- Defaultcanvas20poseoperationhash exactlymatchesfrozenpreview after optionalprofileBody/groundShadow additions.
- All9vendorTSfiles byte-identical to approved fresh_project source.
- Wholeproject TypeScriptcheck passed at15:17UTC.

## Still required for fullfilm
Actualsequentialnativeframes for new profilewalk, collargrip/release, scratchwall, broadsidebodyhop, girlfriendbedroll, proneHarlan+medic, steakcontact, Sundaycallback. Numericchecks and written choreography are NOT visualapproval for these actions. Lead owns serializedrendering; characterowner will inspect sharedevidence withoutconcurrentrenders.
