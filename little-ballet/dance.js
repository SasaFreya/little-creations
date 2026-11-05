'use strict';
const canvas=document.querySelector('#scene');let c=canvas.getContext('2d');
let mode='solo',state='intro',stateTime=0,t=0,ambient=0,last=0,paused=false,scale=1,offset={x:0,y:0},drag=null,flowerPulse=0,transitionPose=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,smooth=k=>k*k*(3-2*k);
const rest={x:0,bend:0,rise:0,jump:0,foot:[-6,-2],l:[-6,-32],r:[6,-32],le:[-11,-40],re:[11,-40],turn:0,lean:0,head:0,skirt:0,lesson:0,other:[-2,-2],toe:[-9,0],otherToe:[-6,0],hip:[0,-31],depth:0};
const arms={
 low:{l:[-6,-32],r:[6,-32],le:[-11,-40],re:[11,-40]},
 first:{l:[-3,-39],r:[3,-39],le:[-11,-43],re:[11,-43]},
 second:{l:[-24,-46],r:[24,-46],le:[-14,-48],re:[14,-48]},
 fifth:{l:[-4,-68],r:[4,-68],le:[-11,-60],re:[11,-60]},
 open:{l:[-24,-48],r:[18,-59],le:[-14,-50],re:[13,-53]}
};
const pose=(v={})=>({...rest,...v});
function blend(a,b,k){let out={};for(const key of Object.keys(rest))out[key]=Array.isArray(a[key])?a[key].map((v,i)=>lerp(v,b[key][i],k)):lerp(a[key],b[key],k);return out;}
const solo=[
 [0,pose({...arms.low}),'准备'],
 [1.5,pose({...arms.first,bend:.7,foot:[-7,-2]}),'屈膝'],
 [3,pose({...arms.fifth,rise:1,foot:[-5,-3]}),'踮脚'],
 [4.5,pose({...arms.second,rise:.5,foot:[-23,-8],head:-.06}),'旁伸'],
 [6,pose({...arms.open,rise:.6,foot:[-27,-16],lean:.04,skirt:1}),'展翅'],
 [7.7,pose({...arms.fifth,rise:1,foot:[1,-20]}),'收腿'],
 [9,pose({...arms.first,rise:1,foot:[1,-20]}),'准备转身'],
 [10.5,pose({...arms.first,rise:1,foot:[1,-20],turn:Math.PI*2,skirt:2}),'旋转'],
 [12,pose({...arms.second,rise:.3,foot:[-16,-4],turn:Math.PI*2}),'展开'],
 [13,pose({...arms.low,bend:.8,foot:[-8,-2],turn:Math.PI*2}),'蓄力'],
 [13.5,pose({...arms.second,jump:5,foot:[-11,-3],turn:Math.PI*2,skirt:1}),'小跳'],
 [14.1,pose({...arms.first,bend:.8,foot:[-8,-2],turn:Math.PI*2}),'落地'],
 [16,pose({...arms.open,rise:.6,foot:[-23,-12],turn:Math.PI*2,head:-.08}),'延伸'],
 [18,pose({...arms.low,turn:Math.PI*2}),'收势'],
 [20,pose({...arms.low,turn:Math.PI*2}),'呼吸']
];
function sampleSolo(time){const timeIn=time%20;let i=0;while(i<solo.length-2&&timeIn>=solo[i+1][0])i++;const a=solo[i],b=solo[i+1],k=smooth((timeIn-a[0])/(b[0]-a[0]));return {pose:blend(a[1],b[1],k),label:b[2],progress:timeIn/20};}
function choreography(time){
 if(mode==='lesson')return teachingSample(time);
 if(mode==='solo')return sampleSolo(time);
 if(mode==='swans'){let q=time*Math.PI*1.8,step=Math.sin(q),hop=Math.max(0,Math.sin(q*2));return {pose:pose({x:Math.sin(time*.6)*4,foot:[-7-step*5,-2-Math.max(0,step)*3],l:[17,-42],r:[-17,-40],le:[5,-38],re:[-5,-35],jump:hop*.9,bend:(1-hop)*.16,head:Math.sin(time*1.4)*.075}),label:time%8<4?'交叉牵手 · 同步小步':'轻跳 · 整齐收脚',progress:(time%16)/16};}
 let q=time*.95;return {pose:pose({x:Math.sin(q)*3,foot:[-6-Math.sin(q)*2,-2],l:[-19,-49+Math.sin(q)*8],r:[15,-57+Math.sin(q+1.2)*7],le:[-12,-46+Math.sin(q-.15)*3],re:[12,-51+Math.sin(q+1)*4],lean:Math.sin(q)*.035,head:Math.sin(q-.4)*.05,skirt:Math.sin(q)}),label:time%10<5?'手臂波浪':'重心流动',progress:(time%20)/20};
}
function currentPose(){
 const base=choreography(t);
 if(state==='intro')return blend(rest,choreography(0).pose,smooth(clamp(stateTime/1.6,0,1)));
 if(state==='settling')return blend(transitionPose,rest,smooth(clamp(stateTime/1.8,0,1)));
 if(state==='bow'){
  if(stateTime<.8)return blend(transitionPose,rest,smooth(stateTime/.8));
  let k=stateTime<1.8?smooth((stateTime-.8)):1-smooth(clamp((stateTime-2.2)/1.1,0,1));
  return pose({lean:k*.25,head:k*.15,bend:k*.15,l:[-13,-34],r:[13,-34]});
 }
 if(state==='idle'&&mode==='lesson')return teachingSample(lessonComplete?t:0).pose;
 if(state==='idle')return pose({head:Math.sin(ambient*.5)*.025,l:[-6,-32+Math.sin(ambient)*.25],r:[6,-32+Math.sin(ambient)*.25]});
 return base.pose;
}
// Continuous geometry: no elbow-side toggle and no straight/bent rendering switch.
function joint(a,b,l1,l2,pole){let dx=b[0]-a[0],dy=b[1]-a[1],distance=Math.hypot(dx,dy)||.001,d=clamp(distance,.1,l1+l2-.01),nx=dx/distance,ny=dy/distance,along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));return {elbow:[a[0]+nx*along-ny*height*pole,a[1]+ny*along+nx*height*pole],end:[a[0]+nx*d,a[1]+ny*d]};}
function armGeometry(side,target,elbow){
 const start=[side*4,-48];
 // Elbow and wrist have independent continuous paths, including foreshortening.
 return {start,elbow:elbow?[...elbow]:[side*11,(target[1]-48)/2],wrist:[...target]};
}
function legGeometry(hip,ankle,side,bend=0){
 const dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],d=Math.hypot(dx,dy)||1;
 const length=Math.max(14.25,d/2),height=Math.sqrt(Math.max(0,length*length-d*d/4));
 const flex=smooth(clamp(bend/.22,0,1));
 return {knee:[(hip[0]+ankle[0])/2+side*height*flex,(hip[1]+ankle[1])/2-dx/d*height*flex*.25],ankle:[...ankle]};
}
function ribbon(points,widths,color){
 const samples=[];
 for(let i=0;i<points.length-1;i++){
  const a=points[Math.max(0,i-1)],b=points[i],d=points[i+1],e=points[Math.min(points.length-1,i+2)];
  for(let j=0;j<10;j++){const u=j/10,u2=u*u,u3=u2*u;const at=k=>.5*((2*b[k])+(-a[k]+d[k])*u+(2*a[k]-5*b[k]+4*d[k]-e[k])*u2+(-a[k]+3*b[k]-3*d[k]+e[k])*u3);samples.push({p:[at(0),at(1)],w:lerp(widths[i],widths[i+1],u)});}
 }
 samples.push({p:points[points.length-1],w:widths[widths.length-1]});
 const edges=[[],[]];samples.forEach((v,i)=>{const a=samples[Math.max(0,i-1)].p,b=samples[Math.min(samples.length-1,i+1)].p,dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1;for(let k=0;k<2;k++){const side=k?1:-1;edges[k].push([v.p[0]-dy/n*v.w*side,v.p[1]+dx/n*v.w*side]);}});
 c.fillStyle=color;c.beginPath();[...edges[0],...edges[1].reverse()].forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill();
}
function drawLeg(hip,ankle,toe,side,bend,color){
 const g=legGeometry(hip,ankle,side,bend);ribbon([hip,g.knee,ankle],[1.65,1.1,.62],color);drawShoe(ankle,toe,side);
}
function drawShoe(ankle,toe,side){
 const flat=clamp(1-Math.max(0,toe[1]-ankle[1]-2)/3,0,1),heel=[ankle[0]-side*.65,lerp(ankle[1]+.7,toe[1]-.1,flat)];
 c.fillStyle='#d9a7b5';c.beginPath();c.moveTo(ankle[0]-.65,ankle[1]-1.15);c.quadraticCurveTo(ankle[0]+side*1.2,ankle[1]-.7,toe[0],toe[1]-.45);c.quadraticCurveTo(toe[0]+side*.7,toe[1]+.2,toe[0]-.3*side,toe[1]+.3);c.quadraticCurveTo((heel[0]+toe[0])/2,toe[1]+.3,heel[0],heel[1]);c.quadraticCurveTo(ankle[0]-side*.9,ankle[1]-.2,ankle[0]-.65,ankle[1]-1.15);c.fill();
 ribbon([[ankle[0]-.5,ankle[1]-2],[ankle[0]+.35,ankle[1]-.8],[ankle[0]-.3,ankle[1]+.1]],[.15,.17,.12],'#bd8fa1');
}
function drawArm(side,target,elbow,skin,lit){
 const g=armGeometry(side,target,elbow);ribbon([g.start,g.elbow,g.wrist],[1.3,.95,.48],skin);
 const dx=g.wrist[0]-g.elbow[0],dy=g.wrist[1]-g.elbow[1],angle=Math.atan2(dy,dx)+side*.16;
 const palm=[g.wrist[0]+Math.cos(angle)*1.1,g.wrist[1]+Math.sin(angle)*1.1],tip=[g.wrist[0]+Math.cos(angle+side*.2)*2.5,g.wrist[1]+Math.sin(angle+side*.2)*2.5];
 ribbon([g.wrist,palm,tip],[.5,.48,.18],lit);
}
function dancer(x,y,s,p,index=0,forcedView=null){
 c.save();c.translate(x+p.x,y);c.scale(s,s);
 const sw=mode==='swans',east=mode==='oriental',angle=forcedView??p.turn,co=Math.cos(angle),back=co<-.2,side=Math.abs(co)<.45,view=.58+.42*Math.abs(co);
 c.scale(view,1);const skin='#edc6b5',shadow='#d5a397',lit='#f6d9c7',dress=sw?'#d9d7e5':east?'#ba8b74':'#a28ab9',light=sw?'#fff9f3':east?'#e4c399':'#d9c8e6',deep=sw?'#b4afc9':east?'#9a6b5c':'#88719f';
 const hipY=p.lesson>.001?p.hip[1]:-31+p.bend*4-p.rise*1.7-p.jump,delta=hipY+31;
 if(p.lesson>.001){teachingLegs(p,skin,shadow);}else{
 const support=[2,-2-p.rise*1.7-p.jump],working=[p.foot[0],p.foot[1]-p.jump];
 const supportToe=[support[0]+lerp(3.6,1.2,p.rise),-p.jump];
 const height=clamp((-working[1]-5)/12,0,1),workingToe=[working[0]-lerp(3.6,1.1,height),working[1]+lerp(2,3.4,height)];
 drawLeg([2,hipY],support,supportToe,1,p.bend,shadow);
 drawLeg([-2,hipY],working,workingToe,-1,Math.max(p.bend,height*.65),skin);
 }
 c.save();c.translate(0,delta);c.translate(0,-31);c.rotate(p.lean);c.translate(0,31);
 // The neck, shoulders, torso and head share the same transform.
 taper([0,-54],[0,-47.5],1.35,1.65,skin);
 silhouette([[-4,-48],[-2.5,-46],[0,-45],[2.5,-46],[4,-48],[5,-43],[3,-36],[4,-31],[-4,-31],[-3,-36],[-5,-43]],dress);
 silhouette([[-4,-49],[-2,-50],[0,-47.5],[2,-50],[4,-49],[3,-46],[0,-45],[-3,-46]],skin);
 taper([-3.8,-48],[-3,-44],.45,.45,light);taper([3.8,-48],[3,-44],.45,.45,light);
 if(!back){taper([-2,-43],[-1.5,-35],.4,.25,light);oval(0,-32,3.8,.6,deep);}else{taper([-2,-45],[2,-40],.2,.2,light);taper([2,-45],[-2,-40],.2,.2,light);}
 // A soft trailing hem responds to turns after the body starts moving.
 const flutter=Math.sin(ambient*2-p.turn*.6)*.4+p.skirt*.65;
 if(east){silhouette([[-4,-32],[4,-32],[6,-22],[9+flutter,-9],[13+flutter,-3],[7,-2],[1,-3],[-5,-2],[-12+flutter,-4],[-7,-20]],dress);silhouette([[-1,-31],[2,-31],[3,-19],[8+flutter,-4],[3,-3],[-2,-14]],light);taper([-4,-32],[4,-32],.6,.6,'#e8cf9a');for(let i=0;i<5;i++)oval(-3+i*1.5,-30.5,.4,.55,'#e5c58e');}
 else{const w=(sw?14:16)+Math.abs(p.skirt)*1.2;
 silhouette([[-3.5,-32],[3.5,-32],[8,-29],[w+flutter,-24],[w-2,-21],[10,-20],[4,-21],[0,-20],[-6,-21],[-w,-21],[-w-1,-24],[-8,-29]],deep);
 silhouette([[-3,-33],[3,-33],[7,-30],[w+1,-25],[w-3,-23],[9,-24],[4,-22],[0,-23],[-5,-22],[-11,-24],[-w,-23],[-w-1,-25],[-7,-30]],dress);
 silhouette([[-3,-33],[2,-33],[6,-30],[13,-26],[8,-25],[3,-26],[-2,-25],[-8,-26],[-13,-25],[-7,-30]],light);
 for(let i=0;i<7;i++){let dx=-11+i*3.7;taper([dx*.3,-31],[dx+flutter*.3,-25.4+Math.abs(dx)*.07],.18,.32,sw?'#ffffffaa':'#f3e9f38a');}oval(-2,-33,1,.6,'#e9d9e9');}
 drawArm(-1,p.l,p.le,skin,lit);drawArm(1,p.r,p.re,skin,lit);
 c.save();c.translate(0,-52);c.rotate(p.head);c.translate(0,52);
 oval(-4.2,-61,2.2,2.3,'#65515a');oval(-4.5,-62,1.45,1.45,'#836671');
 silhouette([[-3.5,-62],[-2,-64],[1.5,-64],[3.5,-62],[4,-58],[3,-54.5],[1,-53],[-1.5,-53],[-3.5,-55],[-4,-59]],skin);
 if(back){silhouette([[-4,-59],[-4.5,-62],[-3,-65],[-.5,-66],[2.5,-65],[4,-62],[4,-57],[2,-54],[-1,-54],[-3.5,-56]],'#68535d');taper([-2,-62],[-1,-56],.35,.25,'#88717b');}
 else{silhouette([[-4,-59],[-4.5,-62],[-3,-65],[-.5,-66],[2.5,-65],[4,-62],[3.7,-59],[2,-62],[0,-62.5],[-2.5,-60]],'#68535d');silhouette([[-3,-63],[-1,-64.5],[1.5,-64],[2.5,-63],[0,-63.5]],'#927781');
 const blink=Math.sin(ambient*1.7+index*.1)>.985;
 if(side){taper([1,-57.7],[2.3,-57.5],.23,.18,'#7a5968');}else{for(const sx of [-1.8,1.6]){if(blink)taper([sx-.6,-57.5],[sx+.6,-57.5],.2,.2,'#7a5968');else oval(sx,-57.6,.35,.45,'#7a5968');}}
 oval(-2.5,-56,.8,.35,'#e3a5a6');oval(2.1,-56,.75,.35,'#e3a5a6');taper([-.4,-54.8],[.4,-54.8],.15,.15,'#bf858e');}
 taper([-4.7,-63.5],[-3.4,-64],.5,.5,light);
 if(sw){silhouette([[-3,-65],[-4,-68],[-2,-67],[-1,-70],[0,-67],[2,-68],[2.5,-65]],'#fffaf6');oval(0,-65,.55,.45,'#c0b4d4');}
 if(east){taper([-3.6,-61.5],[3.4,-61.5],.35,.35,'#efd59d');oval(0,-61.2,.6,.8,'#e6be75');}
 c.restore();c.restore();c.restore();
}
function updateUI(){const active=state!=='idle';document.querySelector('#play').textContent=state==='idle'?'▷ 开始演出':paused?'▷ 继续演出':'Ⅱ 暂停';document.querySelector('#rest').disabled=state==='idle'||state==='settling';document.querySelector('#bow').disabled=state==='idle';document.querySelector('#state-label').textContent=paused?'暂停片刻':({intro:'准备开演',performing:'正在演出',settling:'轻轻收势',bow:'向你致意',idle:'安静陪伴'})[state];document.querySelector('.live-dot').classList.toggle('resting',!active||paused);if(mode==='lesson'){play.textContent=state==='idle'?(lessonComplete?'↺ 再看一遍':'▷ 开始讲解示范'):paused?'▷ 继续示范':'Ⅱ 暂停示范';document.querySelector('#state-label').textContent=paused?'已暂停':state==='idle'?(lessonComplete?'组合完成':'准备上课'):'讲解示范';}}
function beginTransition(next){cancelLessonSpeech();transitionPose=currentPose();transitionPose.turn=((transitionPose.turn+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;state=next;stateTime=0;paused=false;updateUI();}
let renderTime=0,uiTime=0;
function draw(now){if(!last)last=now;const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden){if(!paused){ambient+=dt;stateTime+=dt;flowerPulse=Math.max(0,flowerPulse-dt*.65);if(state==='performing'){t+=dt*(mode==='lesson'?lessonRate:1);if(mode==='lesson'&&t>=lessonData().counts*60/lessonData().bpm){t=lessonData().counts*60/lessonData().bpm;lessonComplete=true;state='idle';cancelLessonSpeech();updateUI();}}if(state==='intro'&&stateTime>=1.6){state='performing';stateTime=0;updateUI();}if((state==='settling'&&stateTime>=1.8)||(state==='bow'&&stateTime>=3.3)){state='idle';stateTime=0;t=0;updateUI();}}
 const interval=state==='idle'?1000/20:1000/40;if(now-renderTime>=interval){renderTime=now;render();}if(now-uiTime>150){uiTime=now;if(mode==='lesson')lessonStatus();const v=choreography(t);document.querySelector('#phrase').textContent=state==='performing'?v.label:state==='idle'?'花开着，等你有空再来。':state==='bow'?'谢谢你来看这一支舞。':state==='settling'?'收好裙摆，休息一会儿。':'整理裙摆，准备开始。';document.querySelector('#progress').style.width=(state==='performing'?v.progress*100:0)+'%';}}
 requestAnimationFrame(draw);}
function render(){c.clearRect(0,0,900,430);c.save();c.scale(2,2);c.translate(225+offset.x,140+offset.y);c.scale(scale,scale);rug();if(mode==='lesson'){teachingFloor();if(lessonId==='tendu')teachingBarre();}const p=currentPose(),n=mode==='swans'?4:1;for(let i=0;i<n;i++){let x=n===1?0:(i-1.5)*40;c.fillStyle='#9b839322';c.beginPath();c.ellipse(x+p.x+1,25,10+p.jump*.3,1.8,0,0,Math.PI*2);c.fill();dancer(x,23,1.4,p,i);}for(let i=0;i<5;i++){let px=Math.sin(i*4.7)*110,py=-30+Math.sin(ambient*.4+i)*8-i*8;rect(px,py,1,1,'#cbb29b66');}c.restore();}
const play=document.querySelector('#play');play.onclick=()=>{if(mode==='lesson'){if(state==='idle'){if(lessonComplete)t=0;lessonComplete=false;state='performing';paused=false;}else paused=!paused;if(!speechReady){speechReady=true;lessonVoice=true;updateVoiceButton();}if(paused)cancelLessonSpeech();else narrateLesson(true);updateUI();lessonStatus();return;}if(state==='idle'){state='intro';stateTime=0;t=0;paused=false;}else paused=!paused;updateUI();};document.querySelector('#rest').onclick=()=>beginTransition('settling');document.querySelector('#bow').onclick=()=>beginTransition('bow');
document.querySelector('#size').oninput=e=>{scale=+e.target.value;remember();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{cancelLessonSpeech();document.body.classList.remove('teaching');document.querySelector('#lesson-panel').hidden=true;document.querySelector('#classroom').setAttribute('aria-pressed','false');mode=b.dataset.mode;t=0;state='intro';stateTime=0;paused=false;document.querySelectorAll('[data-mode]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b?'true':'false');});document.querySelector('#program-title').textContent={solo:'花间独舞',swans:'四小天鹅',oriental:'东方舞'}[mode];updateUI();remember();});
document.querySelector('#mini').onclick=()=>{const mini=document.body.classList.toggle('mini');document.querySelector('#mini').textContent=mini?'↗ 返回剧场':'↘ 角落模式';document.querySelector('#mini').setAttribute('aria-pressed',String(mini));};
function canvasPoint(e){const r=canvas.getBoundingClientRect(),k=Math.min(r.width/450,r.height/215);return {x:(e.clientX-r.left-(r.width-450*k)/2)/k-225,y:(e.clientY-r.top-(r.height-215*k)/2)/k-140,k};}
canvas.onpointerdown=e=>{const p=canvasPoint(e);drag={x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y,k:p.k};canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(drag){offset.x=clamp(drag.ox+(e.clientX-drag.x)/drag.k,-85,85);offset.y=clamp(drag.oy+(e.clientY-drag.y)/drag.k,-30,25);}};
canvas.onpointerup=e=>{if(drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<5){const p=canvasPoint(e),x=(p.x-offset.x)/scale;if(Math.abs(x)>100){flowerPulse=1;document.querySelector('#interaction-note').textContent='花也轻轻向你点了点头。';}}drag=null;remember();};canvas.onpointercancel=()=>drag=null;
function remember(){try{localStorage.setItem('little-ballet-v4',JSON.stringify({mode,scale,offset}));}catch{}}
try{const saved=JSON.parse(localStorage.getItem('little-ballet-v4'));if(saved){scale=clamp(Number(saved.scale)||1,.65,1.2);if(saved.offset)offset={x:clamp(saved.offset.x||0,-85,85),y:clamp(saved.offset.y||0,-30,25)};document.querySelector('#size').value=scale;if(['solo','swans','oriental'].includes(saved.mode))document.querySelector(`[data-mode="${saved.mode}"]`).click();}}catch{}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===document.body){e.preventDefault();play.click();}});
const guide=document.querySelector('#guide');document.querySelector('#guide-open').onclick=()=>{guide.showModal();renderGuide();};document.querySelector('#guide-close').onclick=()=>guide.close();guide.onclick=e=>{if(e.target===guide)guide.close();};
function renderGuide(){const gc=document.querySelector('#guide-art').getContext('2d');gc.clearRect(0,0,900,300);/* Draw the same production character in a dedicated canvas using a temporary render target. */drawGuide(gc);}
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){state='idle';stateTime=0;}
initLessons();updateUI();requestAnimationFrame(draw);

function drawGuide(gc){const original=c,originalMode=mode;c=gc;mode='solo';try{c.save();c.scale(2,2);const views=[0,Math.PI/2,Math.PI,0],labels=['正面','侧面','背面','踮脚 · 五位手'];for(let i=0;i<4;i++){dancer(61+i*109,116,1.3,i===3?pose({...arms.fifth,rise:1,foot:[1,-20]}):rest,0,views[i]);c.fillStyle='#a18d9e';c.font='6px -apple-system, sans-serif';c.textAlign='center';c.fillText(labels[i],61+i*109,136);}c.restore();}finally{c=original;mode=originalMode;}}
