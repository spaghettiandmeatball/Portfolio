import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createCharacter } from './chonkimals/player.js';
import { SpeechBubbles } from './chonkimals/speech-bubbles.js';

const messages = [
  ['The site is looking great. Can’t wait for you to see it.', 'My feedback was “more frogs.” He’s considering it.', 'He brings ideas to life. I bring absolutely no deadlines.', 'This is my first networking event. Am I doing it right?', 'I’ve reviewed the work. Five hops out of five.'],
  ['I’m one of the references on his résumé.', 'His greatest strength? Excellent taste in bears.', 'I can confirm: he works well with otters.', 'I asked about the benefits. Apparently, I am the benefit.', 'Available for reference checks. Unavailable during naps.'],
  ['He’s building the portfolio. I’m building morale.', 'I’m the senior vice president of being a little guy.', 'We’re in the final stages of looking busy.', 'He understood the assignment. I ate the assignment.', 'You look like someone with excellent hiring instincts.']
];
let speech;
const counts = [0,0,0];
const hoverMessages = [
  ['Oh! A networking opportunity.', 'This is my elevator pitch. Mostly the elevator part.'],
  ['Quick. Look employable.', 'Is this the interview? I wore my good fur.'],
  ['Just circling back!', 'A quick 360 review.']
];
const hoverCounts = [0,0,0];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let characters = [];
let active = 0;
let elapsed = 0;
const motionButton = document.querySelector('#motion');
function updateMotion(){ motionButton.innerHTML = `${paused ? 'Resume' : 'Pause'} motion <span aria-hidden="true">${paused ? '▷' : 'Ⅱ'}</span>`; motionButton.setAttribute('aria-pressed',String(paused)); }
updateMotion();
motionButton.addEventListener('click',()=>{paused=!paused;updateMotion();});
reduced.addEventListener('change',e=>{paused=e.matches;updateMotion();});
function speak(index, announce = false, special = null){
  if(!special)counts[index]=(counts[index]+1)%messages[index].length;
  const line=special || messages[index][counts[index]];
  if(speech){if(innerWidth<760)speech.bubbles.forEach(b=>{b.age=10;});speech.show(String(index),line);}
  if(characters[index]) characters[index].hopTime = 0;
  if(announce)document.querySelector('#announcement').textContent=line;
}
function react(index,announce=false){
  const c=characters[index];if(!c)return;
  const now=performance.now();if(now-c.lastReaction<2400)return;
  c.lastReaction=now;c.reaction=0;active=index;
  const lines=hoverMessages[index];
  speak(index,announce,lines[hoverCounts[index]++%lines.length]);
}
document.querySelectorAll('[data-character]').forEach(button=>button.addEventListener('click',()=>react(Number(button.dataset.character),true)));
setInterval(()=>{if(paused||document.hidden||!characters.length)return;active=(active+1)%3;speak(active);},5200);

async function init(){
  const host=document.querySelector('#stage');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(29,1,.1,60);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0xf7f3e9,0);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;
  host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xfffcf0,0xc2b4a3,2.7));
  const sun=new THREE.DirectionalLight(0xfff3dc,3.6);sun.position.set(-3,7,6);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7});sun.shadow.bias=-.0005;sun.shadow.normalBias=.04;sun.shadow.radius=5;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xddeaff,1.5);fill.position.set(4,3,-2);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.14}));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;floor.receiveShadow=true;scene.add(floor);
  const loader=new GLTFLoader();
  speech=new SpeechBubbles(document.querySelector('.playground'));
  characters=await Promise.all(['frog','bear','dog'].map(async(name,index)=>{
    const gltf=await loader.loadAsync(`./assets/${name}.glb`);
    // Same root-motion cleanup and animation controller used by the game.
    for(const clip of gltf.animations)for(const track of clip.tracks){if(!track.name.endsWith('.position'))continue;const v=track.values;const [x,y,z]=v;for(let j=0;j<v.length;j+=3){v[j]=x;v[j+1]=y;v[j+2]=z;}}
    const actor=createCharacter(gltf,{lod:false});
    const factor=2.4/actor.height;
    actor.root.scale.setScalar(factor); actor.update(1, 'idle'); actor.root.updateMatrixWorld(true); actor.root.position.y -= new THREE.Box3().setFromObject(actor.root, true).min.y;
    const root=new THREE.Group();root.add(actor.root);root.position.x=(index-1)*2.8;root.rotation.y=[.12,-.08,-.12][index];scene.add(root);
    return {root,actor,hopTime:1.3+index*.6,hasJump:gltf.animations.some(c=>c.name==='jumping_up'),reaction:2,lastReaction:-Infinity,baseYaw:root.rotation.y};
  }));
  document.querySelector('#loading').hidden=true;
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;const mobile=w<760;const distance=mobile?17.2:10.6;camera.position.set(0,3.0,distance);camera.lookAt(0,1.7,0);camera.updateProjectionMatrix();characters.forEach((c,i)=>{c.root.position.x=(i-1)*(mobile?1.95:3.5);});}
  new ResizeObserver(resize).observe(host);resize();
  if(host.clientWidth<760)speech.show('1',messages[1][0]);else characters.forEach((c,i)=>speech.show(String(i),messages[i][0]));
  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
  function hit(event){const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return characters.findIndex(c=>raycaster.intersectObject(c.root,true).length>0);}
  let hovered=-1;
  renderer.domElement.addEventListener('pointermove',event=>{
    const i=hit(event);renderer.domElement.style.cursor=i>=0?'pointer':'default';
    if(event.pointerType!=='touch'&&i>=0&&i!==hovered)react(i);
    hovered=i;
  });
  renderer.domElement.addEventListener('pointerleave',()=>{hovered=-1;renderer.domElement.style.cursor='default';});
  renderer.domElement.addEventListener('click',event=>{const i=hit(event);if(i>=0)react(i,true);});
  const clock=new THREE.Clock();
  renderer.setAnimationLoop(()=>{
    const dt=Math.min(clock.getDelta(),.04);
    if(document.hidden)return;
    if(!paused){elapsed+=dt;characters.forEach((c,i)=>{
      c.hopTime+=dt;if(c.hopTime>3.4+i*.35)c.hopTime=0;
      const t=c.hopTime;const airborne=t<.85;
      c.root.position.y=airborne?Math.sin(t/.85*Math.PI)*.48:0;
      c.root.rotation.y=c.baseYaw;c.root.rotation.z=0;
      c.reaction=Math.min(2,c.reaction+dt);
      if(c.reaction<1.2){
        const p=c.reaction/1.2, envelope=Math.sin(p*Math.PI);
        if(i===0)c.root.position.y=Math.abs(Math.sin(p*Math.PI*2))*.8;
        if(i===1)c.root.rotation.z=Math.sin(p*Math.PI*6)*.2*envelope;
        if(i===2)c.root.rotation.y=c.baseYaw+Math.PI*2*(p*p*(3-2*p));
      }
      const state=!c.hasJump?'idle':t<.4?'jumping_up':t<.85?'falling_idle':t<1.1?'hard_landing':'idle';c.actor.update(dt,state);
    });}
    scene.updateMatrixWorld(true);
    speech.update(paused?0:dt,camera,(key,out)=>{const c=characters[Number(key)];if(!c)return false;out.set(c.root.position.x,c.root.position.y+2.5,0);return true;},()=>1);
    renderer.render(scene,camera);
  });
}
init().catch(error=>{console.error(error);document.querySelector('#loading').textContent='Our little friends are taking a breather. Their references are still excellent.';});




