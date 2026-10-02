import assert from 'node:assert/strict';
import {advanceForward,caughtForward} from './physics.js';
import {resolveCourse,gap,targetHeight} from './courses.js';
function shoot(vx,course,phase=0,power=6){let b={x:0,z:0,h:.7,vx,vz:power,vh:Math.tan(55*Math.PI/180)*power*.298,age:0},impacts=[];for(let i=0;i<240;i++){const result=resolveCourse(b,advanceForward(b,1/120),course,phase+i/120,phase+(i+1)/120);if(result.impact)impacts.push(result.impact);if(result.blocked)return {blocked:true,impacts};const n=result.ball;if(caughtForward(b,n,{x:0,h:targetHeight(course),z:6},{x:0,h:targetHeight(course),z:6}))return {caught:true,banked:n.banked,boosted:n.boosted,impacts};b=n;if(b.z>6||b.h<0)break;}return {miss:true,impacts};}
assert(shoot(0,0).caught);assert(shoot(0,1).blocked,'Stump stops the straight throw');const bank=shoot(3,1);assert(bank.caught,'Bank reaches the picnic basket');assert(bank.banked);assert.equal(bank.impacts.length,1,'One impact per reflection');assert.equal(bank.impacts[0].type,'board');assert(shoot(0,2).caught);assert(shoot(3,2).blocked);
// The spinning paddle must have both obstructed and passable timing windows.
assert(shoot(0,3,-.5).blocked);assert(shoot(0,3,2.8).caught);
assert(shoot(0,4).caught,'Normal arc clears rolling log');assert(shoot(0,4,-.75,4).blocked,'A low throw meets the log');
for(const course of [5,6]){const shot=shoot(0,course);assert(shot.caught,'Boost reaches elevated picnic basket on course '+course);assert(shot.boosted);assert.equal(shot.impacts.length,1,'Boost fires once');assert(shoot(2,course).miss,'Missing the prop misses the elevated picnic basket');}
const g=gap(2);assert(g.x>=-.55&&g.x<=.55);
console.log('Seven courses passed: reflection, timed openings, rolling log, one-shot boosts and reachable high targets.');
