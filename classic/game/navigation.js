// Small grid navigation avoids tent footprints; it never represents fortune/seat calculation.
export function findRoute(start,end,canMove){
 const grid=.8,key=(x,z)=>`${x},${z}`,snap=v=>Math.round(v/grid);
 const sx=snap(start.x),sz=snap(start.z),ex=snap(end.x),ez=snap(end.z);
 const clear=(a,b)=>{const d=Math.hypot(a.x-b.x,a.z-b.z),n=Math.max(1,Math.ceil(d/.25));for(let i=1;i<=n;i++)if(!canMove(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;return true};
 if(!canMove(end.x,end.z))return [];
 if(clear(start,end))return [{x:end.x,z:end.z}];
 const startNode={x:sx,z:sz,g:0,f:Math.hypot(ex-sx,ez-sz),parent:null};const open=[startNode],best=new Map([[key(sx,sz),0]]),closed=new Set();let goal=null;
 for(let loops=0;open.length&&loops<11000;loops++){
  let idx=0;for(let i=1;i<open.length;i++)if(open[i].f<open[idx].f)idx=i;
  const cur=open.splice(idx,1)[0],ck=key(cur.x,cur.z);if(closed.has(ck))continue;closed.add(ck);
  if(Math.hypot(cur.x-ex,cur.z-ez)<=1.5&&clear({x:cur.x*grid,z:cur.z*grid},end)){goal=cur;break}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const x=cur.x+dx,z=cur.z+dz,k=key(x,z);if(closed.has(k)||!canMove(x*grid,z*grid))continue;
   if(dx&&dz&&(!canMove((cur.x+dx)*grid,cur.z*grid)||!canMove(cur.x*grid,(cur.z+dz)*grid)))continue;
   const g=cur.g+Math.hypot(dx,dz);if(best.has(k)&&best.get(k)<=g)continue;best.set(k,g);open.push({x,z,g,f:g+Math.hypot(ex-x,ez-z),parent:cur});
  }
 }
 if(!goal)return [];
 const raw=[{x:end.x,z:end.z}];while(goal.parent){raw.push({x:goal.x*grid,z:goal.z*grid});goal=goal.parent}raw.reverse();
 const route=[];let current=start,i=0;while(i<raw.length){let far=i;for(let j=i+1;j<raw.length;j++){if(clear(current,raw[j]))far=j;else break}route.push(raw[far]);current=raw[far];i=far+1}return route;
}
