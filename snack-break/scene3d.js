import * as THREE from 'three';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {createCharacter} from '../chonkimals/player.js';
import {gap,umbrellaAngle,logPosition} from './courses.js';

export function createPicnic(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#cadfd2');scene.fog=new THREE.Fog('#cadfd2',19,43);
 // Looking along +Z reverses camera-right; keep physics +X on screen-right.
 scene.scale.x=-1;
 let catchAge=99,catchPerfect=false,catchBank=false,impactAge=99,impactPoint=null;const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;const cameraBase=new THREE.Vector3();
 const camera=new THREE.PerspectiveCamera(45,1,.1,60),projected=new THREE.Vector3();
 scene.add(new THREE.HemisphereLight('#fff6d9','#758b5d',2.1));
 const sun=new THREE.DirectionalLight('#fff0cb',3);sun.position.set(-5,10,-4);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-6;sun.shadow.normalBias=.04;scene.add(sun);
 const material=(color)=>new THREE.MeshStandardMaterial({color,roughness:.85});
 const grass=material('#9ab877'),wood=material('#bb8b54'),darkWood=material('#806143'),gold=material('#f3be52');
 function mesh(geometry,mat,x,y,z,parent=scene){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function block(x,y,z,w,h,d,mat,parent){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);}
 const ground=mesh(new THREE.PlaneGeometry(80,80),grass,0,-.025,5);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 const lane=mesh(new THREE.PlaneGeometry(7.7,12),material('#d7c495'),0,.003,4);lane.rotation.x=-Math.PI/2;lane.castShadow=false;
 const blanket=new THREE.Group();scene.add(blanket);for(let x=0;x<8;x++)for(let z=0;z<4;z++){const tile=mesh(new THREE.PlaneGeometry(.48,.48),material((x+z)%2?'#e1b084':'#f3d7a9'),(x-3.5)*.48,.018,(z-1.5)*.48-1,blanket);tile.rotation.x=-Math.PI/2;tile.castShadow=false;}
 // Low-poly grove, fences and flowers keep the play lane readable.
 const leafMats=['#668d57','#739d63','#8bac69'].map(material);
 for(let i=0;i<22;i++){const side=i%2?1:-1,x=side*(5+(i%3)*1.4),z=-1+Math.floor(i/2)*2.4;mesh(new THREE.CylinderGeometry(.18,.28,3.6,7),wood,x,1.8,z);for(let j=0;j<3;j++){const crown=mesh(new THREE.SphereGeometry(1.4-j*.12,7,5),leafMats[(i+j)%3],x+(j-1)*.55,3.8+j*.5,z);crown.scale.y=1.05;} }
 for(const side of [-1,1]){for(let z=0;z<12;z+=2)block(side*4.1,.55,z,.12,1.1,.12,wood);for(const h of [.35,.75])block(side*4.1,h,5.5,.1,.1,11,wood);}
 for(let i=0;i<38;i++){const x=(i%2?1:-1)*(4.45+(i%5)*.35),z=(i*1.73)%15;mesh(new THREE.CylinderGeometry(.012,.018,.22,4),leafMats[0],x,.11,z);mesh(new THREE.SphereGeometry(.055,5,4),material(i%3?'#fff1bb':'#e3ac7c'),x,.24,z);}
 const boardGroup=new THREE.Group();scene.add(boardGroup);block(1.54,1.25,3.45,.09,2.5,3.9,wood,boardGroup);for(const h of [.1,.7,1.3,1.9,2.5])block(1.47,h,3.45,.03,.04,3.9,darkWood,boardGroup);
 const stumpGroup=new THREE.Group();scene.add(stumpGroup);
 mesh(new THREE.CylinderGeometry(.65,.7,1.8,10),darkWood,0,.9,4,stumpGroup);mesh(new THREE.CylinderGeometry(.66,.66,.035,16),wood,0,1.81,4,stumpGroup);
boardGroup.children.forEach(m=>{m.position.x-=1.5;m.position.z-=3.45;});boardGroup.position.set(1.5,0,3.45);
 const umbrella=new THREE.Group();scene.add(umbrella);umbrella.position.set(.55,1.35,3);
 mesh(new THREE.SphereGeometry(.16,12,8),wood,0,0,0,umbrella);
 for(let i=0;i<6;i++){const panel=mesh(new THREE.SphereGeometry(1.35,12,8,i*Math.PI/3,Math.PI/3,0,Math.PI/2),material(i%2?'#f6ddb0':'#dc9779'),0,0,0,umbrella);panel.scale.z=.18;}const umbrellaStand=block(.55,.65,3.22,.05,1.3,.05,wood);const foot=mesh(new THREE.CylinderGeometry(.28,.28,.08,12),wood,.55,.04,3.22);
 for(const side of [-1,1]){block(side*.65,0,-.23,1.1,.045,.03,wood,umbrella);mesh(new THREE.SphereGeometry(.075,8,6),gold,side*1.23,0,0,umbrella);}
 const rollingLog=new THREE.Group();scene.add(rollingLog);const timber=mesh(new THREE.CylinderGeometry(.4,.4,1.7,12),wood,0,0,0,rollingLog);timber.rotation.z=Math.PI/2;for(const side of [-1,1]){const end=mesh(new THREE.CylinderGeometry(.405,.405,.04,12),darkWood,side*.86,0,0,rollingLog);end.rotation.z=Math.PI/2;}
 const mushroom=new THREE.Group();scene.add(mushroom);mushroom.position.set(0,0,2);mesh(new THREE.CylinderGeometry(.19,.25,.8,10),material('#fff0d5'),0,.4,0,mushroom);const cap=mesh(new THREE.SphereGeometry(.68,16,8,0,Math.PI*2,0,Math.PI/2),material('#d9826b'),0,.9,0,mushroom);cap.scale.y=.5;for(let i=0;i<7;i++){const a=i*2.4,r=.15+(i%2)*.3;const spot=mesh(new THREE.SphereGeometry(.075,8,6),material('#fff0d5'),Math.cos(a)*r,.92+Math.sqrt(.68*.68-r*r)*.5,Math.sin(a)*r,mushroom);spot.scale.y=.3;}
 const ramp=new THREE.Group();scene.add(ramp);ramp.position.set(0,0,2);const slope=block(0,.62,-.15,1.3,.12,1.9,wood,ramp);slope.rotation.x=-.6;for(const side of [-1,1]){const rail=block(side*.65,.75,-.15,.06,.08,1.9,darkWood,ramp);rail.rotation.x=-.6;}block(0,.5,.6,1.2,1,.15,darkWood,ramp);
const perch=new THREE.Group();scene.add(perch);block(.4,0,7.2,2.8,.14,2.9,wood,perch);const perchLegs=[];for(const x of [-.75,1.55])for(const z of [6,8.5])perchLegs.push(block(x,0,z,.12,1,.12,darkWood,perch));
 const gateGroup=new THREE.Group();scene.add(gateGroup);const gateParts=Array.from({length:4},()=>block(0,0,3,1,1,.18,leafMats[0],gateGroup));
 const hoop=mesh(new THREE.TorusGeometry(.38,.035,8,32),gold,0,1.35,3);hoop.material.emissive=new THREE.Color('#a46a13');hoop.material.emissiveIntensity=.25;
 // Woven wicker and a gingham lining, built locally without extra asset downloads.
 const weaveCanvas=document.createElement('canvas');weaveCanvas.width=weaveCanvas.height=128;const weave=weaveCanvas.getContext('2d');weave.fillStyle='#a8753e';weave.fillRect(0,0,128,128);
 for(let y=0;y<128;y+=16)for(let x=0;x<128;x+=16){const over=(x/16+y/16)%2;weave.fillStyle=over?'#d4a765':'#bf8c4f';weave.fillRect(x+1,y+1,14,14);weave.fillStyle='#e2ba7b';weave.fillRect(x+2,y+2,over?3:12,over?12:3);weave.fillStyle='#916135';weave.fillRect(x+2,y+13,12,2);}
 const wickerTexture=new THREE.CanvasTexture(weaveCanvas);wickerTexture.colorSpace=THREE.SRGBColorSpace;wickerTexture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const wicker=new THREE.MeshStandardMaterial({map:wickerTexture,roughness:.95});
 const clothCanvas=document.createElement('canvas');clothCanvas.width=clothCanvas.height=128;const cloth=clothCanvas.getContext('2d');for(let y=0;y<8;y++)for(let x=0;x<8;x++){cloth.fillStyle=x%2&&y%2?'#ba6652':(x+y)%2?'#dfaa98':'#fff0d5';cloth.fillRect(x*16,y*16,16,16);}
 const clothTexture=new THREE.CanvasTexture(clothCanvas);clothTexture.colorSpace=THREE.SRGBColorSpace;const gingham=new THREE.MeshStandardMaterial({map:clothTexture,roughness:1,side:THREE.DoubleSide});
 const boxGroup=new THREE.Group();scene.add(boxGroup);
 block(0,-.5,0,1.06,.08,.65,wicker,boxGroup);
 for(const side of [-1,1]){const front=block(0,-.25,side*.355,1.18,.5,.055,wicker,boxGroup);front.rotation.x=side*.12;const end=block(side*.56,-.25,0,.055,.5,.66,wicker,boxGroup);end.rotation.z=-side*.12;}
 // A dark recess leaves the catch opening clear and easy to read.
 const inside=mesh(new THREE.PlaneGeometry(1.02,.58),gingham,0,-.44,0,boxGroup);inside.rotation.x=-Math.PI/2;
 for(const side of [-1,1]){block(0,.005,side*.375,1.23,.07,.07,wood,boxGroup);block(side*.59,.005,0,.07,.07,.75,wood,boxGroup);}
 const napkin=mesh(new THREE.PlaneGeometry(.58,.34),gingham,-.14,-.13,-.405,boxGroup);napkin.rotation.x=-.12;
 const handle=mesh(new THREE.TorusGeometry(.59,.038,8,32,Math.PI),wood,0,.02,.45,boxGroup);handle.scale.y=1.15;
 for(const side of [-1,1])mesh(new THREE.SphereGeometry(.06,8,6),darkWood,side*.59,.02,.45,boxGroup);
 const lidPivot=new THREE.Group();lidPivot.position.set(0,.025,.375);boxGroup.add(lidPivot);block(0,.03,-.375,1.2,.075,.75,wicker,lidPivot);
 const lidLining=mesh(new THREE.PlaneGeometry(1.08,.63),gingham,0,-.01,-.375,lidPivot);lidLining.rotation.x=Math.PI/2;
 for(const side of [-1,1])block(side*.58,.025,-.375,.035,.09,.75,wood,lidPivot);block(0,.025,-.74,1.2,.09,.035,wood,lidPivot);
 block(0,.075,-.7,.11,.035,.09,darkWood,lidPivot);lidPivot.rotation.x=1.45;
 // A real tumbling snack, with chocolate chips on both sides.
 const cookie=new THREE.Group();scene.add(cookie);const biscuit=mesh(new THREE.CylinderGeometry(.32,.32,.11,24),material('#dfac68'),0,0,0,cookie);biscuit.rotation.x=Math.PI/2;
 for(const side of [-1,1])for(let i=0;i<8;i++){const angle=i*2.4,r=.08+(i%3)*.07;const chip=mesh(new THREE.SphereGeometry(.032,6,4),material('#6c4734'),Math.cos(angle)*r,Math.sin(angle)*r,side*.065,cookie);chip.scale.z=.45;}
 const dots=Array.from({length:28},()=>mesh(new THREE.SphereGeometry(.03,6,4),new THREE.MeshBasicMaterial({color:'#fff2be',transparent:true,opacity:.65}),0,0,0));
 const trail=Array.from({length:7},()=>mesh(new THREE.SphereGeometry(.1,6,4),new THREE.MeshBasicMaterial({color:'#e6b66d',transparent:true,opacity:.2}),0,0,0));
 const crumbs=Array.from({length:28},()=>mesh(new THREE.BoxGeometry(.045,.045,.045),gold,0,0,0));
const missedCookies=Array.from({length:3},()=>{const c=cookie.clone();scene.add(c);return c;});
 const antTeams=Array.from({length:3},()=>{const group=new THREE.Group();scene.add(group);for(let i=0;i<6;i++){const ant=new THREE.Group();group.add(ant);for(let j=0;j<3;j++)mesh(new THREE.SphereGeometry(j===0?.03:.025,5,4),darkWood,0,.03,(j-1)*.045,ant);for(const side of [-1,1])for(let j=0;j<3;j++){const leg=block(side*.035,.015,(j-1)*.035,.065,.012,.014,darkWood,ant);leg.rotation.z=side*.3;}}return group;});
 const sparks=Array.from({length:12},()=>mesh(new THREE.SphereGeometry(.035,6,4),new THREE.MeshBasicMaterial({color:'#ffe4a5'}),0,0,0));
 const actors=[];const loader=new GLTFLoader();
 const ready=Promise.all(['bear','dog','frog'].map(async (name,i)=>{
  const gltf=await loader.loadAsync('../assets/optimized/'+name+'.glb');const actor=createCharacter(gltf,{lod:false});actor.celebrate=gltf.animations.find(clip=>/jump|happy|dance|wave|cheer/i.test(clip.name))?.name||'idle';actor.root.scale.setScalar(2.35/actor.height);actor.root.rotation.y=Math.PI;actor.update(1,'idle');actor.root.updateMatrixWorld(true);const actorBounds=new THREE.Box3().setFromObject(actor.root,true);actor.groundOffset=-actorBounds.min.y;actor.basketSetback=7.05-actorBounds.min.z;actor.root.traverse(m=>{if(m.isBone&&/head$/i.test(m.name)&&!actor.head)actor.head=m;if(m.isBone&&/jaw/i.test(m.name)&&!actor.jaw)actor.jaw=m;if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});actor.headBase=actor.head?.rotation.clone();actor.jawBase=actor.jaw?.rotation.clone();scene.add(actor.root);actors[i]=actor;return actor;
 }));
 function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;const portrait=camera.aspect<.85;camera.fov=portrait?48:45;camera.position.set(0,portrait?5.2:4,portrait?-10:-6);cameraBase.copy(camera.position);camera.lookAt(0,portrait?2.3:1.3,4.8);camera.updateProjectionMatrix();camera.updateMatrixWorld();}
 function project(p,W,H){projected.set(-p.x,p.h,p.z).project(camera);return {x:(projected.x+1)*W/2,y:(1-projected.y)*H/2,scale:1/(1+Math.max(0,p.z)*.22)};}
 function render(state){
  const {level,time,target,ring,ball,pulse,aim,pull,trajectory,history,dt,perfect,lostSnacks=[],showSnack}=state;catchAge+=dt;impactAge+=dt;
  boardGroup.visible=stumpGroup.visible=level===1;gateGroup.visible=level===2;
  const flex=impactPoint?.type==='board'&&impactAge<.45?Math.sin(impactAge*38)*Math.exp(-impactAge*9):0;boardGroup.rotation.y=flex*.05;
  umbrella.visible=umbrellaStand.visible=foot.visible=level===3;umbrella.rotation.z=umbrellaAngle(time);
  rollingLog.visible=level===4;rollingLog.position.set(logPosition(time),.4,3);rollingLog.rotation.x=-logPosition(time)/.4;
  mushroom.visible=level===5;const bounce=impactPoint?.type==='mushroom'&&impactAge<.5?Math.sin(impactAge*17)*Math.exp(-impactAge*5):0;mushroom.scale.set(1+bounce*.15,1-bounce*.22,1+bounce*.15);
  ramp.visible=level===6;perch.visible=level===5||level===6;const elevation=target.h-.75;perch.children[0].position.set(target.x+.4,elevation-.07,7.2);perchLegs.forEach((leg,i)=>{leg.position.x=target.x+(i<2?-.75:1.55);leg.position.y=elevation/2;leg.scale.y=elevation;});
  if(level===2){const g=gap(time),left=g.x-.6,right=g.x+.6;const areas=[[-3,left,0,2.5],[right,3,0,2.5],[left,right,0,.87],[left,right,1.83,2.5]];areas.forEach(([x0,x1,h0,h1],i)=>{gateParts[i].position.set((x0+x1)/2,(h0+h1)/2,3);gateParts[i].scale.set(x1-x0,h1-h0,1);});}
  actors.forEach((actor,i)=>{if(!actor)return;actor.root.visible=i===level%3;if(i===level%3){actor.root.position.set(target.x+.95,actor.groundOffset+Math.max(0,target.h-.75),actor.basketSetback);actor.root.rotation.y=Math.PI+Math.sin(time*1.4)*.035;actor.root.scale.setScalar((2.35/actor.height)*(1+pulse*.045));actor.update(dt,pulse>.3?actor.celebrate:'idle');
   const munch=catchAge>.12&&catchAge<.85?Math.sin(catchAge*35)*.08:0;
   if(actor.head){actor.head.rotation.copy(actor.headBase);actor.head.rotation.x+=munch+(aim?-.07:0);actor.head.rotation.y+=aim?Math.max(-.18,Math.min(.18,(pull?.x||0)*.2)):0;}
   if(actor.jaw){actor.jaw.rotation.copy(actor.jawBase);actor.jaw.rotation.x+=Math.abs(munch)*2;}
   actor.root.scale.y*=1+Math.abs(munch)*.4;}});
  const close=catchAge<.09?1-catchAge/.09:catchAge<.24?0:catchAge<.65?(catchAge-.24)/.41:1;lidPivot.rotation.x=close*1.45;
  boxGroup.position.set(target.x,target.h,6);boxGroup.scale.setScalar(1+pulse*.05);hoop.position.set(ring.x,ring.h,ring.z);hoop.rotation.z=Math.sin(time)*.06;hoop.material.emissiveIntensity=ball?.golden?.8:.2;
  cookie.visible=!!ball||showSnack;cookie.position.set(ball?.x??(pull?.x??0),ball?.h??(pull?.h??.7),ball?.z??(pull?.z??0));cookie.rotation.set(ball?Math.sin(ball.rotation)*.6:-.1,ball?ball.rotation*.7:0,ball?ball.rotation:Math.sin(time*2)*.04);
  dots.forEach((dot,i)=>{dot.visible=!!aim&&!!trajectory[i];if(dot.visible){const p=trajectory[i];dot.position.set(p.x,p.h,p.z);}});
  trail.forEach((m,i)=>{m.visible=!!ball&&!!history[i];if(m.visible){const p=history[i];m.position.set(p.x,p.h,p.z);m.material.opacity=i/history.length*.2;}});
  crumbs.forEach((m,i)=>{m.visible=pulse>0&&i<(catchPerfect?28:18);if(m.visible){const age=1-pulse,angle=i*2.4;m.position.set(target.x+Math.cos(angle)*age*.8,target.h+.65+Math.sin(age*Math.PI)*(catchPerfect?1:.65),(6+Math.sin(angle)*age*.7));m.rotation.set(age*i,age*i,0);m.scale.setScalar(pulse);}});
  missedCookies.forEach((m,i)=>{const p=lostSnacks[i];m.visible=!!p;if(p){m.position.set(p.x,p.h+(p.life>2.4?.03:0),p.z);m.rotation.set(p.settled?Math.PI/2:p.rotation*.4,p.rotation*.3,p.settled?0:p.rotation);m.scale.setScalar(Math.min(1,(6-p.life)*2));}});
  antTeams.forEach((team,i)=>{const p=lostSnacks[i];team.visible=!!p?.settled&&p.life>1.2;if(team.visible){const approach=Math.max(0,2.4-p.life)*.8;team.position.set(p.x+approach,0,p.z);team.children.forEach((ant,j)=>{ant.position.set((j%2-.5)*.14,.012+Math.sin(time*28+j)*.008,(Math.floor(j/2)-1)*.13);ant.rotation.y=Math.PI/2;});}});
  sparks.forEach((m,i)=>{m.visible=!!impactPoint&&impactAge<.35;if(m.visible){const a=i*2.4,r=impactAge*(1+i%3);m.position.set(impactPoint.x+Math.cos(a)*r,impactPoint.h+Math.sin(a)*r,impactPoint.z-r*.4);m.scale.setScalar(1-impactAge/.35);}});
  camera.position.copy(cameraBase);if(!reduceMotion&&catchAge<.35){const strength=(catchPerfect?.065:.035)*(catchBank?1.2:1);camera.position.y+=Math.sin(catchAge*38)*Math.exp(-catchAge*10)*strength;}camera.updateMatrixWorld();
  renderer.render(scene,camera);
 }
 resize();return {resize,project,render,ready,catchSnack({perfect,bank}){catchAge=0;catchPerfect=perfect;catchBank=bank;},impact(point){impactPoint=point;impactAge=0;}};
}
