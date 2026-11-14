'use strict';
(()=>{
 const canvas=$('world'),ctx=canvas.getContext('2d',{alpha:false});
 let W=0,H=0,DPR=1,t=0,lastFrame=0,effectTime=0,hits=[],particles=[],boatFlash=0,focusTarget=null,terrainKey='',terrain;
 const camera={x:550,y:500,zoom:1.25},pointers=new Map();let gesture=null,tapStart=null,moved=false;
 let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const colors=['#d88773','#769b98','#c7a45d','#809a70','#8c91ad','#cc9874'];
 function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill()}
 function poly(c,pts,fill){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill()}
 function line(c,pts,color,width=2){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke()}
 function round(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill()}
 function text(c,str,x,y,size,color,align='center'){c.font=`500 ${size}px "PingFang SC",system-ui,sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(str,x,y)}
 function hash(n){return Math.abs(Math.sin(n*127.1+311.7)*43758.5453)%1}
 function island(c,x,y,rx,ry,seed=1){
  ellipse(c,x,y+20,rx+38,ry+32,'#93d4cf');ellipse(c,x,y+16,rx+20,ry+15,'#bbe4d2');
  const pts=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2,f=1+(hash(i+seed)*.07);pts.push([x+Math.cos(a)*rx*f,y+Math.sin(a)*ry*f])}
  poly(c,pts.map(([a,b])=>[a,b+24]),'#c0b68b');poly(c,pts,'#f4dfac');
  poly(c,pts.map(([a,b])=>[x+(a-x)*.91,y+(b-y)*.88-5]),'#a9c98d');
  for(let i=0;i<45;i++){const a=hash(i+seed+70)*Math.PI*2,r=Math.sqrt(hash(i+seed+120))*.83;const px=x+Math.cos(a)*rx*r,py=y+Math.sin(a)*ry*r;ellipse(c,px,py,2.2,1.3,i%4?'#94b77b':'#d8dc9d')}
 }
 function bridge(c,x1,y1,x2,y2){line(c,[[x1,y1+8],[x2,y2+8]],'#a8976e',33);line(c,[[x1,y1],[x2,y2]],'#dbc08a',29);const n=Math.ceil(Math.hypot(x2-x1,y2-y1)/8);for(let i=0;i<=n;i++){const k=i/n,x=x1+(x2-x1)*k,y=y1+(y2-y1)*k;line(c,[[x-12,y+5],[x+12,y-5]],'#c0a475',1.3)}for(const k of [.05,.95]){const x=x1+(x2-x1)*k,y=y1+(y2-y1)*k;line(c,[[x-17,y-17],[x-17,y+5]],'#9b8b62',4);line(c,[[x+17,y-17],[x+17,y+5]],'#9b8b62',4)}}
 function tree(c,x,y,s=1,seed=0){ellipse(c,x+3,y+4,21*s,9*s,'#5d8a6a22');line(c,[[x,y],[x-2*s,y-39*s]],'#9b8e66',7*s);ellipse(c,x,y-40*s,26*s,29*s,'#7aa67b');ellipse(c,x-13*s,y-48*s,20*s,22*s,'#8eb885');ellipse(c,x+13*s,y-43*s,20*s,25*s,'#6e9a75');ellipse(c,x-5*s,y-62*s,16*s,15*s,'#9ac28b')}
 function palm(c,x,y,s=1){line(c,[[x,y],[x-4*s,y-35*s],[x+4*s,y-68*s]],'#b09b6f',7*s);for(let i=0;i<6;i++){const a=i*Math.PI/3,sx=x+4*s,sy=y-68*s;poly(c,[[sx,sy],[sx+Math.cos(a)*31*s,sy+Math.sin(a)*14*s-8*s],[sx+Math.cos(a)*43*s,sy+Math.sin(a)*22*s+10*s],[sx+Math.cos(a)*22*s,sy+Math.sin(a)*10*s]],i%2?'#77a37b':'#93b97f')}ellipse(c,x+1*s,y-64*s,4*s,5*s,'#b49c64')}
 function bench(c,x,y){poly(c,[[x-24,y-7],[x+12,y-17],[x+29,y-9],[x-7,y+3]],'#c6a579');line(c,[[x-21,y],[x-21,y+13]],'#9f916d',4);line(c,[[x+23,y-5],[x+23,y+9]],'#9f916d',4);line(c,[[x-25,y-17],[x+11,y-28]],'#b49973',7)}
 function flower(c,x,y,col='#e9c2b5',s=1){line(c,[[x,y],[x,y-8*s]],'#7da270',2*s);for(let k=0;k<5;k++)ellipse(c,x+Math.cos(k*1.26)*3*s,y-9*s+Math.sin(k*1.26)*3*s,2.7*s,2.7*s,col);ellipse(c,x,y-9*s,1.6*s,1.6*s,'#fff1bb')}
 function lamp(c,x,y){line(c,[[x,y],[x,y-36]],'#8fa184',3);round(c,x-5,y-43,10,12,3,'#fff1bb');ellipse(c,x,y-38,13,13,'#fff7bd25')}
 function rebuildTerrain(){terrain=document.createElement('canvas');terrain.width=1300;terrain.height=1250;const c=terrain.getContext('2d');
  island(c,550,415,350,173,1);
  line(c,[[335,426],[445,494],[565,463],[715,470]],'#e3d4a6',22);line(c,[[540,290],[550,452]],'#e3d4a6',16);
  bridge(c,267,442,170,502);poly(c,[[132,494],[182,474],[216,492],[166,516]],'#d3b586');line(c,[[141,495],[183,479]],'#b79b72',2);
  ellipse(c,752,408,36,19,'#8fb9a2');ellipse(c,752,405,31,15,'#9bc9bf');ellipse(c,751,401,18,5,'#bfe0c8');
  bench(c,605,508);lamp(c,365,457);lamp(c,660,500);
  for(const [x,y]of [[306,347],[337,310],[772,332],[810,371],[305,433],[731,517]])tree(c,x,y,.8);
  palm(c,279,475,.8);palm(c,840,447,.8);palm(c,675,271,.8);
  for(let i=0;i<13;i++)flower(c,490+i*5,275+Math.sin(i)*6,i%2?'#e8c4b7':'#f2e8b4');
  if(state.level>=2){bridge(c,380,537,310,603);island(c,280,666,180,98,7);line(c,[[245,622],[270,703],[360,695]],'#e6d5a8',16);for(const [x,y]of [[151,660],[388,649],[305,588]])tree(c,x,y,.7);lamp(c,337,724);for(let i=0;i<8;i++)flower(c,173+i*8,712+i%2*4)}
  if(state.level>=3){bridge(c,750,545,803,593);island(c,832,678,168,96,11);bridge(c,951,717,1063,761);for(const [x,y]of [[945,645],[755,637]])palm(c,x,y,.8);lamp(c,897,733)}
  if(state.level>=4){bridge(c,360,748,453,825);island(c,510,917,187,102,15);line(c,[[395,899],[510,897],[619,957]],'#e5d5a6',15);for(const [x,y]of [[355,940],[633,908]])tree(c,x,y,.8);for(let j=0;j<3;j++)for(let i=0;i<9;i++)flower(c,490+i*10,857+j*12,['#e4b9b1','#efd7a2','#d4c4dd'][j],1.2);lamp(c,594,1001)}
  if(state.level>=5){bridge(c,655,960,740,999);island(c,835,1026,156,84,22);bench(c,923,1044);palm(c,909,997,.8);for(let i=0;i<7;i++)lamp(c,730+i*28,988-Math.sin(i/6*Math.PI)*15)}
  terrainKey=String(state.level);
 }
 function house(x,y,type,level=1,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);const tall=type===3?26:0,col=TYPES[type].color;
  ellipse(ctx,8,9,53,17,'#4f796226');poly(ctx,[[-47,0],[2,21],[55,-3],[8,-24]],'#d8c59a');
  poly(ctx,[[-42,-12-tall],[2,7-tall],[2,11],[-42,-8]],'#fff2cb');poly(ctx,[[2,7-tall],[49,-14-tall],[49,-5],[2,14]],'#dfd1a6');
  poly(ctx,[[-42,-49-tall],[2,-29-tall],[2,11],[-42,-8]],'#fff0cb');poly(ctx,[[2,-29-tall],[49,-50-tall],[49,-5],[2,14]],'#e6d7ac');
  poly(ctx,[[-51,-48-tall],[-10,-83-tall],[13,-72-tall],[7,-22-tall]],col);poly(ctx,[[-10,-83-tall],[57,-53-tall],[51,-39-tall],[7,-22-tall],[13,-72-tall]],col);line(ctx,[[-10,-83-tall],[57,-53-tall]],'#ffffff40',3);
  for(let j=0;j<3;j++)line(ctx,[[-38+j*11,-51-tall-j*6],[-2+j*3,-32-tall-j*12]],'#664d3812',1);
  poly(ctx,[[-28,-27],[-13,-21],[-13,5],[-28,-1]],'#829878');ellipse(ctx,-17,-8,1.5,1.5,'#f0d89b');
  for(let j=0;j<(type===3?2:1);j++){const yy=-26-j*25;poly(ctx,[[14,yy],[25,yy-5],[25,yy+9],[14,yy+14]],'#82b7bd');poly(ctx,[[32,yy-8],[42,yy-12],[42,yy+1],[32,yy+6]],'#82b7bd');line(ctx,[[19,yy-1],[19,yy+10]],'#f5efcf',1.5)}
  poly(ctx,[[-40,1],[-7,14],[1,10],[-31,-3]],'#bba67b');round(ctx,-36,-20,7,7,2,'#7da477');flower(ctx,-33,-20,type===1?'#d9b5c1':'#f0d397',.6);
  if(type===1){for(let i=0;i<6;i++)flower(ctx,-34+i*10,13+i*.2,'#e7bdba',.8)}
  if(type===2){poly(ctx,[[5,18],[52,-3],[69,6],[20,29]],'#c9b07f');line(ctx,[[16,20],[16,6],[64,-14]],'#eee6c8',3);line(ctx,[[64,6],[64,-14]],'#eee6c8',3)}
  if(level>=2){for(let i=0;i<Math.min(level-1,4);i++)text(ctx,'✦',-24+i*12,-89-tall,11,'#e5c575')}
  ctx.restore()
 }
 function plot(p,i){const h=state.houses[i];if(h){house(p.x,p.y,h.type,h.level);hits.push({kind:'house',i,x:p.x,y:p.y-27,r:55});return}if(i>=slots())return;
  const a=.55+Math.sin(t*2+i)*.12;ctx.save();ctx.globalAlpha=buildType===null?.54:.95;poly(ctx,[[p.x-37,p.y],[p.x,p.y-17],[p.x+37,p.y],[p.x,p.y+18]],'#e7dfb9');ctx.setLineDash([5,5]);line(ctx,[[p.x-37,p.y],[p.x,p.y-17],[p.x+37,p.y],[p.x,p.y+18],[p.x-37,p.y]],'#819b78',1.5);ctx.setLineDash([]);text(ctx,'＋',p.x,p.y+6,25,buildType===null?'#8aab80':'#5d8663');ctx.restore();hits.push({kind:'plot',i,x:p.x,y:p.y,r:43})}
 function coffee(){const x=245,y=610;ellipse(ctx,x,y+12,44,13,'#60835a20');poly(ctx,[[x-32,y-3],[x+10,y+15],[x+42,y],[x,y-19]],'#c9b27e');poly(ctx,[[x-32,y-28],[x+10,y-11],[x+10,y+15],[x-32,y-3]],'#e5c997');poly(ctx,[[x+10,y-11],[x+42,y-25],[x+42,y],[x+10,y+15]],'#b49c73');line(ctx,[[x-35,y-25],[x-35,y-68]],'#b6a078',3);line(ctx,[[x+43,y-24],[x+43,y-68]],'#b6a078',3);poly(ctx,[[x-43,y-69],[x-4,y-88],[x+51,y-68],[x+11,y-48]],'#faf1ce');for(let i=0;i<4;i++)poly(ctx,[[x-43+i*22,y-69+i*2],[x-31+i*22,y-75+i*2],[x+23+i*5,y-55],[x+11+i*5,y-48]],'#8ea18a');round(ctx,x-18,y-31,16,16,3,'#f5edd3');ellipse(ctx,x-10,y-31,8,3,'#c1a47c');text(ctx,'COFFEE',x-10,y-48,7,'#748774');steam(x-10,y-42);umbrella(365,622);bench(ctx,358,648)}
 function umbrella(x,y){line(ctx,[[x,y],[x,y-57]],'#b6a281',3);ellipse(ctx,x,y-47,41,17,'#8caaa0');poly(ctx,[[x-41,y-47],[x,y-74],[x+41,y-47],[x,y-36]],'#f6e9c2');poly(ctx,[[x,y-74],[x+13,y-38],[x+41,y-47]],'#d5b5a0');poly(ctx,[[x,y-74],[x-15,y-39],[x-41,y-47]],'#d5b5a0');ellipse(ctx,x,y-14,21,8,'#e4d1a7');line(ctx,[[x,y-14],[x,y]],'#ae9d79',3)}
 function steam(x,y){for(let i=0;i<3;i++){const q=(t*.7+i*.33)%1;ctx.globalAlpha=(1-q)*.6;line(ctx,[[x+Math.sin(q*7+i)*3,y-q*25],[x+Math.sin(q*7+i+1)*3,y-q*25-6]],'#fffbe9',2);ctx.globalAlpha=1}}
 function workshop(){const x=355,y=388;poly(ctx,[[x-25,y],[x+8,y+14],[x+31,y],[x-3,y-14]],'#bda57a');line(ctx,[[x-20,y],[x-20,y+15]],'#a58d68',4);line(ctx,[[x+24,y],[x+24,y+14]],'#a58d68',4);poly(ctx,[[x-13,y-8],[x+7,y],[x+18,y-5],[x-2,y-14]],'#e5cfa1');round(ctx,x-9,y-18,15,8,2,'#9da78a')}
 function windmill(){const x=402,y=866;poly(ctx,[[x-19,y],[x+18,y],[x+11,y-58],[x-10,y-58]],'#f1dfb7');poly(ctx,[[x-17,y-58],[x,y-78],[x+19,y-58]],'#c3a587');ctx.save();ctx.translate(x,y-49);ctx.rotate(t*.4);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);line(ctx,[[0,0],[0,-43]],'#ede5bd',4);poly(ctx,[[1,-15],[10,-15],[10,-42],[1,-42]],'#fff3d3')}ctx.restore();ellipse(ctx,x,y-49,4,4,'#a5946d')}
 function stage(){const x=813,y=1025;poly(ctx,[[x-57,y],[x,y+26],[x+57,y],[x,y-27]],'#ceb28b');for(let i=0;i<5;i++)line(ctx,[[x-43+i*12,y+7+i*4],[x+11+i*12,y-18+i*4]],'#baa47f',1);round(ctx,x-29,y-30,19,24,3,'#7d8e81');round(ctx,x+25,y-16,16,25,3,'#7d8e81');ellipse(ctx,x-19,y-18,5,5,'#a7b09a')}
 function crate(x,y){poly(ctx,[[x-12,y-14],[x,y-19],[x+13,y-13],[x,y-7]],'#dabd87');poly(ctx,[[x-12,y-14],[x,y-7],[x,y+6],[x-12,y]],'#c3a67a');poly(ctx,[[x,y-7],[x+13,y-13],[x+13,y],[x,y+6]],'#b29b73');line(ctx,[[x-10,y-10],[x-1,y+2]],'#e9cc98',2)}
 function resident(x,y,role,id,scale=1,face=1){
  const walk=role==='walk'||role==='carry',bob=walk?Math.abs(Math.sin(t*5+id))*2:Math.sin(t*1.7+id)*.4;
  ctx.save();ctx.translate(x,y);ctx.scale(scale*face,scale);ellipse(ctx,0,2,10,4,'#4e7c6428');ctx.translate(0,-bob);
  const stride=walk?Math.sin(t*5+id)*4:0;line(ctx,[[-3,-4],[-4+stride,0]],'#7b8068',4);line(ctx,[[3,-4],[4-stride,0]],'#7b8068',4);
  round(ctx,-7,-22,14,19,5,colors[id%colors.length]);
  let arm=Math.sin(t*2+id)*2;if(role==='hammer')arm=Math.sin(t*7)*8;if(role==='water')arm=Math.sin(t*2)*3;if(role==='dance')arm=Math.sin(t*3)*9;
  line(ctx,[[-7,-18],[-10-arm*.3,-10+arm]],'#e9caa4',4);line(ctx,[[7,-18],[10+arm*.5,-11-arm]],'#e9caa4',4);
  ellipse(ctx,0,-29,8.3,9,'#efd5b1');ellipse(ctx,-1,-34,8.5,4.7,id%3===0?'#8a8271':'#b79d75');ellipse(ctx,3,-28,1,1.3,'#65766a');ellipse(ctx,7,-25,2,1.2,'#e8b9a0');
  if(['fish','water','hammer','carry'].includes(role)){ellipse(ctx,0,-36,13,3.6,'#dcc795');ellipse(ctx,-1,-40,8,4.5,'#e6d2a2')}
  if(role==='fish'){const lift=Math.sin(t*.8+id)*4;line(ctx,[[10,-16],[31,-56-lift]],'#8c8d70',2);line(ctx,[[31,-56-lift],[52,-9]],'#eff0d79a',.8);ellipse(ctx,52,-6,10+Math.sin(t*2)*3,3,'#e0eee57a');if(Math.sin(t*.8+id)>.96){poly(ctx,[[43,-10],[49,-16],[55,-10],[49,-5]],'#b8d6c5')}}
  if(role==='hammer'){line(ctx,[[12,-15-arm],[19,-25-arm]],'#a89673',3);line(ctx,[[15,-28-arm],[24,-22-arm]],'#94a192',5)}
  if(role==='water'){ellipse(ctx,15,-12,7,5,'#91b5ac');line(ctx,[[20,-12],[28,-6]],'#91b5ac',3);for(let j=0;j<4;j++)ellipse(ctx,29+j*3,-4+(t*14+j*4)%13,1,1.5,'#c9e2d5')}
  if(role==='coffee'||role==='read'){if(role==='coffee'){round(ctx,8,-14,8,8,2,'#fff2d2');steam(12,-16)}else{poly(ctx,[[5,-18],[14,-14],[23,-18],[22,-6],[14,-3],[5,-7]],'#efe2b9');line(ctx,[[14,-14],[14,-3]],'#d4c59f',1)}}
  if(role==='carry')crate(11,-8);
  if(role==='music'){ellipse(ctx,8,-12,8,10,'#d4b279');line(ctx,[[11,-16],[24,-32]],'#ac926e',4);line(ctx,[[2,-14],[14+Math.sin(t*5)*3,-10]],'#e9caa4',3)}
  if(role==='dance'){ctx.translate(0,Math.sin(t*3+id)*2);if(Math.sin(t*2+id)>.4)text(ctx,'♪',18,-40-Math.sin(t*2)*4,12,'#e9d7a1')}
  ctx.restore();hits.push({kind:'person',role,id,x,y:y-18,r:22*scale})
 }
 function walker(id,region=0){const main=[[340,418],[390,480],[575,500],[735,467],[715,395],[565,402],[480,380],[360,401]];const r=REGIONS[region];const path=region===0?main:[[r.x-65,r.y+15],[r.x-15,r.y+40],[r.x+65,r.y+15],[r.x+25,r.y-15]];const p=(t*.055+id*.19)%1*path.length,i=Math.floor(p),k=p-i,a=path[i],b=path[(i+1)%path.length];const x=a[0]+(b[0]-a[0])*k,y=a[1]+(b[1]-a[1])*k;return {x,y,draw:()=>resident(x,y,id%7===0?'carry':'walk',id,1,b[0]>a[0]?1:-1)}}
 function label(str,x,y,locked=false){const w=str.length*12+36;round(ctx,x-w/2,y-17,w,31,15,locked?'#e3efe6af':'#fff7ddd9');text(ctx,(locked?'⌑ ':'')+str,x,y+3,12,locked?'#789c96':'#728970');if(locked)hits.push({kind:'region',x,y,r:55})}
 function ghostRegion(i){const r=REGIONS[i];ctx.save();ctx.globalAlpha=.32;ellipse(ctx,r.x,r.y,133,61,'#bee0d5');ellipse(ctx,r.x,r.y-5,116,51,'#d9e8ca');for(let j=0;j<4;j++)ellipse(ctx,r.x-70+j*40,r.y-6-Math.sin(j)*18,35,22,'#e2eee4');ctx.restore();label(`${r.name} · Lv.${i+1}`,r.x,r.y+7,true)}
 function boat(x,y,s,flip=1){ctx.save();ctx.translate(x,y);ctx.scale(s*flip,s);ellipse(ctx,0,9,46,11,'#70b9c038');line(ctx,[[-43,10],[-70,17]],'#d5eee081',3);poly(ctx,[[-35,-3],[36,-3],[21,16],[-22,16]],'#f4edd0');poly(ctx,[[-35,-3],[36,-3],[23,5],[-30,5]],'#b99876');round(ctx,-17,-23,36,20,4,'#fff6dd');round(ctx,-9,-35,18,12,3,'#dfb77c');for(let i=0;i<3;i++)round(ctx,-10+i*10,-18,6,6,2,'#8ab7b6');line(ctx,[[5,-35],[5,-51]],'#c3b28b',2);poly(ctx,[[5,-51],[24,-45],[5,-40]],'#c8816f');ctx.restore()}
 function seagull(x,y,id){const flap=Math.sin(t*3+id)*5;line(ctx,[[x-9,y-flap],[x,y],[x+9,y-flap]],'#f7f6e7',2.5)}
 function resize(){const r=canvas.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR)}
 function baseScale(){return Math.min(W/1050,(H-150)/1100)}
 function worldToScreen(x,y){const s=baseScale()*camera.zoom;return{x:(x-camera.x)*s+W/2,y:(y-camera.y)*s+H*.52}}
 function screenToWorld(x,y){const s=baseScale()*camera.zoom;return{x:(x-W/2)/s+camera.x,y:(y-H*.52)/s+camera.y}}
 function draw(ms){requestAnimationFrame(draw);if(ms-lastFrame<(reduced?100:32)||document.hidden)return;const dt=Math.min((ms-lastFrame)/1000,.1);lastFrame=ms;effectTime+=dt;if(!paused&&!reduced)t+=dt;
  if(focusTarget){camera.x+=(focusTarget.x-camera.x)*.09;camera.y+=(focusTarget.y-camera.y)*.09;camera.zoom+=(focusTarget.zoom-camera.zoom)*.09;if(Math.abs(camera.x-focusTarget.x)+Math.abs(camera.y-focusTarget.y)<.5)focusTarget=null}
  ctx.setTransform(DPR,0,0,DPR,0,0);const ocean=ctx.createLinearGradient(0,0,0,H);ocean.addColorStop(0,'#a0d7db');ocean.addColorStop(.6,'#84cbd1');ocean.addColorStop(1,'#78bfc9');ctx.fillStyle=ocean;ctx.fillRect(0,0,W,H);
  for(let j=0;j<Math.ceil(H/65)+1;j++)for(let i=0;i<Math.ceil(W/95)+1;i++){const x=i*95+(j%2)*35+Math.sin(t*.2+j)*8,y=j*65+Math.sin(t*.4+i+j)*3;ctx.globalAlpha=.13+Math.sin(t*.5+i)*.05;ctx.beginPath();ctx.ellipse(x,y,11,3,0,.2,Math.PI-.2);ctx.strokeStyle='#eaffed';ctx.lineWidth=1.5;ctx.stroke()}ctx.globalAlpha=1;
  const s=baseScale()*camera.zoom;ctx.translate(W/2,H*.52);ctx.scale(s,s);ctx.translate(-camera.x,-camera.y);hits=[];
  if(terrainKey!==String(state.level))rebuildTerrain();ctx.drawImage(terrain,0,0);
  // Faraway sandbars keep the horizon alive while the inhabited bays grow.
  ellipse(ctx,96,285,46,19,'#b8dcd0');ellipse(ctx,96,280,36,13,'#f3dfae');palm(ctx,98,280,.65);ellipse(ctx,1033,429,35,15,'#ebdaad');tree(ctx,1035,425,.45);
  boat(160+Math.sin(t*.075)*85,560+Math.cos(t*.075)*45,.95,Math.cos(t*.075)>0?1:-1);boat(1000+Math.sin(t*.055)*80,305+Math.cos(t*.055)*35,.7,-1);
  if(boatFlash>t)boat(185+(boatFlash-t)*8,500,.6);
  const entities=[{y:390,draw:workshop}];
  for(let i=0;i<12;i++)if(i<slots())entities.push({y:PLOTS[i].y,draw:()=>plot(PLOTS[i],i)});
  entities.push({y:402,draw:()=>resident(338,402,'hammer',0,1.1)},{y:502,draw:()=>resident(250,502,'fish',1,1.1,-1)});
  const n=Math.max(0,residents()-2-(state.level-1)*2-(count()?1:0)-(state.level>=5?1:0));for(let i=0;i<n;i++)entities.push(walker(i+2,i<8?0:Math.min(state.level-1,1+(i%Math.max(1,state.level-1)))));
  if(count())entities.push({y:526,draw:()=>resident(603,526,'read',5,1.05,-1)});
  if(state.level>=2)entities.push({y:614,draw:coffee},{y:625,draw:()=>resident(273,625,'coffee',3,1.1)},{y:648,draw:()=>resident(376,648,'read',4,1)});
  if(state.level>=3)entities.push({y:756,draw:()=>resident(1027,756,'fish',6,1.05)},{y:739,draw:()=>resident(995,739,'fish',7,1.1)},{y:734,draw:()=>crate(930,734)});
  if(state.level>=4)entities.push({y:866,draw:windmill},{y:881,draw:()=>resident(546,881,'water',8,1.1)},{y:900,draw:()=>resident(590,900,'water',9,1)});
  if(state.level>=5)entities.push({y:1000,draw:stage},{y:1020,draw:()=>resident(806,1020,'music',10,1.2)},{y:1060,draw:()=>resident(855,1060,'dance',11,1.1)},{y:1046,draw:()=>resident(875,1046,'dance',12,1.1)});
  entities.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  // Region labels only sit over uninhabited water, leaving the daily life unobscured.
  label('海风小居',550,570);if(state.level>=2)label('日落咖啡湾',278,778);if(state.level>=3)label('潮汐渔港',838,787);if(state.level>=4)label('风铃花园',500,1039);if(state.level>=5)label('星光海岸',842,1128);
  if(state.level<5)ghostRegion(state.level);
  const fishX=state.level>=3?1080:210,fishY=state.level>=3?810:550;const leap=(t*.2)%1;if(leap<.2){const k=leap/.2;poly(ctx,[[fishX,fishY-Math.sin(k*Math.PI)*25],[fishX+9,fishY-5-Math.sin(k*Math.PI)*25],[fishX+15,fishY-Math.sin(k*Math.PI)*25],[fishX+8,fishY+5-Math.sin(k*Math.PI)*25]],'#e4edcc')}
  if(state.level>=4)for(let i=0;i<4;i++){const x=520+Math.sin(t*.6+i*2)*70,y=835+Math.cos(t*.7+i)*25;ellipse(ctx,x,y,Math.abs(Math.sin(t*7+i))*4+1,3,'#f5e6a6')}
  for(let i=0;i<4;i++)seagull(350+Math.sin(t*.07+i*1.8)*400,210+Math.cos(t*.07+i)*70,i);
  for(const p of particles){const age=effectTime-p.start;if(age>p.life)continue;ctx.globalAlpha=1-age/p.life;const py=p.y-age*(p.kind==='greet'?20:55),px=p.x+Math.sin(age*2+p.seed)*age*15;if(p.kind==='coin')text(ctx,'✦',px,py,22,'#ffeb9e');else if(p.kind==='greet'){round(ctx,px-27,py-17,54,24,10,'#fff9df');text(ctx,p.msg,px,py,10,'#719179')}else{ctx.save();ctx.translate(px,py);ctx.rotate(age+p.seed);ctx.fillStyle=p.seed%2?'#f6deb0':'#d4e9b9';ctx.fillRect(-3,-3,6,6);ctx.restore()}ctx.globalAlpha=1}particles=particles.filter(p=>effectTime-p.start<p.life);
  ctx.setTransform(DPR,0,0,DPR,0,0);
 }
 function burst(x,y,kind){const n=kind==='unlock'?34:kind==='coin'?12:20;for(let i=0;i<n;i++)particles.push({x:x+(hash(i+1)-.5)*100,y:y+(hash(i+9)-.5)*45,kind,start:effectTime,life:1.8+hash(i)*1.3,seed:i})}
 function home(){focusTarget={x:550,y:state.level===1?475:state.level>=4?630:530,zoom:state.level===1?1.5:1.2}}
 function focus(x,y,zoom=1.5){focusTarget={x,y,zoom}}
 function tap(x,y){const p=screenToWorld(x,y);const hit=[...hits].reverse().find(h=>Math.hypot(h.x-p.x,h.y-p.y)<h.r);if(!hit)return;
  if(hit.kind==='house'){if(buildType!==null)return toast('这里已经有人住了，选一块 ＋ 空地吧。');inspect(hit.i)}
  if(hit.kind==='plot')build(hit.i);if(hit.kind==='region')openExpand();
  if(hit.kind==='person'){const words={walk:['你好呀','海风真好','去散个步'],carry:['新鲜的鱼','借过一下'],hammer:['快修好啦','笃笃笃'],fish:['等一条鱼','嘘…上钩了'],water:['慢慢长大','花开啦'],coffee:['来杯咖啡？','刚刚煮好'],read:['再读一页','真舒服呀'],music:['♪ 海的歌','一起听吧'],dance:['啦啦啦','跟着摇摆']};const list=words[hit.role]||words.walk;particles.push({x:hit.x,y:hit.y-30,kind:'greet',msg:list[Math.floor(hash(t)*list.length)],start:effectTime,life:2.8,seed:0})}
 }
 function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;canvas.setPointerCapture(e.pointerId);const p=point(e);pointers.set(e.pointerId,p);focusTarget=null;if(pointers.size===1){tapStart={...p};moved=false;gesture={...p,cx:camera.x,cy:camera.y}}else if(pointers.size===2){moved=true;const a=[...pointers.values()];gesture={pinch:true,dist:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),zoom:camera.zoom}}});
 canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const p=point(e);pointers.set(e.pointerId,p);if(pointers.size===2&&gesture?.pinch){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);camera.zoom=Math.max(.65,Math.min(3.8,gesture.zoom*d/Math.max(gesture.dist,1)));return}if(pointers.size===1&&gesture&&!gesture.pinch){const dx=p.x-gesture.x,dy=p.y-gesture.y;if(Math.hypot(dx,dy)>7)moved=true;const s=baseScale()*camera.zoom;camera.x=Math.max(-100,Math.min(1300,gesture.cx-dx/s));camera.y=Math.max(100,Math.min(1300,gesture.cy-dy/s))}});
 function end(e){const p=point(e);if(pointers.size===1&&!moved&&tapStart)tap(p.x,p.y);pointers.delete(e.pointerId);if(pointers.size===1){const a=[...pointers.values()][0];gesture={...a,cx:camera.x,cy:camera.y};moved=true}else gesture=null;tapStart=null}
 canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);gesture=null;moved=true;tapStart=null});canvas.addEventListener('lostpointercapture',e=>pointers.delete(e.pointerId));
 canvas.addEventListener('wheel',e=>{e.preventDefault();focusTarget=null;camera.zoom=Math.max(.65,Math.min(3.8,camera.zoom*Math.exp(-e.deltaY*.001)))},{passive:false});
 canvas.addEventListener('keydown',e=>{const keys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','-','Home'];if(!keys.includes(e.key))return;e.preventDefault();focusTarget=null;if(e.key==='Home')home();if(e.key==='ArrowUp')camera.y-=35;if(e.key==='ArrowDown')camera.y+=35;if(e.key==='ArrowLeft')camera.x-=35;if(e.key==='ArrowRight')camera.x+=35;if(e.key==='+')camera.zoom=Math.min(3.8,camera.zoom*1.15);if(e.key==='-')camera.zoom=Math.max(.65,camera.zoom/1.15)});
 $('zoomIn').onclick=()=>{focusTarget=null;camera.zoom=Math.min(3.8,camera.zoom*1.25)};$('zoomOut').onclick=()=>{focusTarget=null;camera.zoom=Math.max(.65,camera.zoom/1.25)};$('recenter').onclick=home;
 window.islandScene={home,focus,burst,arrival:()=>{boatFlash=t+5},get reduced(){return reduced},toggleMotion(){reduced=!reduced},screenToWorld,worldToScreen};
 addEventListener('resize',resize);resize();home();requestAnimationFrame(draw);
})();
