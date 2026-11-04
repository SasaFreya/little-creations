const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d'),W=800,H=900;
const bouquet=document.createElement('canvas');bouquet.width=W;bouquet.height=H;const b=bouquet.getContext('2d');
const picture=document.createElement('canvas');picture.width=W;picture.height=H;const p=picture.getContext('2d');
let seed=42;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}const rand=(a,c)=>a+random()*(c-a);
function path(points,fill,stroke){b.beginPath();b.moveTo(...points[0]);for(let i=1;i<points.length;i++)b.lineTo(...points[i]);b.closePath();if(fill){b.fillStyle=fill;b.fill()}if(stroke){b.strokeStyle=stroke;b.lineWidth=1;b.stroke()}}
function tint(hex,n){const rgb=hex.startsWith('rgb')?hex.match(/\d+/g).map(Number):null;const v=rgb?(rgb[0]<<16)|(rgb[1]<<8)|rgb[2]:parseInt(hex.slice(1),16);return `rgb(${Math.max(0,Math.min(255,(v>>16)+n))},${Math.max(0,Math.min(255,((v>>8)&255)+n))},${Math.max(0,Math.min(255,(v&255)+n))})`}
function petal(x,y,rx,ry,angle,color){
 b.save();b.translate(x,y);b.rotate(angle);
 const g=b.createLinearGradient(-rx,ry,rx,-ry);g.addColorStop(0,tint(color,-45));g.addColorStop(.45,color);g.addColorStop(.8,tint(color,15));g.addColorStop(1,tint(color,-12));
 b.beginPath();b.moveTo(0,ry);b.bezierCurveTo(-rx*1.3,ry*.2,-rx,-ry*.85,0,-ry);b.bezierCurveTo(rx,-ry*.95,rx*1.2,ry*.3,0,ry);b.fillStyle=g;b.fill();
 b.strokeStyle=tint(color,-25);b.lineWidth=.45;b.stroke();b.beginPath();b.moveTo(0,ry*.8);b.quadraticCurveTo(-rx*.13,0,0,-ry*.87);b.strokeStyle=tint(color,24);b.lineWidth=.6;b.stroke();b.restore();
}
function flower(x,y,r,color,type=0){
 b.save();b.translate(x,y);b.rotate(rand(-.7,.7));b.scale(1,rand(.78,.97));
 const n=type===1?7:type===2?18:13,layers=type===2?4:2;
 for(let layer=0;layer<layers;layer++)for(let i=0;i<n;i++){
  const a=i/n*Math.PI*2+layer*.17+rand(-.025,.025),len=r*(1-layer*.18)*rand(.92,1.05),offset=len*.48;
  petal(Math.cos(a)*offset,Math.sin(a)*offset,len*(type===1?.24:.135),len*.54,a+Math.PI/2,tint(color,-layer*5));
 }
 b.fillStyle=type===1?'#d6ae5d':'#b78f39';b.beginPath();b.arc(0,0,r*(type===1?.16:.2),0,7);b.fill();
 for(let i=0;i<65;i++){const a=i*2.39996,d=Math.sqrt(i/65)*r*.2;b.fillStyle=['#e9c765','#f9e0a1','#80642f'][i%3];b.beginPath();b.arc(Math.cos(a)*d,Math.sin(a)*d,rand(.55,1.15),0,7);b.fill()}
 if(type===1){for(let i=0;i<17;i++){const a=i/17*7;b.beginPath();b.moveTo(0,0);b.lineTo(Math.cos(a)*r*.32,Math.sin(a)*r*.32);b.strokeStyle='#dbc984';b.lineWidth=.6;b.stroke();b.fillStyle='#f8e4b2';b.beginPath();b.arc(Math.cos(a)*r*.32,Math.sin(a)*r*.32,1,0,7);b.fill()}}
 b.restore();
}
function stem(x,y,width=1.5){b.beginPath();b.moveTo(402+rand(-12,12),744);b.bezierCurveTo(394,605,x+rand(-22,22),y+110,x,y);b.strokeStyle='#6e9860';b.lineWidth=width;b.stroke();b.beginPath();b.moveTo(403,742);b.quadraticCurveTo(x+8,y+110,x+1,y);b.strokeStyle='#b6c89166';b.lineWidth=.45;b.stroke()}
function orchid(x,y,r,angle){b.save();b.translate(x,y);b.rotate(angle);for(const [a,rx,ry,d] of [[-1.4,.37,.6,.45],[1.5,.4,.65,.48],[0,.47,.6,.55],[-2.7,.29,.65,.35],[2.7,.29,.65,.35]]){petal(Math.sin(a)*r*d,-Math.cos(a)*r*d,r*rx,r*ry,a,'#f0f3e8')}petal(0,r*.25,r*.22,r*.33,0,'#d9b8c7');b.fillStyle='#ddbe69';b.beginPath();b.ellipse(0,r*.06,r*.1,r*.07,0,0,7);b.fill();for(let i=0;i<15;i++){b.fillStyle='#a76589';b.fillRect(rand(-r*.1,r*.1),rand(r*.15,r*.4),.65,1.2)}b.restore()}
function drawBouquet(){
 b.clearRect(0,0,W,H);
 // Curved, translucent cellophane, with fine irregular creases.
 const wrap=b.createLinearGradient(140,200,660,580);wrap.addColorStop(0,'#44cff138');wrap.addColorStop(.32,'#36b6e410');wrap.addColorStop(.6,'#b5e9ef18');wrap.addColorStop(1,'#1fb4e947');
 b.beginPath();b.moveTo(391,69);b.bezierCurveTo(326,111,213,126,173,208);b.bezierCurveTo(118,281,142,377,125,429);b.bezierCurveTo(106,491,163,594,220,646);b.lineTo(372,737);b.quadraticCurveTo(482,722,559,641);b.bezierCurveTo(610,580,681,496,641,412);b.bezierCurveTo(672,326,585,185,527,166);b.quadraticCurveTo(463,138,391,69);b.fillStyle=wrap;b.fill();b.strokeStyle='#8bdce26b';b.lineWidth=1.2;b.stroke();
 for(let i=0;i<48;i++){let x=rand(150,636),y=rand(125,615);b.beginPath();b.moveTo(400+rand(-18,18),738);b.bezierCurveTo(x+rand(-30,30),y+150,x-25,y+55,x,y);b.strokeStyle=i%3?'#7bcfe31c':'#c0f3ed32';b.lineWidth=rand(.35,1.5);b.stroke();if(i%2===0){b.beginPath();b.moveTo(x,y);b.lineTo(x+rand(-14,14),y+rand(12,38));b.lineTo(x+rand(-5,20),y+rand(40,70));b.strokeStyle='#b7e9e52e';b.lineWidth=.55;b.stroke()}}
 const blooms=[
 [360,197,27,'#ac91ce',1],[473,230,38,'#bb99da',1],[293,267,32,'#efa44e',2],
 [529,327,27,'#e5d390',0],[229,366,24,'#eee9d5',0],[267,431,37,'#f0a33b',2],
 [345,474,30,'#e8cb65',0],[512,446,30,'#eeb044',2],[439,541,39,'#eadfc1',0],
 [304,563,28,'#b6a0d2',1],[383,611,31,'#b69cd3',1],[238,523,19,'#ede8d8',0],
 [569,389,21,'#ddb953',0],[211,464,18,'#e5dbc6',0],[394,284,20,'#f0e8d7',0]];
 for(const [x,y,r,c,type]of blooms){stem(x,y,rand(1,2.4));let ly=y+rand(70,130),lx=(x+400)/2;petal(lx,ly,rand(6,11),rand(25,43),(x<400?-.6:.6),'#678f60')}
 // Loose branching filler, rather than a fan of identical straight stems.
 for(let k=0;k<12;k++){const x=rand(185,605),y=rand(180,626);stem(x,y,.65);for(let j=0;j<11;j++){const t=j/11,px=x+(400-x)*t*.22,py=y+t*90,dir=j%2?1:-1,ex=px+dir*rand(9,30),ey=py-rand(5,20);b.beginPath();b.moveTo(px,py);b.lineTo(ex,ey);b.strokeStyle='#b8c59c70';b.lineWidth=.45;b.stroke();b.fillStyle=k%3===0?'#b59ac7':'#dbe2bf';b.beginPath();b.ellipse(ex,ey,rand(.8,2),rand(1.3,2.7),rand(-1,1),0,7);b.fill()}}
 // Render by depth so individual flower shapes remain legible.
 for(const [x,y,r,c,type]of blooms)flower(x,y,r,c,type);
 for(const [x,y,r,a]of [[367,337,36,-.35],[414,382,42,.18],[427,433,39,.5],[376,403,30,-.55]])orchid(x,y,r,a);
 for(const [x,y]of [[529,293],[326,649],[548,500]]){stem(x,y,1.6);const g=b.createRadialGradient(x-3,y-5,1,x,y,13);g.addColorStop(0,'#ff6d67');g.addColorStop(.5,'#cf384e');g.addColorStop(1,'#8f2849');b.fillStyle=g;b.beginPath();b.ellipse(x,y,10,15,.2,0,7);b.fill();for(let i=0;i<36;i++){const a=i*2.4,d=Math.sqrt(i/36);b.fillStyle=i%3?'#f9a096':'#ffdcbd';b.beginPath();b.ellipse(x+Math.cos(a)*d*8,y+Math.sin(a)*d*12,.5,1,0,0,7);b.fill()}}
 // Folded organza at the gathered base.
 b.beginPath();b.moveTo(220,612);b.bezierCurveTo(299,660,339,689,390,718);b.bezierCurveTo(460,677,527,662,583,586);b.bezierCurveTo(551,679,465,702,435,745);b.quadraticCurveTo(451,798,470,858);b.quadraticCurveTo(421,839,413,784);b.quadraticCurveTo(384,844,332,868);b.quadraticCurveTo(358,799,366,745);b.quadraticCurveTo(270,696,220,612);b.fillStyle='#b5e7e929';b.fill();b.strokeStyle='#b7e4e55c';b.lineWidth=.85;b.stroke();
 for(let i=0;i<13;i++){b.beginPath();b.moveTo(374+i*4,729);b.bezierCurveTo(347+i*7,773,383+i*4,814,346+i*9,861);b.strokeStyle=i%3?'#d0efea2b':'#e6faf159';b.lineWidth=i%3?.65:2;b.stroke()}
 b.beginPath();b.moveTo(361,737);b.quadraticCurveTo(403,750,438,731);b.strokeStyle='#d5e6dc';b.lineWidth=2;b.stroke();b.beginPath();b.moveTo(399,740);b.bezierCurveTo(342,710,330,758,396,742);b.bezierCurveTo(461,700,471,753,399,740);b.strokeStyle='#f0e9dbb3';b.lineWidth=2;b.stroke();
}
drawBouquet();let particles=[],amount=0,destination=0,loading=false,ready=false;let pointer={x:-1000,y:-1000};const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function makeParticles(){const a=b.getImageData(0,0,W,H).data,c=p.getImageData(0,0,W,H).data;const source=[];for(let y=70;y<875;y+=5)for(let x=110;x<690;x+=5){const i=(y*W+x)*4;if(a[i+3]>48)source.push({x,y,color:[a[i],a[i+1],a[i+2]],alpha:a[i+3]/255})}particles=[];let j=0;for(let y=170;y<730;y+=5)for(let x=125;x<675;x+=5){const i=(y*W+x)*4;if(c[i+3]<50)continue;const s=source[(j*7919)%source.length];particles.push({...s,tx:x,ty:y,target:[c[i],c[i+1],c[i+2]],phase:random()*7,delay:random()*.16});j++}ready=true}
function setImage(img){p.clearRect(0,0,W,H);const scale=Math.min(550/img.width,560/img.height);const w=img.width*scale,h=img.height*scale;p.drawImage(img,(W-w)/2,(H-h)/2,w,h);makeParticles()}
const sample=new Image();sample.onload=()=>setImage(sample);sample.onerror=()=>{document.querySelector('#status').textContent='示例图片未加载，请放入你自己的照片。'};sample.src='../lotus-calendar/assets/lotus.png';
function change(){if(!ready||loading)return;destination=destination?0:1;document.querySelector('#toggle').innerHTML=destination?'重新聚成花束 <span>↶</span>':'拆开这束花 <span>↗</span>';canvas.setAttribute('aria-pressed',String(!!destination));canvas.setAttribute('aria-label',destination?'重新聚成花束':'展开花束，显示图片');document.querySelector('#hint').textContent=destination?'原来，花里藏着这一刻。':'轻触花束，看看花里藏着什么。'}
document.querySelector('#toggle').onclick=change;canvas.onclick=change;canvas.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();change()}};canvas.onpointermove=e=>{let r=canvas.getBoundingClientRect();const scale=Math.min(r.width/W,r.height/H);pointer.x=(e.clientX-r.left-(r.width-W*scale)/2)/scale;pointer.y=(e.clientY-r.top-(r.height-H*scale)/2)/scale};canvas.onpointerleave=()=>{pointer.x=pointer.y=-1000};
document.querySelector('#choose').onclick=()=>document.querySelector('#photo').click();
document.querySelector('#photo').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>15*1024*1024){document.querySelector('#status').textContent='请选一张小于 15 MB 的图片。';e.target.value='';return}loading=true;const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{setImage(img);URL.revokeObjectURL(url);loading=false;document.querySelector('#status').textContent='照片已放进花里。仅在当前页面使用，刷新后恢复示例。';if(destination)change()};img.onerror=()=>{URL.revokeObjectURL(url);loading=false;document.querySelector('#status').textContent='这张图片暂时无法打开，请试试 JPG、PNG 或 WebP。'};img.src=url;e.target.value=''};
let last=0;function animate(time){const dt=Math.min((time-last)/1000,.04);last=time;amount=reduce?destination:amount+(destination-amount)*Math.min(dt*2.5,1);if(Math.abs(destination-amount)<.001)amount=destination;ctx.clearRect(0,0,W,H);const t=amount;const sway=reduce?0:Math.sin(time*.00065)*3+(pointer.x>0?(pointer.x-400)*.018:0);ctx.save();ctx.translate(sway*(1-t),0);if(t<.3){ctx.globalAlpha=1-t/.3;ctx.drawImage(bouquet,0,0)}ctx.globalAlpha=1;if(t>0&&t<1&&ready){for(const q of particles){let u=Math.min(1,Math.max(0,(t-q.delay)/(1-q.delay)));u=u*u*(3-2*u);const burst=Math.sin(u*Math.PI);let x=q.x+(q.tx-q.x)*u+Math.cos(q.phase)*burst*110,y=q.y+(q.ty-q.y)*u+Math.sin(q.phase)*burst*90;const d=Math.hypot(x-pointer.x,y-pointer.y);if(d<90&&d>0){x+=(x-pointer.x)/d*(90-d)*.25*(1-u);y+=(y-pointer.y)/d*(90-d)*.25*(1-u)}const c=q.color.map((v,i)=>Math.round(v+(q.target[i]-v)*u));ctx.fillStyle=`rgba(${c.join(',')},${Math.min(1,t*6,(1-t)*8)*.95})`;ctx.beginPath();ctx.ellipse(x,y,2.6,2.6+burst*2,q.phase+u*3,0,7);ctx.fill()}}if(t>.7){ctx.globalAlpha=(t-.7)/.3;ctx.shadowColor='#0009';ctx.shadowBlur=25;ctx.drawImage(picture,0,0)}ctx.restore();requestAnimationFrame(animate)}requestAnimationFrame(animate);
