export function scenery(ctx,W,H,t){
 const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#b8dbce');sky.addColorStop(.55,'#edf0b8');sky.addColorStop(1,'#84ab6c');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 const sun=ctx.createRadialGradient(W*.62,H*.22,0,W*.62,H*.22,W*.6);sun.addColorStop(0,'#fffbdc99');sun.addColorStop(1,'#fffbdc00');ctx.fillStyle=sun;ctx.fillRect(0,0,W,H);
 function oval(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill();}
 for(let i=0;i<9;i++){const x=(i*137+37)%W;ctx.fillStyle='#a9c798';ctx.beginPath();ctx.roundRect(x,H*.39,18,H*.45,9);ctx.fill();oval(x+9,H*.38,62,90,'#b5d1a1');oval(x+30,H*.35,52,68,'#c1d9a9');}
 oval(W*.18,H*.88,W*.8,H*.29,'#a6c388');oval(W*.85,H*.98,W*.85,H*.30,'#8daf76');ctx.fillStyle='#86a36b';ctx.fillRect(0,H-121,W,121);
 ctx.save();ctx.translate(W*.54,H-73);ctx.transform(1,0,-.25,.4,0,0);ctx.fillStyle='#f2d3a0';ctx.beginPath();ctx.roundRect(-W*.31,-65,W*.63,180,15);ctx.fill();ctx.save();ctx.clip();for(let i=-8;i<9;i++){ctx.fillStyle='#d8937455';ctx.fillRect(i*50,-65,24,180);ctx.fillRect(-W*.31,i*50,W*.63,24);}ctx.restore();ctx.restore();
 for(const side of [-1,1]){const x=side===-1?-15:W+15;ctx.fillStyle='#617b4f';ctx.beginPath();ctx.moveTo(x+side*18,H);ctx.quadraticCurveTo(x-side*65,H*.3,x-side*15,-30);ctx.lineTo(x+side*48,-30);ctx.lineTo(x+side*70,H);ctx.fill();for(let i=0;i<5;i++){oval(x-side*(20+i*25),-8+i*16,90-i*7,55,'#426b48');oval(x-side*(55+i*24),5+i*20,65-i*4,38,'#608552');}}
 for(let i=0;i<24;i++){const x=(i*167+55)%W,y=H-20-(i*43)%84;if(x>W*.11&&x<W*.85)continue;ctx.strokeStyle='#587e4d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+8);ctx.lineTo(x-4,y-4);ctx.moveTo(x,y+8);ctx.lineTo(x+4,y);ctx.stroke();if(i%3===0){oval(x-3,y-4,4,3,'#f6e5a5');oval(x+3,y-4,4,3,'#f6e5a5');oval(x,y-7,3,4,'#f6e5a5');oval(x,y-3,2,2,'#c89b50');}}
 for(let i=0;i<7;i++){const x=(i*173+50)%W,y=H*.3+Math.sin(t*.6+i*2)*30+i*8;oval(x,y,2,2,'#fff5c890');}
}
