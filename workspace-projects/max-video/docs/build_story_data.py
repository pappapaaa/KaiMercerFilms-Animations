from pathlib import Path
import json,math
r=Path(__file__).resolve().parent.parent
rows=[
(0,'barkwall','bedroom','Max barks at the same wall; fixed paws, alert ears.'),
(2.63,'clocknight','bedroom','3 AM clock; rack/reframe to sleepless narrator for every night for a week.'),
(5.11,'giveaway','bedroom','Guilty tired close-up: about to give him away. No phone draft yet.'),
(7.24,'firstnightmouse','bedroom','First night: dog sniffs low, narrator assumes a mouse.'),
(9.70,'earwall','bedroom','Narrator presses his ear to the wall and listens.'),
(12.72,'go_to_sleep','bedroom','Exasperated narrator orders Max to sleep.'),
(14.64,'claw_paint','bedroom','Max whines then front paw claws the wall paint with planted rear paws.'),
(18.48,'sleepless','bedroom','Thursday: narrator exhausted after four days.'),
(21.88,'girlfriend_roll','bedroom','Girlfriend rolls over in bed and groans.'),
(24.12,'girlfriend_scold','bedroom','Girlfriend points responsibility back at narrator.'),
(26.23,'neighbor_excuse','bedroom','Narrator gestures toward shared wall: elderly neighbor already asleep.'),
(29.73,'collar_drag','bedroom','Narrator contacts Max collar and draws him away; not a free-floating tug.'),
(31.64,'break_free','bedroom','Max slips free and sprints back to the exact same wall.'),
(34.69,'write_post','bedroom','Morning: narrator writes a rehoming draft on phone.'),
(36.75,'draft_text','bedroom','Phone insert: Free to a good home; one loud dog. Draft only.'),
(39.76,'save_draft','bedroom','Tap save as draft; narrator withdraws angry to bed.'),
(42.90,'alarm_again','bedroom','At 3 AM, Max urgently returns to the wall.'),
(45.52,'ominous_quiet','bedroom','Barking stops; tense ears and held framing before howl.'),
(47.41,'howl','bedroom','Max lifts his muzzle and howls toward wall.'),
(48.66,'body_wall','bedroom','Max throws body against wall, recoils, plants paws; controlled contact.'),
(51.19,'yell_abort','bedroom','Narrator draws breath to yell, then stalls mid-action.'),
(52.77,'hear_wall','bedroom','Ear/eye attention shifts to drywall; camera stops restless motion.'),
(54.94,'thumps','bedroom','Three distinct thumps. Hold suspense; no victim reveal yet.'),
(57.86,'stomach_drop','bedroom','Realization close-up; shoulders drop, eyes sharpen.'),
(59.52,'hallway_run','hallway','Socked narrator runs down hallway toward Harlan door4B.'),
(61.45,'pound_door','hallway','Narrator pounds Harlan door with hand contact.'),
(63.31,'call_harlan','hallway','Sir, are you okay?! Human close-up, then door.'),
(65.19,'no_answer','hallway','No answer; hold empty closed door rather than random camera motion.'),
(66.16,'tap_back','hallway','Weak tapping back; narrator listens, then pivots to act.'),
(69.00,'call_911','hallway','Narrator calls911 on phone; no exaggerated readable UI needed.'),
(70.32,'rescue_entry','hallway','Paramedics arrive and force Harlan door; decisive entry.'),
(72.49,'bath_scratch','bathroom','Max already scratching at bathroom entrance.'),
(75.08,'fallen_harlan','bathroom','First reveal of Harlan fallen on floor; non-graphic, breathing.'),
(76.89,'unreachable_phone','bathroom','Low insert connects outstretched hand and unreachable phone.'),
(79.92,'paramedic','bathroom','Paramedic tends Harlan, then turns to narrator.'),
(81.73,'warning','bathroom','Another hour warning: steady two-shot, gravity, no comic effects.'),
(85.21,'delete_post','bedroom','Back home: narrator deletes the saved draft, regret turning to gratitude.'),
(88.27,'steak','bedroom','Whole steak reward; warm light, Max happy, narrator affectionate.'),
(90.58,'harlan_payoff','sunday','Harlan restored and standing; safe warm everyday routine.'),
(91.73,'sunday','sunday','Sunday connection across same wall, matched spatial geography.'),
(92.91,'two_knocks','sunday','Harlan knocks exactly twice on shared wall; readable hand contact.'),
(94.66,'bark_back','sunday','Max barks back, joyful ears/tail; warm closing two-shot.')]
shots=[]
for i,(start,action,set_,label) in enumerate(rows):
 end=rows[i+1][0] if i+1<len(rows) else 96.208938
 sf=round(start*30);ef=round(end*30) if i+1<len(rows) else 2887
 shots.append({'id':i,'startSeconds':start,'endSeconds':end,'startFrame':sf,'endFrameExclusive':ef,'frames':ef-sf,'label':label,'set':set_,'action':action})
plan={'fps':30,'totalFrames':2887,'audioSeconds':96.208938,'shots':shots}
(r/'docs/story_beats.json').write_text(json.dumps(plan,indent=2)+'\n')
print('Created',len(shots),'shots. Caption data is maintained independently by docs/build_captions.py.')
