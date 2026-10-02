import assert from 'node:assert/strict';
import {advanceForward,projectForward,caughtForward,TARGET_DEPTH} from './physics.js';
const bear={x:0,h:.75,z:TARGET_DEPTH};
const initial=(vx=0,power=64)=>{const vz=power/64*6;return {x:0,z:0,h:.7,vx,vz,vh:Math.tan(55*Math.PI/180)*vz*.298,age:0};};
function delivery(start,at=()=>bear,phase=0){let b=start;for(let i=0;i<300;i++){const t=i*.016,n=advanceForward(b,.016);if(caughtForward(b,n,at(t+phase),at(t+phase+.016)))return true;if(n.z>=TARGET_DEPTH||n.h<0)return false;b=n;}return false;}
assert(delivery(initial()),'Centered default throw lands');
assert(!delivery(initial(3)),'Sideways aim misses');
assert(!delivery(initial(0,25)),'Short throw misses');
assert(!delivery(initial(0,100)),'Overpowered throw misses the opening height');
assert(caughtForward({x:0,z:5,h:.75},{x:0,z:7,h:.75},bear,bear),'Swept depth prevents tunneling');
assert(!caughtForward({x:0,z:7,h:.75},{x:0,z:8,h:.75},bear,bear),'No second catch beyond target');
assert(caughtForward({x:0,z:5,h:.75},{x:0,z:7,h:.75},{...bear,x:-1},{...bear,x:1}),'Moving target interpolated');
for(const [W,H] of [[900,540],[520,1125],[900,416]]){const near=projectForward(initial(),W,H),far=projectForward(bear,W,H);assert.equal(near.x,W/2);assert.equal(far.x,W/2);assert(far.y<near.y);assert(far.scale<near.scale);assert(far.y>100&&far.y<H,'Target visible in portrait and landscape');}
for(const level of [1,2])for(const phase of [0,1,2,3,4]){const target=t=>({z:6,x:level===1?Math.sin(t*.85)*1.5:0,h:.75+(level===2?Math.max(0,Math.sin(t*1.45))*.65:0)});let reachable=false;for(let power=35;power<=95&&!reachable;power+=2)for(let aim=-3;aim<=3&&!reachable;aim+=.15)reachable=delivery(initial(aim,power),target,phase);assert(reachable,`Level ${level+1} reachable at phase ${phase}`);}
console.log('Forward throws: depth, projection, catches, misses and moving targets passed.');
