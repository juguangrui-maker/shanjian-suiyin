// Local generated instrumental recordings with an independent continuous nature bed.
export const MUSIC = {
 preview:{file:'concert.mp3',title:'四时安和 · 山间试听',level:.8},
 camp:{file:'arrival.mp3',title:'山间清音 · 营地',level:.9},
 ritual:{file:'taisui.mp3',title:'岁音 · 天河水',level:.9},
 meditation:{file:'release.mp3',title:'静观 · 安顿',level:.55},
 wish:{file:'blessing.mp3',title:'水生木 · 祈愿',level:.8},
 spring:{file:'taisui.mp3',title:'天河水 · 春生',level:.9},
 summer:{file:'taisui.mp3',title:'天河水 · 夏长',level:.9},
 autumn:{file:'taisui.mp3',title:'天河水 · 秋收',level:.85},
 winter:{file:'taisui.mp3',title:'天河水 · 冬藏',level:.7},
 wealth:{file:'wealth.mp3',title:'土生金 · 丰愿',level:.8},
 love:{file:'love.mp3',title:'木生火 · 同心',level:.8},
 self:{file:'self.mp3',title:'六十星图 · 本命试听',level:.7},
 blessing:{file:'blessing.mp3',title:'水生木 · 祈福',level:.75},
 release:{file:'release.mp3',title:'静观 · 安顿解忧',level:.55},
};
export class Soundscape {
 constructor(){
  this.ctx=null;this.master=null;this.enabled=false;this.volume=.55;this.natureVolume=.03;
  this.scene='camp';this.current=null;this.buffers=new Map();this.loads=new Map();
  this.request=0;this.paused=false;this.hidden=false;this.loading=false;this.error='';this.onchange=()=>{};
 }
 get status(){return !this.enabled?'点击开启声音':this.hidden||this.paused?'声音已暂停':this.error?'自然声播放中 · 配乐待重试':this.loading?'自然声播放中 · 载入配乐':this.ctx?.state==='running'&&this.current?'正在播放':'点击恢复声音'}
 get level(){if(!this.enabled||this.ctx?.state!=='running')return 0;this.analyser.getFloatTimeDomainData(this.samples);return Math.min(1,Math.sqrt(this.samples.reduce((n,x)=>n+x*x,0)/this.samples.length)*5)}
 get title(){return MUSIC[this.scene].title}
 emit(){this.onchange({status:this.status,title:this.title,enabled:this.enabled})}
 init(){
  if(this.ctx)return;
  this.ctx=new (window.AudioContext||window.webkitAudioContext)();
  this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=256;this.samples=new Float32Array(256);this.analyser.connect(this.ctx.destination);
  this.master=this.ctx.createGain();this.master.gain.value=this.volume;this.master.connect(this.analyser);
  this.nature=this.ctx.createGain();this.nature.gain.value=this.natureVolume;this.nature.connect(this.analyser);
  this.ctx.onstatechange=()=>this.emit();this.buildNature();
 }
 buildNature(){
  const ctx=this.ctx,buffer=ctx.createBuffer(2,ctx.sampleRate*13,ctx.sampleRate);
  for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.025)/1.025;data[i]=brown*3;}}
  // Long, independent filtered noise loops give a soft breeze and steady stream.
  for(const [type,freq,level,offset] of [['lowpass',550,.75,0],['bandpass',1700,.36,4.3]]){
   const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
   source.buffer=buffer;source.loop=true;filter.type=type;filter.frequency.value=freq;filter.Q.value=.5;gain.gain.value=level;
   source.connect(filter).connect(gain).connect(this.nature);source.start(0,offset);
   const sway=ctx.createOscillator(),depth=ctx.createGain();sway.frequency.value=type==='lowpass'?.09:.31;depth.gain.value=level*.18;sway.connect(depth).connect(gain.gain);sway.start();
  }
  this.birdTimer=setInterval(()=>{if(this.enabled&&!this.paused&&!this.hidden&&ctx.state==='running'&&!['ritual','meditation','wish','release','winter'].includes(this.scene))this.bird()},14000);
 }
 bird(){
  const now=this.ctx.currentTime;
  for(let i=0;i<3;i++){
   const osc=this.ctx.createOscillator(),gain=this.ctx.createGain(),pan=this.ctx.createStereoPanner(),at=now+i*.23;
   pan.pan.value=Math.sin(now)*.7;osc.frequency.setValueAtTime(1900+i*130,at);osc.frequency.exponentialRampToValueAtTime(2900-i*100,at+.07);osc.frequency.exponentialRampToValueAtTime(2100,at+.16);
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.025,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+.19);
   osc.connect(gain).connect(pan).connect(this.nature);osc.start(at);osc.stop(at+.2);osc.onended=()=>{osc.disconnect();gain.disconnect();pan.disconnect()};
  }
 }
 async enable(){
  this.init();this.enabled=true;this.error='';
  if(!this.paused&&!this.hidden)await this.ctx.resume();
  this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.12);
  try{await this.switchTrack()}catch(e){this.loading=false;this.error='配乐暂时未能载入，请点击声音按钮重试。'}
  this.emit();return !this.error;
 }
 disable(){this.enabled=false;this.request++;this.loading=false;this.ctx?.suspend();this.emit()}
 toggle(){return this.enabled&&!this.error?(this.disable(),Promise.resolve(false)):this.enable()}
 setVolume(v){this.volume=Math.max(0,Math.min(1,Number(v)||0));if(this.master)this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.1);this.emit()}
 setNatureVolume(v){this.natureVolume=Math.max(0,Math.min(1,Number(v)||0));if(this.nature)this.nature.gain.setTargetAtTime(this.natureVolume,this.ctx.currentTime,.2);this.emit()}
 setScene(scene){if(!MUSIC[scene]||scene===this.scene)return;this.scene=scene;this.error='';this.emit();if(this.enabled)this.switchTrack().catch(()=>{this.loading=false;this.error='配乐切换失败，请点击声音按钮重试。';this.emit()})}
 setSeason(i){this.setScene(['spring','summer','autumn','winter'][i]||'spring')}
 setPaused(paused,hidden=false){
  if(this.paused===paused&&this.hidden===hidden)return;this.paused=paused;this.hidden=hidden;
  if(this.ctx){if(!this.enabled||paused||hidden)this.ctx.suspend();else this.ctx.resume().catch(()=>{});}this.emit();
 }
 async buffer(file){
  if(this.buffers.has(file))return this.buffers.get(file);if(this.loads.has(file))return this.loads.get(file);
  const pending=(async()=>{const response=await fetch(new URL(`music/${file}`,import.meta.url));if(!response.ok)throw new Error(`Music HTTP ${response.status}`);const decoded=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(file,decoded);while(this.buffers.size>3)this.buffers.delete(this.buffers.keys().next().value);return decoded})();
  this.loads.set(file,pending);try{return await pending}finally{this.loads.delete(file)}
 }
 async switchTrack(){
  const token=++this.request,track=MUSIC[this.scene];
  if(this.current?.file===track.file){this.loading=false;this.current.gain.gain.setTargetAtTime(track.level,this.ctx.currentTime,.6);this.emit();return}
  this.loading=true;this.emit();let decoded;
  try{decoded=await this.buffer(track.file)}catch(e){if(token!==this.request)return;throw e}
  if(token!==this.request||!this.enabled)return;
  const now=this.ctx.currentTime,source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=decoded;source.loop=true;
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(track.level,now+1.5);source.connect(gain).connect(this.master);source.start();
  const old=this.current;this.current={source,gain,file:track.file};
  if(old){old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(old.gain.gain.value,now);old.gain.gain.linearRampToValueAtTime(0,now+1.5);old.source.stop(now+1.55);old.source.onended=()=>{old.source.disconnect();old.gain.disconnect()}}
  this.loading=false;this.emit();
 }
 chime(freq=440){
  if(!this.ctx||!this.enabled||this.paused||this.hidden)return;const time=this.ctx.currentTime;
  for(let h=1;h<=3;h++){const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.frequency.value=freq*h;gain.gain.setValueAtTime(.055/(h*h),time);gain.gain.exponentialRampToValueAtTime(.0001,time+3);osc.connect(gain).connect(this.master);osc.start(time);osc.stop(time+3.1);osc.onended=()=>{osc.disconnect();gain.disconnect()}}
 }
}
