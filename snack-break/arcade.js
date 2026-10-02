export function newRun(){return {points:0,hits:0,perfects:0,rings:0,banks:0,streak:0,bestStreak:0,lives:5,remaining:90,active:false,finished:false};}
export function wave(run){return 1+Math.floor(run.hits/3);}
export function reward(run,{perfect=false,ring=false,bank=false}={}){
 if(run.finished)return 0;
 run.hits++;run.streak++;run.bestStreak=Math.max(run.bestStreak,run.streak);
 if(perfect)run.perfects++;if(ring)run.rings++;if(bank)run.banks++;
 const multiplier=Math.min(4,1+Math.floor((run.streak-1)/3));
 const points=(100+(perfect?75:0)+(ring?100:0)+(bank?200:0))*multiplier;
 run.points+=points;return points;
}
export function miss(run){if(run.finished)return;run.streak=0;run.lives--;if(run.lives<=0)run.finished=true;}
export function tick(run,dt){if(!run.active||run.finished)return;run.remaining=Math.max(0,run.remaining-dt);if(run.remaining===0)run.finished=true;}
