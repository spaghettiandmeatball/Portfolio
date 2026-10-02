import assert from 'node:assert/strict';
import {newRun,reward,miss,tick,wave} from './arcade.js';
let run=newRun();tick(run,20);assert.equal(run.remaining,90,'Aiming before first throw is untimed');run.active=true;
assert.equal(reward(run,{perfect:true,ring:true}),275);reward(run);reward(run);assert.equal(wave(run),2);assert.equal(reward(run),200,'Four catches unlock 2x');
miss(run);assert.equal(run.streak,0);assert.equal(run.lives,4);assert.equal(reward(run),100,'Miss resets multiplier');
tick(run,91);assert(run.finished);const points=run.points;reward(run);assert.equal(run.points,points,'No scoring after run finishes');
run=newRun();for(let i=0;i<5;i++)miss(run);assert(run.finished);assert.equal(run.lives,0);
run=newRun();for(let i=0;i<20;i++)reward(run);assert.equal(reward(run),400,'Multiplier capped at 4x');assert.equal(run.bestStreak,21);
console.log('Arcade checks passed: scores, combos, waves, lives, timer and end states.');

