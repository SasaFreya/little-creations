'use strict';
const RBS_SOURCE='https://www.royalballetschool.org.uk/wp-content/uploads/2024/09/video-audition-guide-11-years-old-2024.pdf';
const PBT_SOURCE='https://pbt.org/community/resources-audience-members/ballet-101/basic-ballet-positions/';
const LESSONS={
 tendu:{title:'扶把擦地组合',fr:'Battement tendu · en croix',counts:64,bpm:64,source:RBS_SOURCE,sourceName:'英国皇家芭蕾舞学校 · 公开指南，第 2 页',basis:'沿用左腿、三位脚、前—旁—后—旁的顺序和四拍节奏；手位与扶把为插画适配。',chapters:['前擦地 × 4','旁擦地 × 4','后擦地 × 4','旁擦地 × 4'],starts:[0,16,32,48],narration:['左腿向前擦地。第一拍擦出，第二拍保持，第三拍收回三位，第四拍停住。重复四次。','现在左腿向旁擦地。脚尖沿地面滑出，膝盖伸展；身体留在支撑腿上。仍是四拍一次。','换成向后擦地。脚尖贴着地面，骨盆保持稳定。伸出，保持，收回，再保持。','最后回到旁擦地。再做四次，按原路收回三位。注意每次收脚，都要完整。']},
 arms:{title:'中间手臂组合',fr:'Port de bras · 16 counts',counts:16,bpm:56,source:RBS_SOURCE,sourceName:'英国皇家芭蕾舞学校 · 公开指南，第 3 页',basis:'节选中间 Port de bras 的前 16 拍：三位脚准备，低位—一位—五位—二位—低位，共两遍；朝向简化为正面。',chapters:['一位 → 五位 → 二位 → 低位','同样的路径，再做一遍'],starts:[0,8],narration:['三位脚。两拍一位，两拍五位，两拍打开，两拍放下。','再做一遍。肩放松，手臂圆润，沿弧线经过。']},
 plie:{title:'半蹲与半脚尖',fr:'Demi-plié · Relevé',counts:32,bpm:60,source:PBT_SOURCE,sourceName:'匹兹堡芭蕾舞团 · 基础动作教学',basis:'依据 PBT 对半蹲和半脚尖的动作说明编排的 32 拍基础练习，节拍为本项目编排。',chapters:['一位半蹲 × 2','半蹲 → 提踵 → 落下','再做两次半蹲','提踵平衡 → 收势'],starts:[0,8,16,24],narration:['两拍半蹲，两拍伸直，做两次。膝对脚尖，脚跟贴地。','半蹲，伸腿提踵，前脚掌上稳住，再落下。','再做两次半蹲。上身直立，伸展双腿。','半蹲后提踵，停稳两拍，再慢慢落下。']},
 saute:{title:'一位、二位小跳',fr:'Sautés · 32 counts',counts:32,bpm:76,source:RBS_SOURCE,sourceName:'英国皇家芭蕾舞学校 · 公开指南，第 4 页',basis:'沿用原组合的 32 拍顺序：每组前 6 拍为六次小跳，第 7、8 拍擦地换脚位；左右腿分别引导换位。减速示意。',chapters:['一位跳 6 次 → 右腿开二位','二位跳 6 次 → 收一位','一位跳 6 次 → 左腿开二位','二位跳 6 次 → 收一位'],starts:[0,8,16,24],narration:['一位六次跳。七拍右腿擦出，八拍落下。','二位六次跳。七、八拍，右腿收回一位。','一位六次跳。七拍左腿擦出，八拍落下。','二位六次跳。左腿收回一位，完成。']}
};
let lessonId='tendu',lessonVoice=false,lessonRate=1,spokenKey='',speechReady=false,lessonComplete=false,speechGeneration=0;
const lessonData=()=>LESSONS[lessonId];
const lessonBeats=time=>clamp(time*lessonData().bpm/60,0,lessonData().counts-.00001);
function teachingSample(time){
 const d=lessonData(),beat=lessonBeats(time),p=pose({lesson:1,l:[-20,-42],r:[24,-46],le:[-12,-43],re:[14,-48],foot:[1.5,-2],other:[-2,-2],toe:[5.5,0],otherToe:[-6,0],hip:[0,-30.5]});
 let action='',detail='',feet='',hands='',chapter=0,phase='';
 if(lessonId==='tendu'){
  chapter=Math.min(3,Math.floor(beat/16));let b=beat%4,reach=b<1?smooth(b):b<2?1:b<3?1-smooth(b-2):0;
  const openFeet=[[6,0],[14,-3],[-2,-5],[14,-3]],openToes=[[10,3],[18,0],[-5,-3],[18,0]],names=['前','旁','后','旁'],french=['devant','à la seconde','derrière','à la seconde'];
  p.foot=p.foot.map((v,i)=>lerp(v,openFeet[chapter][i],reach));p.toe=p.toe.map((v,i)=>lerp(v,openToes[chapter][i],reach));p.depth=chapter===2?-reach:reach*.4;
  phase=['擦出','保持','收回三位','保持'][Math.floor(b)];action=`${names[chapter]}擦地 · ${french[chapter]}`;detail=`第 ${Math.floor((beat%16)/4)+1} / 4 次：${phase}。脚尖始终沿地面滑行，保持膝盖伸展。`;feet='三位脚 → 擦出 → 三位脚';hands='舞者右手扶把，左臂二位';
 }else if(lessonId==='arms'){
  chapter=Math.floor(beat/8);let b=beat%8,step=Math.floor(b/2),u=(1-Math.cos(Math.PI*(b%2)/2))/2,keys=['low','first','fifth','second','low'];Object.assign(p,{l:arms[keys[step]].l.map((v,i)=>lerp(v,arms[keys[step+1]].l[i],u)),r:arms[keys[step]].r.map((v,i)=>lerp(v,arms[keys[step+1]].r[i],u)),le:arms[keys[step]].le.map((v,i)=>lerp(v,arms[keys[step+1]].le[i],u)),re:arms[keys[step]].re.map((v,i)=>lerp(v,arms[keys[step+1]].re[i],u))});
  action=['到一位','到五位','打开二位','落回低位'][step];detail='每个手位用两拍连续经过；肩膀下沉，肘部柔和。';feet='三位脚，重心稳定';hands=action;phase=action;
 }else if(lessonId==='plie'){
  chapter=Math.floor(beat/8);let b=beat%8;Object.assign(p,{foot:[3,-2],other:[-3,-2],toe:[7,0],otherToe:[-7,0],l:arms.low.l,r:arms.low.r,le:arms.low.le,re:arms.low.re});
  if(chapter%2===0){let z=b%4;p.bend=z<2?smooth(z/2):1-smooth((z-2)/2);action='一位半蹲 · Demi-plié';phase=z<2?'屈膝向下':'伸展双腿';detail='脚跟不离地，双膝跟随脚尖方向；上身保持直立。';}
  else{p.bend=b<2?smooth(b/2):b<4?1-smooth((b-2)/2):0;p.rise=b<2?0:b<4?smooth((b-2)/2):b<6?1:1-smooth((b-6)/2);action='半脚尖 · Relevé';phase=b<2?'先半蹲':b<4?'伸腿，提脚跟':b<6?'前脚掌上保持':'慢慢落下';detail='足跟抬起，前脚掌承重。请区分半脚尖与足尖。';}
  feet='一位脚，双脚共同承重';hands='双臂保持低位';p.hip=[0,-30.5+p.bend*5-p.rise*2];p.foot[1]-=p.rise*2;p.other[1]-=p.rise*2;
 }else{
  chapter=Math.min(3,Math.floor(beat/8));
  const b=beat%8,opening=chapter%2===0,lead=chapter<2?-1:1;
  let center=opening?0:lead*6,left=opening?3:(lead<0?3:15),right=opening?-3:(lead<0?-15:-3);
  Object.assign(p,{l:arms.low.l,r:arms.low.r,le:arms.low.le,re:arms.low.re});
  if(b<6){
   const f=b%1;
   // Each pulse starts and ends straight: prepare, take off, land, recover.
   p.jump=f>=.22&&f<.60?5*Math.sin((f-.22)/.38*Math.PI):0;
   p.bend=f<.22?.5*Math.sin(f/.22*Math.PI):f>=.60?.5*Math.sin((f-.60)/.40*Math.PI):0;
   phase=p.jump>.1?'空中伸展':f<.22?'半蹲起跳':'落地缓冲';
   action=`${opening?'一位':'二位'}小跳 · Sauté`;detail=`第 ${Math.floor(b)+1} / 6 跳。双脚一起起跳、落地，落地用半蹲缓冲。`;
  }else{
   const u=smooth(clamp(b-6,0,1)),v=smooth(clamp(b-7,0,1));
   if(opening){if(lead<0)right=-3-12*u;else left=3+12*u;center=lead*6*v;}
   else{center=lead*6*(1-u);if(lead<0)right=-15+12*v;else left=15-12*v;}
   phase=opening?(b<7?'工作腿擦出':'落脚，重心移向中间'):(b<7?'移重心，工作脚伸展':'沿地面收回一位');
   action=opening?'擦地开二位':'擦地收一位';detail=`舞者${lead<0?'右':'左'}腿引导。支撑脚留在原地，工作脚沿地面移动。`;
  }
  p.x=center*1.4;
  Object.assign(p,{foot:[left-center,-2-p.jump],other:[right-center,-2-p.jump],toe:[left-center+4,-p.jump],otherToe:[right-center-4,-p.jump]});
  if(b>=6){const toeRise=opening?Math.sin(clamp((b-6)/2,0,1)*Math.PI):Math.sin(clamp(b-6,0,1)*Math.PI/2)*(1-smooth(clamp(b-7,0,1)));if(lead>0)p.foot[1]-=toeRise;else p.other[1]-=toeRise;}
  feet=opening?'一位脚 → 二位脚':'二位脚 → 一位脚';hands='双臂低位';p.hip=[0,-30.5+p.bend*5-p.jump];
 }
 return {pose:p,label:phase,progress:beat/d.counts,beat,chapter,action,detail,feet,hands};
}
function teachingLegs(p,skin,shadow){
 const working=()=>drawLeg([p.hip[0]+2,p.hip[1]],p.foot,p.toe,1,p.bend,skin),support=()=>drawLeg([p.hip[0]-2,p.hip[1]],p.other,p.otherToe,-1,p.bend,shadow);
 if(p.depth<-.1){working();support();}else{support();working();}
}
function teachingBarre(){taper([-95,-36],[-26,-36],1.2,1.2,'#b6a18c');taper([-89,-34],[-89,7],.8,.8,'#bdafa1');taper([-42,-34],[-42,7],.8,.8,'#bdafa1');taper([-95,-37],[-26,-37],.3,.3,'#eee0ca');}
function teachingFloor(){if(lessonId!=='tendu')return;c.save();c.translate(7,25);for(const [x,y,label] of [[14,6,'前'],[28,0,'旁'],[-9,-7,'后']]){taper([2,0],[x,y],.18,.18,'#b89db180');c.fillStyle='#a68b9f';c.font='4px -apple-system';c.fillText(label,x+1,y+1);}c.restore();}
function updateVoiceButton(){document.querySelector('#voice').setAttribute('aria-pressed',String(lessonVoice));document.querySelector('#voice').textContent=lessonVoice?'◉ 中文语音已开':'◎ 开启中文语音';}
function cancelLessonSpeech(){speechGeneration++;if('speechSynthesis' in window)window.speechSynthesis.cancel();spokenKey='';}
function narrateLesson(force=false){
 if(mode!=='lesson'||paused||state!=='performing'||!lessonVoice||!speechReady||document.hidden)return;
 const sample=teachingSample(t),chapterStart=lessonData().starts[sample.chapter];
 const cue=lessonId==='arms'?Math.floor(sample.beat/2):sample.chapter;
 const key=lessonId+':'+cue;
 if(!force&&spokenKey===key)return;spokenKey=key;
 if(!('speechSynthesis' in window)){document.querySelector('#voice-note').textContent='浏览器暂不支持语音；同步字幕仍可使用。';return;}
 let text=lessonData().narration[sample.chapter];
 if(lessonId==='arms')text=['一位，手臂抱圆。','五位，肩膀放松。','二位，向两侧打开。','低位，沿弧线放下。'][cue%4];
 else if(sample.beat-chapterStart>.5)text=sample.action+'。'+sample.label+'。';
 const synth=window.speechSynthesis;const generation=++speechGeneration;synth.cancel();let u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';
 const voices=synth.getVoices(),voice=voices.find(v=>/zh[-_]CN/i.test(v.lang))||voices.find(v=>/^zh/i.test(v.lang));if(voice)u.voice=voice;
 u.rate=clamp(1.16*lessonRate,.65,1.45);
 u.onstart=()=>{if(generation===speechGeneration)document.querySelector('#voice-note').textContent='语音讲解：'+text;};
 u.onend=()=>{if(generation===speechGeneration)document.querySelector('#voice-note').textContent='跟着节拍继续，下一段会接着讲解。';};
 u.onerror=e=>{if(generation===speechGeneration&&!['interrupted','canceled'].includes(e.error))document.querySelector('#voice-note').textContent='语音暂不可用，请看同步字幕。';};synth.speak(u);
}
function lessonStatus(){
 if(mode!=='lesson')return;const d=lessonData(),v=teachingSample(t),count=Math.min(d.counts,Math.floor(v.beat)+1);
 document.querySelector('#lesson-action').textContent=v.action;document.querySelector('#lesson-detail').textContent=v.detail;document.querySelector('#lesson-phase').textContent=state==='idle'?(lessonComplete?'组合完成 · 可重播':'准备好后，点击开始讲解示范'):v.label;
 document.querySelector('#lesson-feet').textContent=v.feet;document.querySelector('#lesson-hands').textContent=v.hands;
 document.querySelector('#count-total').textContent=`${lessonComplete?d.counts:count} / ${d.counts} 拍`;
 document.querySelectorAll('.beat-dot').forEach((b,i)=>b.classList.toggle('current',state==='performing'&&!lessonComplete&&i===Math.floor(v.beat)%8));
 document.querySelectorAll('[data-chapter]').forEach((b,i)=>{b.classList.toggle('active',i===v.chapter);b.setAttribute('aria-current',i===v.chapter?'step':'false');});
 if(lessonComplete)document.querySelector('#voice-note').textContent='这一组完成了。可以重播，也可以选择下一组。';else if(paused)document.querySelector('#voice-note').textContent='已暂停。继续时，从当前动作接着讲解。';
 document.querySelector('#lesson-seek').value=lessonComplete?d.counts:v.beat;document.querySelector('#lesson-seek').setAttribute('aria-valuetext',`第 ${count} 拍，共 ${d.counts} 拍`);
 narrateLesson();
}
function mountLesson(){
 const d=lessonData();document.querySelector('#lesson-title').textContent=d.title;document.querySelector('#lesson-fr').textContent=d.fr;document.querySelector('#lesson-basis').textContent=d.basis;const a=document.querySelector('#lesson-source');a.textContent=d.sourceName;a.href=d.source;
 document.querySelector('#lesson-seek').max=d.counts;document.querySelector('#lesson-chapters').replaceChildren(...d.chapters.map((name,i)=>{let b=document.createElement('button');b.type='button';b.dataset.chapter=i;b.textContent=`${i+1}. ${name}`;b.onclick=()=>seekLesson(d.starts[i]);return b;}));
 document.querySelectorAll('[data-lesson]').forEach(b=>{b.classList.toggle('active',b.dataset.lesson===lessonId);b.setAttribute('aria-pressed',String(b.dataset.lesson===lessonId));});
 lessonStatus();
}
function enterLesson(id=lessonId){cancelLessonSpeech();lessonId=id;mode='lesson';state='idle';t=0;stateTime=0;paused=false;lessonComplete=false;document.body.classList.add('teaching');document.querySelector('#lesson-panel').hidden=false;document.querySelector('#program-title').textContent='芭蕾小课堂';document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});document.querySelector('#classroom').setAttribute('aria-pressed','true');document.querySelector('#voice-note').textContent=speechReady?(lessonVoice?'中文语音已开启，点击开始示范。':'语音已关闭，同步字幕可用。'):'点击开始后，可用中文语音配合同步字幕。';mountLesson();updateUI();render();}
function seekLesson(beat){cancelLessonSpeech();t=clamp(beat,0,lessonData().counts-.001)*60/lessonData().bpm;lessonComplete=false;if(state!=='performing'){state='performing';paused=true;}lessonStatus();render();updateUI();}
function initLessons(){
 document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>enterLesson(b.dataset.lesson));document.querySelector('#classroom').onclick=()=>enterLesson();
 document.querySelector('#voice').onclick=()=>{speechReady=true;lessonVoice=!lessonVoice;document.querySelector('#voice').setAttribute('aria-pressed',String(lessonVoice));document.querySelector('#voice').textContent=lessonVoice?'◉ 中文语音已开':'◎ 开启中文语音';document.querySelector('#voice-note').textContent=lessonVoice?'中文语音使用浏览器提供的声音；也可随时看字幕。':'语音已关闭，字幕和示范继续同步。';if(lessonVoice)narrateLesson(true);else cancelLessonSpeech();};
 document.querySelector('#lesson-speed').onchange=e=>{lessonRate=+e.target.value;cancelLessonSpeech();narrateLesson(true);};
 document.querySelector('#lesson-seek').oninput=e=>seekLesson(+e.target.value);
 document.querySelector('#previous-eight').onclick=()=>seekLesson(Math.max(0,(Math.floor(lessonBeats(t)/8)-1)*8));document.querySelector('#replay-eight').onclick=()=>seekLesson(Math.floor(lessonBeats(t)/8)*8);document.querySelector('#next-eight').onclick=()=>seekLesson(Math.min(lessonData().counts-8,(Math.floor(lessonBeats(t)/8)+1)*8));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelLessonSpeech();else if(mode==='lesson')narrateLesson(true);});window.addEventListener('pagehide',cancelLessonSpeech);enterLesson();
}
