const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const noop=()=>{},ctx=new Proxy({},{get:(_,k)=>noop,set:()=>true});
function element(){return {textContent:'',value:0,hidden:false,dataset:{},style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,replaceChildren:noop,addEventListener:noop,getContext:()=>ctx};}
const nodes=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>['#'+m[1],element()]));
const doc={hidden:false,body:element(),addEventListener:noop,createElement:element,querySelectorAll:()=>[],querySelector:selector=>{if(selector.startsWith('#'))assert(nodes.has(selector),`missing DOM ${selector}`);if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);}};
let spoken=[],cancelled=0;
const sandbox={document:doc,window:{matchMedia:()=>({matches:false}),addEventListener:noop,speechSynthesis:{cancel:()=>cancelled++,getVoices:()=>[],speak:u=>spoken.push(u.text)}},SpeechSynthesisUtterance:function(text){this.text=text;},localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,console};
vm.createContext(sandbox);
for(const f of ['art.js','lessons.js','dance.js'])vm.runInContext(fs.readFileSync(f,'utf8'),sandbox,{filename:f});
const run=code=>vm.runInContext(code,sandbox);
const sample=(id,beat)=>run(`lessonId=${JSON.stringify(id)};teachingSample(${beat}*60/lessonData().bpm)`);
const near=(a,b,tol=1e-5)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
// Validate finite coordinates and continuous poses throughout all lessons, including phrase boundaries.
for(const id of ['tendu','arms','plie','saute']){
 const n=run(`LESSONS.${id}.counts`);let prev;
 for(let b=0;b<=n;b+=.01){const p=sample(id,b).pose;for(const v of Object.values(p))for(const x of Array.isArray(v)?v:[v])assert(Number.isFinite(x));if(prev)for(const key of ['foot','other','toe','otherToe','hip','l','r','le','re'])for(let i=0;i<2;i++)assert(Math.abs(p[key][i]-prev[key][i])<.55,`${id} discontinuity at ${b}: ${key}`);prev=p;}
}
// Tendu: four repetitions in each direction, holds on counts two and four; the support stays still.
for(let section=0;section<4;section++)for(let rep=0;rep<4;rep++){
 let start=section*16+rep*4,a=sample('tendu',start+1.2).pose,b=sample('tendu',start+1.8).pose,c=sample('tendu',start+3.5).pose;
 for(let i=0;i<2;i++){near(a.foot[i],b.foot[i]);near(c.foot[i],[1.5,-2][i]);near(a.otherToe[i],[-6,0][i]);}
}
// Both forefeet stay grounded during demi-plie and releve; both ankles rise equally.
for(let b=0;b<32;b+=.05){const p=sample('plie',b).pose;near(p.toe[1],0);near(p.otherToe[1],0);near(p.foot[1],p.other[1]);}
assert(sample('plie',13).pose.rise===1);assert(sample('plie',2).pose.bend===1);
// Sautes: 24 jumps total, simultaneous landings, planted support foot during right/left lead transitions.
for(let section=0;section<4;section++){
 for(let j=0;j<6;j++){const p=sample('saute',section*8+j+.4).pose;assert(p.jump>4);near(p.toe[1],p.otherToe[1]);}
 for(let b=6;b<8;b+=.02){const p=sample('saute',section*8+b).pose;near(p.toe[1],0);near(p.otherToe[1],0);const support=section<2?p.foot:p.other;near(support[0]+p.x/1.4,section<2?3:-3);}
}
// Key arm endpoints and final low arms.
for(const [b,name] of [[2,'first'],[4,'fifth'],[6,'second'],[8,'low']]){const p=sample('arms',b).pose,expected=run(`arms.${name}`);near(p.l[0],expected.l[0]);near(p.l[1],expected.l[1]);}
// Integration: start / seek / pause / resume / rate / completion and voice cancellation.
run("enterLesson('arms');play.onclick()");assert.equal(run('state'),'performing');assert.equal(spoken.length,1);
run('seekLesson(8)');assert.equal(spoken.length,2);run('play.onclick()');assert.equal(run('paused'),true);const count=spoken.length;
run('lessonStatus()');assert.equal(spoken.length,count);run('play.onclick()');assert.equal(spoken.length,count+1);
run("lessonRate=.5;t=1;last=1000;draw(1040)");near(run('t'),1.02);
run("t=lessonData().counts*60/lessonData().bpm-.01;last=1040;draw(1080)");assert.equal(run('state'),'idle');assert.equal(run('lessonComplete'),true);assert(cancelled>0);
run('play.onclick()');near(run('t'),0);assert.equal(run('lessonComplete'),false);
run("seekLesson(4);beginTransition('settling');stateTime=1.79;last=1080;draw(1120)");assert.equal(run('state'),'idle');
console.log('PASS: four complete timelines, count holds, grounded feet, 24 jumps, lead-foot transitions, speech lifecycle, pause/seek/rate/end/replay.');
// Check the geometry actually drawn, especially elbows crossing shoulder height.
let maxElbowStep=0;
for(const id of ['tendu','arms','plie','saute']){
 let prev;
 for(let beat=0;beat<run(`LESSONS.${id}.counts`);beat+=.01){
  const p=sample(id,beat).pose;
  const elbows=run(`[-1,1].map(side=>armGeometry(side,side<0?${JSON.stringify(p.l)}:${JSON.stringify(p.r)},side<0?${JSON.stringify(p.le)}:${JSON.stringify(p.re)}).elbow)`);
  if(prev)for(let i=0;i<2;i++)maxElbowStep=Math.max(maxElbowStep,Math.hypot(elbows[i][0]-prev[i][0],elbows[i][1]-prev[i][1]));prev=elbows;
 }
}
assert(maxElbowStep<.8,`elbow pop: ${maxElbowStep}`);
const before=run('legGeometry([2,-30.46],[3,-2],1,.009).knee'),after=run('legGeometry([2,-30.44],[3,-2],1,.011).knee');assert(Math.hypot(before[0]-after[0],before[1]-after[1])<.03,'knee switches at former bend threshold');
console.log(`PASS: drawn elbow continuity (max ${maxElbowStep.toFixed(3)} per .01 beat) and knee threshold.`);
