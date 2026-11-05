function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}function line(a,b,color,width=3){c.strokeStyle=color;c.lineWidth=width;c.lineCap='square';c.beginPath();c.moveTo(Math.round(a[0]),Math.round(a[1]));c.lineTo(Math.round(b[0]),Math.round(b[1]));c.stroke()}function poly(points,color){c.fillStyle=color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(Math.round(p[0]),Math.round(p[1])):c.moveTo(Math.round(p[0]),Math.round(p[1])));c.closePath();c.fill()}
function flower(x,y,seed,small=false){
 c.save();c.translate(x,y);if(small)c.scale(.68,.68);
 c.fillStyle='#8b77711c';c.beginPath();c.ellipse(1,3,10,2.6,0,0,Math.PI*2);c.fill();
 const positions=small?[[-8,-21],[1,-28],[9,-20]]:[[-11,-29],[-5,-39],[4,-34],[12,-26],[1,-24]];
 positions.forEach(([fx,fy],i)=>{
  const sway=Math.sin(ambient*.65+seed+i)*(.4+flowerPulse*2);fx+=sway;
  taper([0,-4],[fx*.6,fy*.55],.65,.4,'#7d9170');taper([fx*.6,fy*.55],[fx,fy],.4,.3,'#95a080');
  let lx=fx*.65,ly=fy*.55;
  silhouette([[lx,ly],[lx-6,ly-5],[lx-8,ly-5],[lx-6,ly-1]],'#899b7c');
  silhouette([[lx+1,ly+3],[lx+6,ly-2],[lx+8,ly-2],[lx+6,ly+2]],'#a3ae86');
  const petals=i%3===0?'#eed9d2':i%3===1?'#d7a6b5':'#e7bec7';
  for(let j=0;j<6;j++){const ang=j*Math.PI/3;oval(fx+Math.cos(ang)*2.5,fy+Math.sin(ang)*2.2,2.1,2.2,petals)}
  oval(fx,fy,1.8,1.8,'#f3e3c2');oval(fx-.4,fy-.3,.65,.7,'#cfad78');
  taper([fx-1,fy+2],[fx+2,fy+1],.3,.3,'#f8e9e1');
 });
 // A softly rounded, glazed ceramic pot.
 silhouette([[-6,-8],[6,-8],[5,2],[3,4],[-3,4],[-5,2]],'#b5aaa0');
 silhouette([[-5,-7],[4,-7],[3.5,1.5],[1.5,3],[-3,2]],'#ddd3c4');
 taper([-5,-7],[5,-7],.7,.7,'#eee5d8');oval(0,-8,6,1.6,'#e8e0d3');oval(0,-8,4.6,.7,'#9c9481');
 taper([-3.3,-5],[-3,0],.4,.35,'#f1eadf');
 c.restore();
}
function rug(){
 // Project the woven surface into a shallow perspective.
 const point=(u,v)=>[-134+244*u+35*v,6+35*v];
 const band=(u0,v0,u1,v1,color)=>silhouette([point(u0,v0),point(u1,v0),point(u1,v1),point(u0,v1)],color);
 c.fillStyle='#8d738a0c';c.beginPath();c.ellipse(8,38,161,17,0,0,Math.PI*2);c.fill();
 c.fillStyle='#78606c16';c.beginPath();c.ellipse(10,40,143,8,0,0,Math.PI*2);c.fill();
 silhouette([[-134,8],[110,8],[145,43],[-99,43]],'#b7a0a6');
 // Individual cotton tassels at the short edges.
 for(let i=0;i<17;i++){const v=.04+i*.057;const l=point(0,v),r=point(1,v);taper([l[0]-1,l[1]],[l[0]-5,l[1]+.3],.3,.2,'#d9c9b3');taper([r[0]+1,r[1]],[r[0]+5,r[1]-.2],.3,.2,'#d9c9b3')}
 band(0,0,1,1,'#dfcbbf');band(.012,.04,.988,.96,'#ad8f9f');band(.025,.085,.975,.915,'#eeded0');band(.04,.15,.96,.85,'#d3b6bd');band(.055,.19,.945,.81,'#e9d6cd');
 // Repeating botanical border, with sage leaves and rose-colored knots.
 for(let i=0;i<23;i++){let u=.055+i*.0395;for(const v of [.11,.89]){let [x,y]=point(u,v);silhouette([[x-2,y],[x,y-1],[x+2,y],[x,y+1]],i%2?'#ba8f9c':'#9eaa91')}}
 for(let i=0;i<6;i++){let v=.24+i*.103;for(const u of [.027,.973]){let [x,y]=point(u,v);oval(x,y,.9,.65,'#83947e')}}
 // Low-contrast lozenges keep the dancers readable over the pattern.
 for(let i=0;i<9;i++){let u=.105+i*.0975;let [x,y]=point(u,.5);
  silhouette([[x-8,y],[x,y-4],[x+8,y],[x,y+4]],'#d1b8c0');
  silhouette([[x-5,y],[x,y-2.8],[x+5,y],[x,y+2.8]],'#f0e1d5');
  oval(x,y,1.5,.85,'#bd939f');
  for(const v of [.29,.71]){let [lx,ly]=point(u,v);silhouette([[lx-2,ly],[lx,ly-1],[lx+2,ly],[lx,ly+1]],'#aeb39a')}
 }
 // Fine alternating yarn highlights.
 for(let i=0;i<30;i++){let v=.03+i*.032;const a=point(.01,v),b=point(.99,v);taper(a,b,.09,.09,i%2?'#fff8e921':'#8f6c7c0c')}
 taper(point(0,0),point(1,0),.45,.45,'#f2e6d8');taper(point(0,1),point(1,1),.5,.5,'#c7adb3');
 flower(-124,4,1);flower(122,12,4);flower(-131,33,2,true);flower(141,40,3,true);
}
// Fine-grid silhouettes: tapered limbs, articulated ballet poses and a small front-facing head.
function silhouette(points,color){c.fillStyle=color;c.beginPath();points.forEach((p,i)=>{const x=Math.round(p[0]*2)/2,y=Math.round(p[1]*2)/2;i?c.lineTo(x,y):c.moveTo(x,y)});c.closePath();c.fill()}
function oval(x,y,rx,ry,color){silhouette([[x-rx,y-ry*.45],[x-rx*.65,y-ry],[x+rx*.6,y-ry],[x+rx,y-ry*.35],[x+rx,y+ry*.4],[x+rx*.5,y+ry],[x-rx*.45,y+ry],[x-rx,y+ry*.35]],color)}
function taper(a,b,wa,wb,color){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;silhouette([[a[0]+nx*wa,a[1]+ny*wa],[b[0]+nx*wb,b[1]+ny*wb],[b[0]-nx*wb,b[1]-ny*wb],[a[0]-nx*wa,a[1]-ny*wa]],color)}
