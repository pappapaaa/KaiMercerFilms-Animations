export const FPS = 30;
export const TOTAL = 1880;
export const smooth = (x:number) => {const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10);};
export type V3=[number,number,number];
export type Shot={id:string;a:number;b:number;pos:V3;look:V3;endPos:V3;endLook:V3;fov:number;dof:number;light:'day'|'golden';stage:'paris'|'atoms'|'friends';};
// Creative story seconds. storyTime maps these to the user's ElevenLabs delivery.
export const SHOTS:Shot[]=[
 {id:'sun-dodge',a:0,b:3.73,pos:[17,16,47],look:[0,15,0],endPos:[15,17,44],endLook:[0,15.3,0],fov:45,dof:0,light:'day',stage:'paris'},
 {id:'tourist',a:3.73,b:12.2,pos:[.4,2.9,25.8],look:[-1.1,1.9,19],endPos:[.0,2.7,25],endLook:[-1.1,1.9,19],fov:43,dof:12,light:'day',stage:'paris'},
 {id:'iron-grows',a:12.2,b:17.03,pos:[13,6,27],look:[0,12,0],endPos:[11,13,25],endLook:[0,18,0],fov:43,dof:1,light:'day',stage:'paris'},
 {id:'uneven-heat',a:17.03,b:24.57,pos:[5,18,30],look:[0,18,0],endPos:[3,20,28],endLook:[0,20,0],fov:44,dof:0,light:'day',stage:'paris'},
 {id:'tiny-parasol',a:24.57,b:28.63,pos:[.4,3.2,27],look:[-.5,2.25,19],endPos:[.1,3.1,26.3],endLook:[-.5,2.25,19],fov:44,dof:13,light:'day',stage:'paris'},
 {id:'inside-iron',a:28.63,b:37.4,pos:[5,4,17],look:[0,0,0],endPos:[4,3,16],endLook:[0,0,0],fov:46,dof:4,light:'day',stage:'atoms'},
 {id:'longer-steps',a:37.4,b:45.03,pos:[.2,5.2,10.5],look:[0,1.2,0],endPos:[.2,4.6,9.5],endLook:[0,1.2,0],fov:43,dof:10,light:'day',stage:'friends'},
 {id:'summit-trace',a:45.03,b:52.87,pos:[7,29,20],look:[0,28.8,0],endPos:[5.5,29,18],endLook:[0,28.8,0],fov:43,dof:3,light:'golden',stage:'paris'},
 {id:'cooldown',a:52.87,b:55.27,pos:[13,18,42],look:[0,16,0],endPos:[12,18,40],endLook:[0,16,0],fov:46,dof:0,light:'golden',stage:'paris'},
 {id:'last-dodge',a:55.27,b:60,pos:[.3,3.2,27],look:[-.5,2.3,19],endPos:[.1,3.1,26.3],endLook:[-.5,2.3,19],fov:44,dof:11,light:'golden',stage:'paris'}
];
export function shotAt(t:number){return SHOTS.find(s=>t>=s.a&&t<s.b)??SHOTS[SHOTS.length-1];}
const lerp3=(a:V3,b:V3,k:number):V3=>a.map((v,i)=>v+(b[i]-v)*k) as V3;
export function cameraAt(t:number){const s=shotAt(t);const u=Math.max(0,Math.min(1,(t-s.a)/(s.b-s.a)));let pos=lerp3(s.pos,s.endPos,u),look=lerp3(s.look,s.endLook,u);const idx=SHOTS.indexOf(s),prev=SHOTS[idx-1];if(prev&&prev.stage===s.stage&&t-s.a<.8){const k=smooth((t-s.a)/.8);pos=lerp3(prev.endPos,pos,k);look=lerp3(prev.endLook,look,k);}return {pos,look,fov:s.fov,roll:Math.sin(u*Math.PI)*.012,s};}
export const VOICE_MAP:[number,number][]=[[0,0],[3.90,3.73],[12.90,12.2],[17.66,17.03],[25.78,24.57],[30.69,28.63],[39.56,37.4],[47.38,45.03],[55.30,52.87],[57.28,55.27],[1880/30,60]];
export function storyTime(seconds:number){for(let i=1;i<VOICE_MAP.length;i++){const [b,y]=VOICE_MAP[i],[a,x]=VOICE_MAP[i-1];if(seconds<=b)return x+(y-x)*Math.max(0,(seconds-a)/(b-a));}return 60;}
