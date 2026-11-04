const scene=document.querySelector('#scene'),NS='http://www.w3.org/2000/svg';let seed=731;function rnd(a=0,b=1){seed=(seed*1664525+1013904223)>>>0;return a+(seed/4294967296)*(b-a)}function el(tag,attrs={},parent=scene){let n=document.createElementNS(NS,tag);for(let [k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n}const defs=el('defs');
defs.innerHTML=`
<linearGradient id="room" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#2447a5"/><stop offset=".28" stop-color="#103197"/><stop offset=".6" stop-color="#08217e"/><stop offset="1" stop-color="#030e48"/></linearGradient>
<linearGradient id="table" x2="0" y2="1"><stop stop-color="#1b3597"/><stop offset="1" stop-color="#071b70"/></linearGradient>
<linearGradient id="porcelain"><stop stop-color="#647f7b"/><stop offset=".18" stop-color="#c0cdc1"/><stop offset=".35" stop-color="#f5f1dc"/><stop offset=".55" stop-color="#dce1cc"/><stop offset=".82" stop-color="#a6b8a8"/><stop offset="1" stop-color="#4c6a65"/></linearGradient>
<radialGradient id="ceramicLight" cx=".25" cy=".2" r=".9"><stop stop-color="#fffde4" stop-opacity=".35"/><stop offset=".65" stop-color="#e7f2dc" stop-opacity="0"/><stop offset="1" stop-color="#203c39" stop-opacity=".32"/></radialGradient>
<radialGradient id="sunlight"><stop stop-color="#fff1c1" stop-opacity=".18"/><stop offset="1" stop-color="#ffe5af" stop-opacity="0"/></radialGradient>
<filter id="soft"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="shadow"><feGaussianBlur stdDeviation="8"/></filter>
<clipPath id="vaseClip"><path id="vaseShape" d="M302 637 C302 658 276 672 267 704 C248 755 260 827 279 851 Q362 879 447 850 C466 798 472 745 453 704 C438 674 418 659 420 637Z"/></clipPath>`;
el('rect',{width:720,height:900,fill:'url(#room)'});
const distant=el('g',{filter:'url(#soft)',opacity:.35});el('path',{d:'M-30 0H110V710H-30Z',fill:'#94b5ff'},distant);el('path',{d:'M143 -10H161V720H143Z',fill:'#07124b'},distant);el('ellipse',{cx:585,cy:240,rx:80,ry:210,fill:'#030b3b',transform:'rotate(31 585 240)'},distant);
const windowShadow=el('g',{opacity:.13});el('path',{d:'M50 -30 85 -30 540 900 485 900Z M-100 170 -80 140 720 610 720 655Z',fill:'#020b3c'},windowShadow);
el('path',{d:'M0 782 720 741V900H0Z',fill:'url(#table)'});el('ellipse',{cx:405,cy:860,rx:145,ry:20,fill:'#11251f',opacity:.36,filter:'url(#shadow)'});
const vegetation=el('g');const branches=[];
function spray(x,y,length,angle,parent,depth=0){
 const ex=x+Math.cos(angle)*length,ey=y+Math.sin(angle)*length;
 el('path',{d:`M${x} ${y} Q${x+Math.cos(angle+.16)*length*.5} ${y+Math.sin(angle+.16)*length*.5} ${ex} ${ey}`,fill:'none',stroke:depth?'#637b53':'#3c593d','stroke-width':depth?.65:1.4},parent);
 const n=Math.floor(length/5);
 for(let i=1;i<n;i++){
  const t=i/n,px=x+(ex-x)*t,py=y+(ey-y)*t;
  for(let side of [-1,1]){
   const a=angle+side*rnd(.5,1.2),len=(1-t)*rnd(10,23)+4;
   const tx=px+Math.cos(a)*len,ty=py+Math.sin(a)*len;
   el('path',{d:`M${px} ${py} Q${px+Math.cos(a+.2)*len*.7} ${py+Math.sin(a+.2)*len*.7} ${tx} ${ty}`,stroke:['#52754d','#8f9e69','#315b3f','#69865a'][i%4],'stroke-width':rnd(.35,.85),opacity:rnd(.45,.9),fill:'none'},parent);
   if(!depth&&i%4===0)spray(px,py,rnd(25,52),a,parent,1);
  }
 }
}
const sprigs=[[140,195,110,-1.7],[247,140,115,-1.3],[385,200,120,-1.8],[520,315,120,-.7],[607,470,95,-1.2],[153,425,115,-2.6],[128,563,105,-2.8],[235,583,100,-2.2],[525,583,110,-.5],[422,516,85,-1.2],[186,318,90,-2],[551,197,90,-1.1],[168,665,80,-2.8],[475,670,100,-.2]];
for(const [x,y,len,angle] of sprigs){const g=el('g',{},vegetation);el('path',{d:`M359 682 C${x+40} ${y+210} ${x+20} ${y+60} ${x} ${y}`,stroke:'#486648','stroke-width':1.5,fill:'none'},g);spray(x,y,len,angle,g);branches.push({node:g,phase:rnd(0,7),strength:rnd(.2,.6)})}
const flowerData=[{x:260,y:229,r:80,pink:true,angle:-19,flat:.72},{x:531,y:438,r:60,pink:true,angle:24,flat:.68},{x:322,y:416,r:104,pink:true,angle:-11,flat:.72},{x:439,y:580,r:73,pink:false,angle:22,flat:.74}];
const flowers=[];
for(let [index,f] of flowerData.entries()){
 el('path',{d:`M358 675 C${f.x-30} ${f.y+170} ${f.x+17} ${f.y+80} ${f.x} ${f.y+10}`,stroke:'#657c49','stroke-width':3.4,fill:'none'},vegetation);
 const wrap=el('g',{transform:`translate(${f.x} ${f.y}) rotate(${f.angle})`});
 const group=el('g',{class:'flower',tabindex:0,role:'button','aria-label':`${f.pink?'粉色':'白色'}菊花，点击舒展`,'aria-pressed':false},wrap);
 el('ellipse',{rx:f.r*.19,ry:f.r*.14,fill:f.pink?'#dfa7b6':'#e4dfb9'},group);
 const petals=el('g',{class:'petals'},group);
 // Outer curled rays, then a dense, cupped centre. Every petal has its own light.
 for(let layer=0;layer<9;layer++){
  const count=layer===0?20:23+layer*3;
  for(let i=0;i<count;i++){
   const a=i/count*Math.PI*2+layer*.27+rnd(-.04,.04);
   const radius=f.r*(1-layer*.108),start=f.r*Math.max(.005,.23-layer*.036);
   const length=radius*rnd(.85,1.17),wide=f.r*rnd(.034,.059)*(1-layer*.045);
   const sx=Math.cos(a)*start,sy=Math.sin(a)*start*f.flat;
   let tx=Math.cos(a)*length,ty=Math.sin(a)*length*f.flat;
   // Long bottom rays drape; upper rays curl back toward the window.
   if(layer===0&&Math.sin(a)>.25)ty+=rnd(12,44);
   if(layer===0&&Math.sin(a)<-.35)ty-=rnd(8,27);
   const curl=rnd(-.35,.3)*length;
   const nx=-Math.sin(a),ny=Math.cos(a)*f.flat;
   const c1x=sx+Math.cos(a)*length*.35+nx*curl,c1y=sy+Math.sin(a)*length*.28*f.flat+ny*curl-12;
   const c2x=tx+nx*curl*.6,c2y=ty+ny*curl*.6-16;
   const endx=tx+nx*rnd(-7,7),endy=ty+rnd(-8,6);
   const id=`p${index}-${layer}-${i}`;
   const light=Math.cos(a+2)*.5+.5;
   const grad=el('linearGradient',{id,x1:0,y1:1,x2:light,y2:0},defs);
   const shades=f.pink?['#985569','#ce8c9e','#f3bfc6','#ffe1db']:['#959475','#cecfac','#f0eed0','#fffae6'];
   el('stop',{offset:0,'stop-color':shades[0]},grad);el('stop',{offset:.45,'stop-color':shades[1]},grad);el('stop',{offset:.78,'stop-color':shades[2]},grad);el('stop',{offset:1,'stop-color':shades[light>.5?3:2]},grad);
   const d=`M${sx-nx*wide} ${sy-ny*wide} C${c1x-nx*wide} ${c1y-ny*wide} ${c2x-nx*wide} ${c2y-ny*wide} ${endx} ${endy} C${c2x+nx*wide*.5} ${c2y+ny*wide*.5} ${c1x+nx*wide} ${c1y+ny*wide} ${sx+nx*wide} ${sy+ny*wide}Z`;
   el('path',{d,fill:`url(#${id})`,stroke:f.pink?'#7d425b30':'#767c5730','stroke-width':.4},petals);
   el('path',{d:`M${sx} ${sy} C${c1x} ${c1y} ${c2x} ${c2y} ${endx} ${endy}`,fill:'none',stroke:f.pink?'#ffe6df':'#ffffeb','stroke-width':.35,opacity:.3},petals);
  }
 }
 const toggle=()=>{const open=group.classList.toggle('open');group.setAttribute('aria-pressed',String(open));document.querySelector('#note').textContent=open?'它又舒展了一点。':'把这一刻，轻轻收好。'};
 group.addEventListener('click',toggle);group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});flowers.push(group);
}
const vase=el('g');const shape='M302 637 C302 658 276 672 267 704 C248 755 260 827 279 851 Q362 879 447 850 C466 798 472 745 453 704 C438 674 418 659 420 637Z';
el('path',{d:shape,fill:'url(#porcelain)',stroke:'#b1c3b0','stroke-width':.65},vase);
const motifs=el('g',{'clip-path':'url(#vaseClip)',fill:'none',stroke:'#365f79','stroke-width':.85,opacity:.85},vase);
// Meandering vines replace a rigid repeating stamp pattern.
for(let vine=0;vine<7;vine++){
 const x=260+vine*30;
 el('path',{d:`M${x} 883 C${x-35} 820 ${x+45} 797 ${x} 735 S${x-12} 669 ${x+10} 631`,stroke:'#53798b'},motifs);
 for(let j=0;j<5;j++){
  const y=670+j*43,px=x+Math.sin(j*2+vine)*18,sz=rnd(7,13);
  const ornament=el('g',{transform:`translate(${px} ${y}) rotate(${rnd(-50,50)})`},motifs);
  for(let k=0;k<7;k++){const a=k*360/7;el('path',{d:`M0 0 C${-sz} ${-sz*.5} ${-sz*.6} ${-sz*1.7} 0 ${-sz*1.4} C${sz*.7} ${-sz*1.7} ${sz} ${-sz*.5} 0 0Z`,transform:`rotate(${a})`,fill:'#537c9014'},ornament)}
  el('circle',{r:2,fill:'#3e6582'},ornament);
  el('path',{d:`M${px+8} ${y+15}q15 -22 24 -16q-4 17 -24 16 M${px-7} ${y+24}q-21 -14 -24 -5q8 14 24 5`,fill:'#456c8255'},motifs);
 }
}
el('path',{d:shape,fill:'url(#ceramicLight)','pointer-events':'none'},vase);
el('ellipse',{cx:361,cy:637,rx:59,ry:8,fill:'#58796d',stroke:'#d7ddc6','stroke-width':2},vase);
el('ellipse',{cx:360,cy:639,rx:53,ry:4,fill:'#2e4b43',opacity:.7},vase);
el('path',{d:'M282 846 Q364 871 447 845 M284 851 Q363 875 445 850',stroke:'#587589','stroke-width':1.2,fill:'none'},vase);
el('path',{d:'M283 711 C270 751 275 799 283 817',fill:'none',stroke:'#fffbe6','stroke-width':4,opacity:.28},vase);
const sunlight=el('ellipse',{cx:160,cy:240,rx:540,ry:580,fill:'url(#sunlight)','pointer-events':'none'});
const shade=el('rect',{width:720,height:900,fill:'#132528',opacity:.06,'pointer-events':'none'});
const sun=document.querySelector('#sun');function light(){let t=Number(sun.value)/100;sunlight.setAttribute('cx',100+t*620);sunlight.setAttribute('cy',180+t*110);sunlight.setAttribute('opacity',1-Math.abs(t-.45)*.8);shade.setAttribute('opacity',.03+Math.max(0,t-.65)*.9);windowShadow.setAttribute('transform',`translate(${(t-.6)*200} 0)`);document.querySelector('#sun-label').textContent=t<.3?'清晨':t<.7?'午后':'傍晚';let mins=Math.round(7*60+t*12*60);document.querySelector('#time').textContent=`${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`;sun.setAttribute('aria-valuetext',document.querySelector('#time').textContent)}sun.addEventListener('input',light);light();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let wind=!reduced,pointer=0;const windButton=document.querySelector('#wind');function syncWind(){windButton.setAttribute('aria-pressed',String(wind));windButton.innerHTML=`微风 <span>${wind?'开':'关'}</span>`}syncWind();windButton.onclick=()=>{wind=!wind;syncWind()};let allOpen=false;document.querySelector('#bloom').onclick=()=>{allOpen=!allOpen;flowers.forEach(f=>{f.classList.toggle('open',allOpen);f.setAttribute('aria-pressed',String(allOpen))});document.querySelector('#bloom').textContent=allOpen?'让花轻轻收拢 ↶':'让花都舒展 ↗';document.querySelector('#note').textContent=allOpen?'此刻，花都慢慢开了。':'一瓶花，一段不必着急的时间。'};scene.addEventListener('pointermove',e=>{let r=scene.getBoundingClientRect();pointer=(e.clientX-r.left)/r.width-.5});scene.addEventListener('pointerleave',()=>pointer=0);let frame;function animate(t){branches.forEach((b,i)=>b.node.setAttribute('transform',`rotate(${wind?Math.sin(t*.00065+b.phase)*b.strength+(reduced?0:pointer*1.5):0} 365 650)`));frame=requestAnimationFrame(animate)}frame=requestAnimationFrame(animate);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else frame=requestAnimationFrame(animate)});
