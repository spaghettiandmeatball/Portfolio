import {crossingError} from './physics.js';
export const courses=[
 {name:'The warm-up',hint:'Through the gold hoop. Into the picnic basket.'},
 {name:'Bank the snack',hint:'The stump blocks the middle. Bank off the right board!'},
 {name:'Thread the gap',hint:'Wait for the gap. Then thread your snack through.'},
 {name:'Umbrella roulette',hint:'Watch the spinning parasol. Find your window!'},
 {name:'Log on the loose',hint:'Clear the rolling log. Keep your landing soft.'},
 {name:'Mushroom express',hint:'Hit the spotted mushroom. Bounce up to the high picnic basket!'},
 {name:'The uphill picnic',hint:'Skim the ramp for a little lift. Lunch is upstairs.'}
];
export function gap(t){return {x:Math.sin(t*.85)*.55,h:1.35,z:3,radiusX:.6,radiusH:.48};}
export const umbrellaAngle=t=>t*1.15;
export const logPosition=t=>Math.sin(t*1.2)*1.35;
export const targetHeight=index=>index===5?1.8:index===6?2.05:.75;
export function resolveCourse(previous,next,index,t0,t1){
 let b={...next},impact=null;
 if(index===1){
  if(previous.x<1.5&&b.x>=1.5&&b.vx>0){
   const f=(1.5-previous.x)/(b.x-previous.x),z=previous.z+(b.z-previous.z)*f,h=previous.h+(b.h-previous.h)*f;
   if(z>=1.5&&z<=5.4&&h>=0&&h<=2.5){b.x=1.5-(b.x-1.5)*.92;b.vx*=-.92;b.banked=true;impact={type:'board',x:1.5,h,z};}
  }
  const error=crossingError(previous,b,{x:0,h:0,z:4},{x:0,h:0,z:4});
  if(error&&Math.abs(error.x)<.65&&error.h<1.8&&error.h>=0)return {ball:b,blocked:true,message:'Bonk! Try the board on the right.'};
 }
 if(index===2){const error=crossingError(previous,b,gap(t0),gap(t1));if(error&&(Math.abs(error.x)>.6||Math.abs(error.h)>.48))return {ball:b,blocked:true,message:'Bonk! Time it through the gap.'};}
 if(index===3){
  const e=crossingError(previous,b,{x:.55,h:1.35,z:3},{x:.55,h:1.35,z:3});
  if(e){const a=umbrellaAngle((t0+t1)/2),along=e.x*Math.cos(a)+e.h*Math.sin(a),across=-e.x*Math.sin(a)+e.h*Math.cos(a);if(along*along+across*across<1.35*1.35&&across>-.1)return {ball:b,blocked:true,message:'Umbrella says nope! Wait for an opening.'};}
 }
 if(index===4){const e=crossingError(previous,b,{x:logPosition(t0),h:.4,z:3},{x:logPosition(t1),h:.4,z:3});if(e&&Math.abs(e.x)<.95&&Math.abs(e.h)<.5)return {ball:b,blocked:true,message:'Timber! Try a higher arc.'};}
 if(index===5||index===6){
  const depth=index===5?2:2.8;const e=crossingError(previous,b,{x:0,h:1.2,z:depth},{x:0,h:1.2,z:depth});
  if(e&&!b.boosted&&Math.abs(e.x)<.65&&Math.abs(e.h)<.55){const boost=index===5?1.58:2.45;b.vh+=boost;b.boosted=true;impact={type:index===5?'mushroom':'ramp',x:b.x,h:b.h,z:depth};}
 }
 return {ball:b,blocked:false,impact};
}
