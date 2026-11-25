'use strict';
const $=s=>document.querySelector(s);
const el={root:$('.experience'),journey:$('.journey'),view:$('.viewport'),scene:$('.space-scene'),hole:$('.hole'),astro:$('.astronaut'),hero:$('.hero-copy'),chapter:$('.chapter'),satellite:$('.satellite'),glint:$('.satellite-glint'),sky:$('.destination-sky'),arrival:$('.arrival'),footer:$('.arrival-footer'),progress:$('.progress-fill'),distance:$('.distance'),number:$('.distance strong'),note:$('.scroll-note'),noteText:$('.scroll-note span'),motion:$('.motion-button')};
const media=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const smoother=t=>t*t*t*(t*(t*6-15)+10);
let paused=false,frozen=0,position=0,target=0,frame=0,last=0,layout={};
$('.starfield').innerHTML=Array.from({length:68},(_,i)=>`<i class="star" style="left:${(i*61.803)%100}%;top:${(i*i*13.731)%100}%;width:${i%11===0?2:1}px;height:${i%11===0?2:1}px;opacity:${.15+(i%7)*.1}"></i>`).join('');
function measure(){
 const w=el.view.clientWidth,h=el.view.clientHeight,mobile=w<=900;
 layout={w,h,mobile,range:Math.max(1,el.journey.offsetHeight-h),hw:mobile?w*1.7:Math.min(w*1.04,h*1.65),aw:mobile?Math.min(w*.30,190):Math.min(w*.15,210),sw:mobile?w*1.2:w*.62};
 el.hole.style.width=layout.hw+'px';el.astro.style.width=layout.aw+'px';el.satellite.style.width=layout.sw+'px';
 target=clamp(scrollY/layout.range);requestTick();
}
function visibility(node,opacity,transform='none'){
 node.style.opacity=opacity;node.style.transform=transform;
 const hidden=opacity<.15;node.inert=hidden;node.setAttribute('aria-hidden',String(hidden));
}
// One continuous flight. Scroll controls the camera; a short, time-based
// follower removes wheel/trackpad stepping without hijacking native scrolling.
function flight(p){
 const t=clamp((p-.56)/.36),pan=smoother(t);
 return {t,pan,cross:smoother(clamp((t-.06)/.84)),reveal:smooth(.55,.96,t)};
}
function draw(p){
 const {w,h,mobile,hw,aw,sw}=layout,quiet=paused||media.matches;
 const q=quiet?frozen:clamp(p/.62),ease=1-Math.exp(-2.3*q),scale=1-.36*ease;
 const cx=mobile?w*.83:w*.82,cy=mobile?h*.93:h*.66,angle=(mobile?-115:-138)*Math.PI/180;
 const gap=(mobile?w*.1:w*.04)*Math.exp(-3.5*q)+hw*.025,r=hw*.245+aw*scale*.62+gap;
 el.hole.style.transform=`translate3d(${cx-hw/2}px,${cy-hw/3}px,0)`;
 el.astro.style.transform=`translate3d(${cx+Math.cos(angle)*r-aw/2}px,${cy+Math.sin(angle)*r-aw/2}px,0) rotate(${-8+7*ease}deg) scale(${scale})`;
 const first=1-smooth(.12,.28,p),middle=smooth(.25,.39,p)*(1-smooth(.51,.63,p));
 visibility(el.hero,first,`translate3d(0,${quiet?0:-18*(1-first)}px,0)`);
 visibility(el.chapter,middle,`translate3d(0,${quiet?0:16*(1-middle)}px,0)`);
 const f=flight(p);
 if(quiet){
  el.scene.style.transform='none';el.scene.style.opacity=1-smooth(.62,.85,p);el.satellite.style.opacity='0';el.glint.style.opacity='0';el.sky.style.transform='none';
  visibility(el.arrival,smooth(.73,.9,p));
 }else{
  // The object approaches in depth before it passes. Perspective, scale,
  // roll and the camera pan share one continuous timeline with zero-end velocities.
  const x=w*(1.20-2.0*f.cross),y=h*(.16+.52*f.cross),zScale=.32+2.5*Math.pow(Math.sin(f.cross*Math.PI/2),2);
  const tilt=-18+31*f.cross,roll=9-25*f.cross;
  el.satellite.style.transform=`translate3d(${x-sw/2}px,${y-sw*.24}px,0) rotateZ(${roll}deg) rotateY(${tilt}deg) scale(${zScale})`;
  el.satellite.style.opacity=String(smooth(.015,.10,f.t)*(1-smooth(.91,1,f.t)));
  el.glint.style.opacity=String(Math.sin(f.cross*Math.PI)*.6);
  el.scene.style.transform=`translate3d(${-w*.64*f.pan}px,${-h*.095*f.pan}px,0) scale(${1-.14*f.pan})`;
  el.scene.style.opacity=String(1-smooth(.36,.75,f.t));
  el.sky.style.transform=`translate3d(${w*.28*(1-f.pan)}px,0,0)`;
  visibility(el.arrival,f.reveal,`translate3d(${w*.45*(1-f.pan)}px,${20*(1-f.pan)}px,0)`);
 }
 el.sky.style.opacity=smooth(.32,.78,f.t);
 const done=smooth(.92,.985,p);visibility(el.footer,done);el.footer.style.pointerEvents=done>.15?'auto':'none';
 el.note.style.opacity=1-done;el.distance.style.opacity=1-smooth(.51,.60,p);
 el.motion.style.transform=`translate3d(0,${-(mobile?65:30)*done}px,0)`;
 el.number.textContent=(1-Math.exp(-4*clamp(p/.62))).toFixed(2);
 el.noteText.textContent=p<.2?'Scroll into the unknown':p<.55?'A little closer. A little further.':'Follow your curiosity';
 el.progress.style.transform=`scaleY(${p})`;
 el.root.dataset.progress=p.toFixed(4);el.root.dataset.clearance=gap.toFixed(2);el.root.dataset.motion=quiet?'reduced':'full';
}
function requestTick(){if(!frame)frame=requestAnimationFrame(tick)}
function tick(now){
 frame=0;const dt=last?Math.min(50,now-last):16;last=now;
 if(media.matches||paused)position=target;else position+=(target-position)*(1-Math.exp(-dt/125));
 if(Math.abs(position-target)<.000015)position=target;
 draw(position);if(position!==target)requestTick();else last=0;
}
function onScroll(){target=clamp(scrollY/layout.range);requestTick()}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',measure);
document.addEventListener('click',event=>{
 const a=event.target.closest('a[href^="#"]');if(a){
  const dest=a.getAttribute('href'),mapping={'#start':0,'#the-idea':.43,'#about':1};if(!(dest in mapping))return;
  event.preventDefault();const p=mapping[dest];
  window.scrollTo({top:layout.range*p,behavior:media.matches||paused?'instant':'smooth'});
  history.replaceState(null,'',dest==='#start'?location.pathname:dest);
 }
 if(event.target.closest('.motion-button')){
  if(!paused)frozen=clamp(position/.62);paused=!paused;
  el.motion.setAttribute('aria-pressed',String(paused));el.motion.innerHTML=`<span aria-hidden="true">${paused?'▷':'Ⅱ'}</span><span>${paused?'Resume motion':'Pause motion'}</span>`;requestTick();
 }
});
media.addEventListener('change',()=>{frozen=clamp(position/.62);requestTick()});
measure();position=target;draw(position);
