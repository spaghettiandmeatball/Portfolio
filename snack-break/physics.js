export const TARGET_DEPTH = 6;
export function advanceForward(ball,dt){return {...ball,x:ball.x+ball.vx*dt,z:ball.z+ball.vz*dt,h:ball.h+ball.vh*dt-2.5*dt*dt,vh:ball.vh-5*dt,age:ball.age+dt};}
export function projectForward(ball,W,H){const scale=1/(1+Math.max(0,ball.z)*.22),horizon=H*.38;return {x:W/2+ball.x*100*scale,y:horizon+(H-25-horizon)*scale-ball.h*100*scale,scale};}
export function caughtForward(before,after,targetBefore,targetAfter){
 const error=crossingError(before,after,targetBefore,targetAfter);
 return !!error&&Math.abs(error.x)<=(targetAfter.radiusX??.85)&&Math.abs(error.h)<=(targetAfter.radiusH??.42);
}
export function crossingError(before,after,targetBefore,targetAfter){
 const depth=targetAfter.z??TARGET_DEPTH;
 if(before.z>depth||after.z<depth||after.z<=before.z)return null;
 const t=(depth-before.z)/(after.z-before.z);
 const x=before.x+(after.x-before.x)*t,h=before.h+(after.h-before.h)*t;
 const tx=targetBefore.x+(targetAfter.x-targetBefore.x)*t,th=targetBefore.h+(targetAfter.h-targetBefore.h)*t;
 return {x:x-tx,h:h-th};
}
