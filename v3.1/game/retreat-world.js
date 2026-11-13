import {T,mesh,label} from './world.js';
import {COURTS} from './retreat-data.js';
import {JIAZI} from './jiazi-data.js';
import {buildFestivalStage} from './festival-stage.js';
const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.85,...extra});
const boxGeo=new T.BoxGeometry(1,1,1),cylGeo=new T.CylinderGeometry(1,1,1,24);
const m={wood:material('#655f4f'),stone:material('#b2b1a0'),gold:material('#bea77b',{metalness:.4}),dark:material('#243e40'),light:material('#f9dda0',{emissive:'#f3bd6f',emissiveIntensity:.8}),path:material('#c2b89b'),deck:material('#867f66')};
const box=(p,mat,x,y,z,a,b,c)=>mesh(boxGeo,mat,p,x,y,z,a,b,c);
const cyl=(p,mat,x,y,z,a,b,c=a)=>mesh(cylGeo,mat,p,x,y,z,a,b,c);
function sign(p,text,x,y,z,size=4){const s=label(text,size);s.position.set(x,y,z);p.add(s);return s}
function road(p,a,b,w=3){const d=Math.hypot(b[0]-a[0],b[1]-a[1]);const o=box(p,m.path,(a[0]+b[0])/2,.015,(a[1]+b[1])/2,w,.025,d);o.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);o.castShadow=false;return o}
function lamp(p,x,z){const g=new T.Group();p.add(g);g.position.set(x,0,z);cyl(g,m.wood,0,.65,0,.04,1.3);box(g,m.light,0,1.45,0,.28,.4,.28);box(g,m.gold,0,1.7,0,.4,.07,.4)}
function pavilion(p,x,z,name,color='#b3a58c',r=4){const g=new T.Group();p.add(g);g.position.set(x,0,z);cyl(g,m.deck,0,.1,0,r,.2);for(const a of [-1,1])for(const b of [-1,1])cyl(g,m.wood,a*(r-.9),1.6,b*(r-.9),.09,3.2);const roof=mesh(new T.ConeGeometry(r*1.35,1.3,4),material(color),g,0,3.55,0);roof.rotation.y=Math.PI/4;sign(g,name,0,2.65,r-.1,3.7);cyl(g,m.wood,0,.7,0,1.1,.12);for(let i=0;i<4;i++){const a=i*Math.PI/2;cyl(g,m.stone,Math.sin(a)*1.7,.32,Math.cos(a)*1.7,.38,.6)}lamp(g,-r,r);lamp(g,r,r);return g}
export function expandRetreat(world){
 const g=new T.Group();world.outdoor.add(g);world.expansion=g;
 world.ground.geometry.dispose();world.ground.geometry=new T.PlaneGeometry(330,330);world.ground.material.color.set('#718a75');
 // Keep the central V1 ceremonial village; move the surrounding mountain ring outward.
 const mountains=world.outdoor.children.find(o=>o.type==='Group'&&o.children.length===25);
 if(mountains)mountains.children.forEach(o=>{o.position.x*=1.8;o.position.z*=1.8;o.scale.y=1.3});
 world.treeGroup.children.forEach(t=>{if(Math.abs(t.position.x)>27||t.position.z< -28||(t.position.z>24&&Math.abs(t.position.x)<24)||Math.hypot(t.position.x+66,t.position.z-42)<27)t.visible=false});
 const courts=[];
 for(const [element,c] of Object.entries(COURTS)){
  const court=new T.Group();court.position.set(c.x,0,c.z);g.add(court);courts.push(court);
  const lawn=cyl(court,material(c.color),0,-.025,0,21,.04);lawn.castShadow=false;
  const ring=mesh(new T.RingGeometry(9.6,11.2,80),m.path,court,0,.028,0);ring.rotation.x=-Math.PI/2;
  const art=mesh(new T.TorusGeometry(1.9,.075,8,40),m.gold,court,0,3,0);art.rotation.y=.35;
  cyl(court,m.stone,0,.12,0,3,.24);sign(court,c.name+' · '+c.tone,0,5.8,0,5);
  const list=JIAZI.filter(t=>t.element===element);
  list.forEach((t,i)=>{
   // Two rings: doors face toward the garden center.
   const a=(i%6)*Math.PI/3+(i>=6?Math.PI/6:0),r=i>=6?18:12.9;
   const x=Math.sin(a)*r,z=Math.cos(a)*r;
   const tent=new T.Group();tent.position.set(x,0,z);tent.rotation.y=a+Math.PI;court.add(tent);
   cyl(tent,m.deck,0,.12,0,2.55,.24);
   const shell=mesh(new T.SphereGeometry(2.4,20,10,0,Math.PI*2,0,Math.PI/2),material(c.color),tent,0,.22,0,1,.9,1);shell.castShadow=false;
   const ribs=[];for(let k=0;k<12;k++)for(let j=0;j<12;j++){const aa=k*Math.PI/6,p=j/12*Math.PI/2,q=(j+1)/12*Math.PI/2;for(const v of [p,q])ribs.push(2.42*Math.sin(v)*Math.cos(aa),.22+2.18*Math.cos(v),2.42*Math.sin(v)*Math.sin(aa))}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(ribs,3));tent.add(new T.LineSegments(geo,new T.LineBasicMaterial({color:'#d9cbb0',transparent:true,opacity:.55})));
   box(tent,m.dark,0,.93,2.37,1.05,1.7,.08);box(tent,m.light,0,.93,2.43,.72,1.5,.03);
   cyl(tent,m.gold,0,2.5,0,.09,.35);sign(tent,t.name,0,2.05,2.6,1.8);
   const dx=c.x+x-Math.sin(a)*3.3,dz=c.z+z-Math.cos(a)*3.3;
   t.x=dx;t.z=dz;t.court=c.name;
   world.locations.push({id:'jiazi-'+t.number,name:t.name+' · '+t.nayin,x:dx,z:dz,radius:2,action:'入帐听音',jiazi:t});
   world.collisions.push({x:c.x+x,z:c.z+z,r:2.55});
   if(i>=6)road(court,[x-Math.sin(a)*2.5,z-Math.cos(a)*2.5],[Math.sin(a)*10.5,Math.cos(a)*10.5],1.2);
   lamp(court,Math.sin(a)*9.2,Math.cos(a)*9.2);
  });
 }
 // Broad promenade stitches the five gardens together without forced narrow crossings.
 [[[-22,-12],[-50,-12]],[[-50,-12],[-37,-40]],[[-37,-40],[-37,-62]],[[-37,-62],[10,-66]],[[10,-66],[57,-36]],[[57,-36],[59,25]],[[59,25],[20,32]],[[20,32],[0,35]],[[8,-25],[10,-45]],[[10,-45],[10,-66]],[[-12,25],[-43,35]],[[-43,35],[-50,-12]]].forEach(([a,b])=>road(g,a,b,3.2));
 // Lake promenade to the east of the original stream; the destination transport is step-free.
 const lake=mesh(new T.CircleGeometry(10,64),material('#7fa9a5',{metalness:.35,roughness:.2}),g,32,-.01,-27);lake.rotation.x=-Math.PI/2;
 const dock=box(g,m.deck,30,.18,-20,12,.2,3);dock.rotation.y=.2;
 pavilion(g,-36,20,'山 客 衣 橱','#80958c');pavilion(g,-36,33,'山 间 茶 舍','#a69879');pavilion(g,-13,37,'入 山 礼 宾','#a4ad98',3.5);pavilion(g,15,37,'听 风 歇 脚','#8d9e95',3.5);
 [{id:'wardrobe',name:'山客衣橱',x:-36,z:25,action:'更换行衣'},{id:'tea',name:'山间茶舍',x:-36,z:38,action:'饮茶歇脚'},{id:'services',name:'入山礼宾',x:-13,z:42,action:'选择行程与服务'},{id:'rest',name:'听风歇脚亭',x:15,z:42,action:'安静歇脚'}].forEach(p=>world.locations.push({...p,radius:3}));
 for(const [x,z,r] of [[-36,20,3],[-36,33,3],[-13,37,2.5],[15,37,2.5]])world.collisions.push({x,z,r});
 buildFestivalStage(world,g);
 world.locations.push({id:'festival',name:'山谷音乐台',x:-66,z:54,radius:4,action:'选择场次 · 观演'});world.collisions.push({x:-66,z:42,r:9.2});
 road(g,[-43,35],[-57,54],3);road(g,[-57,54],[-66,54],3);road(g,[-36,38],[-13,42],3);road(g,[-13,42],[15,42],3);
 // Low-cost forest: shared instanced trunks and canopies frame the playable valley.
 const n=240,trunks=new T.InstancedMesh(new T.CylinderGeometry(.12,.2,3,5),m.wood,n),leaves=new T.InstancedMesh(new T.ConeGeometry(1.65,5,6),material('#456a5d'),n),dummy=new T.Object3D();g.add(trunks,leaves);
 for(let i=0;i<n;i++){const a=i*2.39996,r=96+(i%17)*1.7,x=Math.sin(a)*r,z=Math.cos(a)*r-20,s=Math.hypot(x+66,z-42)<28?0:.65+(i%9)*.12;dummy.position.set(x,1.5*s,z);dummy.scale.setScalar(s);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);dummy.position.y=4*s;dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix)}
 return {courts};
}
export function applyOutfit(player,outfit,accessory){
 player.userData.robe.material.color.set(outfit.color);
 if(!player.userData.gear){const gear=new T.Group();player.add(gear);player.userData.gear=gear;const lantern=new T.Group();gear.add(lantern);lantern.position.set(.45,.6,.15);const hoop=mesh(new T.TorusGeometry(.12,.018,5,20),m.gold,lantern,0,.24,0);box(lantern,m.light,0,0,0,.22,.3,.22);box(lantern,m.gold,0,.18,0,.28,.05,.28);const bag=new T.Group();gear.add(bag);bag.position.set(-.29,.7,.08);mesh(new T.SphereGeometry(.19,12,8),material('#b6a17b'),bag,0,0,0,1,1.2,.5);const strap=box(gear,m.gold,-.11,1.1,.2,.035,.6,.025);strap.rotation.z=-.5;player.userData.accessories={lantern,bag,strap}}
 const a=player.userData.accessories;a.lantern.visible=accessory==='lantern';a.bag.visible=a.strap.visible=accessory==='bag';
}
