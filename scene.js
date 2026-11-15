'use strict';
(()=>{
 const canvas=$('world'),ctx=canvas.getContext('2d',{alpha:false});
 let W=0,H=0,DPR=1,t=0,lastFrame=0,effectTime=0,hits=[],particles=[],boatFlash=0,focusTarget=null,lastIncomePulse=-1,terrainKey='',terrain;
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
  if(has('park')){bench(c,605,508);lamp(c,365,457);lamp(c,660,500);}
  for(const [x,y]of [[306,347],[337,310],[772,332],[810,371],[305,433],[731,517]])tree(c,x,y,.8);
  palm(c,279,475,.8);palm(c,840,447,.8);palm(c,675,271,.8);
  if(has('park'))for(let i=0;i<13;i++)flower(c,490+i*5,275+Math.sin(i)*6,i%2?'#e8c4b7':'#f2e8b4');
  if(has('bbq')){bridge(c,380,537,310,603);island(c,280,666,180,98,7);line(c,[[245,622],[270,703],[360,695]],'#e6d5a8',16);for(const [x,y]of [[151,660],[388,649],[305,588]])tree(c,x,y,.7);lamp(c,337,724);for(let i=0;i<8;i++)flower(c,173+i*8,712+i%2*4)}
  if(has('harbor')){bridge(c,750,545,803,593);island(c,832,678,168,96,11);bridge(c,951,717,1063,761);for(const [x,y]of [[945,645],[755,637]])palm(c,x,y,.8);lamp(c,897,733)}
  if(has('park')){bridge(c,360,748,453,825);island(c,510,917,187,102,15);line(c,[[395,899],[510,897],[619,957]],'#e5d5a6',15);for(const [x,y]of [[355,940],[633,908]])tree(c,x,y,.8);for(let j=0;j<3;j++)for(let i=0;i<9;i++)flower(c,490+i*10,857+j*12,['#e4b9b1','#efd7a2','#d4c4dd'][j],1.2);lamp(c,594,1001)}
  if(has('stage')){bridge(c,655,960,740,999);island(c,835,1026,156,84,22);bench(c,923,1044);palm(c,909,997,.8);for(let i=0;i<7;i++)lamp(c,730+i*28,988-Math.sin(i/6*Math.PI)*15)}
  terrainKey=state.facilities.join();
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
 function coffee(){const x=700,y=395;ellipse(ctx,x,y+12,44,13,'#60835a20');poly(ctx,[[x-32,y-3],[x+10,y+15],[x+42,y],[x,y-19]],'#c9b27e');poly(ctx,[[x-32,y-28],[x+10,y-11],[x+10,y+15],[x-32,y-3]],'#e5c997');poly(ctx,[[x+10,y-11],[x+42,y-25],[x+42,y],[x+10,y+15]],'#b49c73');line(ctx,[[x-35,y-25],[x-35,y-68]],'#b6a078',3);line(ctx,[[x+43,y-24],[x+43,y-68]],'#b6a078',3);poly(ctx,[[x-43,y-69],[x-4,y-88],[x+51,y-68],[x+11,y-48]],'#faf1ce');for(let i=0;i<4;i++)poly(ctx,[[x-43+i*22,y-69+i*2],[x-31+i*22,y-75+i*2],[x+23+i*5,y-55],[x+11+i*5,y-48]],'#8ea18a');round(ctx,x-18,y-31,16,16,3,'#f5edd3');ellipse(ctx,x-10,y-31,8,3,'#c1a47c');text(ctx,'COFFEE',x-10,y-48,7,'#748774');steam(x-10,y-42);umbrella(773,407);bench(ctx,758,437)}
 function umbrella(x,y){line(ctx,[[x,y],[x,y-57]],'#b6a281',3);ellipse(ctx,x,y-47,41,17,'#8caaa0');poly(ctx,[[x-41,y-47],[x,y-74],[x+41,y-47],[x,y-36]],'#f6e9c2');poly(ctx,[[x,y-74],[x+13,y-38],[x+41,y-47]],'#d5b5a0');poly(ctx,[[x,y-74],[x-15,y-39],[x-41,y-47]],'#d5b5a0');ellipse(ctx,x,y-14,21,8,'#e4d1a7');line(ctx,[[x,y-14],[x,y]],'#ae9d79',3)}
 function steam(x,y){for(let i=0;i<3;i++){const q=(t*.7+i*.33)%1;ctx.globalAlpha=(1-q)*.6;line(ctx,[[x+Math.sin(q*7+i)*3,y-q*25],[x+Math.sin(q*7+i+1)*3,y-q*25-6]],'#fffbe9',2);ctx.globalAlpha=1}}
 function grill(x,y){ellipse(ctx,x,y+8,45,13,'#63866222');line(ctx,[[x-22,y],[x-25,y+19]],'#8e967d',5);line(ctx,[[x+25,y],[x+29,y+19]],'#8e967d',5);round(ctx,x-33,y-24,66,30,8,'#87978a');ellipse(ctx,x,y-24,34,14,'#6b7e71');for(let i=0;i<5;i++)line(ctx,[[x-25+i*12,y-34],[x-25+i*12,y-14]],'#b5b9a0',2);for(let i=0;i<3;i++){ctx.save();ctx.translate(x-15+i*15,y-25);ctx.rotate(Math.sin(t*2+i)*.12);ellipse(ctx,0,0,8,4,'#d3a174');line(ctx,[[-4,-2],[3,2]],'#a67c5c',1);ctx.restore()}for(let i=0;i<4;i++)ellipse(ctx,x-20+i*13,y-9,2,2+Math.sin(t*4+i),'#efd191');steam(x-12,y-38);steam(x+14,y-35)}
 function barbecue(){const l=state.facilities[1];grill(l>=3?258:280,l>=3?647:650);if(l>=3){poly(ctx,[[213,671],[303,633],[416,696],[322,741]],'#dfc7a0');grill(258,647);crate(394,709)}if(l>=4){round(ctx,229,687,68,23,3,'#cbb399');line(ctx,[[231,697],[294,697]],'#e7d3b4',1);round(ctx,312,716,54,14,3,'#e8d5b1')}if(l>=5){sign(178,710,'海风烧烤坊',5)}}
 function workshop(){const x=355,y=388;poly(ctx,[[x-25,y],[x+8,y+14],[x+31,y],[x-3,y-14]],'#bda57a');line(ctx,[[x-20,y],[x-20,y+15]],'#a58d68',4);line(ctx,[[x+24,y],[x+24,y+14]],'#a58d68',4);poly(ctx,[[x-13,y-8],[x+7,y],[x+18,y-5],[x-2,y-14]],'#e5cfa1');round(ctx,x-9,y-18,15,8,2,'#9da78a')}
 function windmill(){const x=402,y=866;poly(ctx,[[x-19,y],[x+18,y],[x+11,y-58],[x-10,y-58]],'#f1dfb7');poly(ctx,[[x-17,y-58],[x,y-78],[x+19,y-58]],'#c3a587');ctx.save();ctx.translate(x,y-49);ctx.rotate(t*.4);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);line(ctx,[[0,0],[0,-43]],'#ede5bd',4);poly(ctx,[[1,-15],[10,-15],[10,-42],[1,-42]],'#fff3d3')}ctx.restore();ellipse(ctx,x,y-49,4,4,'#a5946d')}
 function stage(){const x=813,y=1025;poly(ctx,[[x-57,y],[x,y+26],[x+57,y],[x,y-27]],'#ceb28b');for(let i=0;i<5;i++)line(ctx,[[x-43+i*12,y+7+i*4],[x+11+i*12,y-18+i*4]],'#baa47f',1);round(ctx,x-29,y-30,19,24,3,'#7d8e81');round(ctx,x+25,y-16,16,25,3,'#7d8e81');ellipse(ctx,x-19,y-18,5,5,'#a7b09a')}
 function canopy(x,y,w,col='#9caf86'){line(ctx,[[x-w*.4,y+8],[x-w*.4,y-55]],'#b8a483',4);line(ctx,[[x+w*.4,y+8],[x+w*.4,y-55]],'#b8a483',4);poly(ctx,[[x-w*.55,y-54],[x,y-82],[x+w*.55,y-54],[x,y-31]],col);poly(ctx,[[x,y-82],[x,y-31],[x+w*.55,y-54]],'#fff8de45');line(ctx,[[x-w*.55,y-54],[x,y-31],[x+w*.55,y-54]],'#f8ecc8',3)}
 function sign(x,y,str,level){line(ctx,[[x-27,y],[x-27,y-27]],'#a89973',3);line(ctx,[[x+27,y],[x+27,y-27]],'#a89973',3);round(ctx,x-38,y-41,76,22,5,level>=5?'#fbebbb':'#f1e8c9');text(ctx,str,x,y-26,10,'#7f9476');if(level>=5){for(let j=0;j<5;j++)ellipse(ctx,x-27+j*14,y-18,2.3,2.3,'#ffe4a4')}}
 function cooler(x,y){round(ctx,x-13,y-14,26,19,4,'#9ebeb7');round(ctx,x-15,y-17,30,5,2,'#e3e7cc');line(ctx,[[x-4,y-9],[x+4,y-9]],'#6f9b94',2)}
 function bucket(x,y,filled=true){ellipse(ctx,x,y-1,8,3,'#d9e6d3');poly(ctx,[[x-8,y-1],[x+8,y-1],[x+6,y+12],[x-6,y+12]],'#8daeb0');ellipse(ctx,x,y-1,6,2,filled?'#bfd5c7':'#72999d');ctx.beginPath();ctx.arc(x,y-1,8,Math.PI,0);ctx.strokeStyle='#b8c9b6';ctx.lineWidth=1.5;ctx.stroke();if(filled)poly(ctx,[[x-4,y-2],[x+2,y-5],[x+6,y-2],[x+1,y]],'#eee4b9')}
 function table(x,y,w=42){poly(ctx,[[x-w/2,y-5],[x,y-15],[x+w/2,y-5],[x,y+6]],'#e5cea4');line(ctx,[[x-w/2+4,y-4],[x-w/2+4,y+13]],'#ad9a75',3);line(ctx,[[x+w/2-4,y-4],[x+w/2-4,y+13]],'#ad9a75',3)}
 function wheel(x,y,r,clock){ctx.save();ctx.translate(x,y);ctx.rotate(clock*2.2);ellipse(ctx,0,0,r,r,'#91acaa');ellipse(ctx,0,0,r-3,r-3,'#d4d9bd');for(let j=0;j<6;j++){const a=j*Math.PI/3;line(ctx,[[0,0],[Math.cos(a)*(r-1),Math.sin(a)*(r-1)]],'#6f9697',2)}ellipse(ctx,0,0,3,3,'#b8a779');ctx.restore()}
 function winch(x,y,i,level){const active=jobPlan(i).some(j=>j.role==='operate'),clock=active?t:0;round(ctx,x-15,y-5,31,23,4,'#8faaa6');poly(ctx,[[x-18,y+18],[x+18,y+18],[x+26,y+24],[x-20,y+26]],'#bba77e');wheel(x,y,12,clock);const tipx=x-64,tipy=y-47+Math.sin(clock*1.8)*3;line(ctx,[[x-7,y-8],[x-14,y-46],[tipx,tipy]],'#779d9f',5);line(ctx,[[x-6,y-42],[tipx,tipy]],'#d9e1c4',1.5);const hooky=y+37-Math.sin(clock*1.8)*12;line(ctx,[[tipx,tipy],[tipx-7,hooky]],'#f4ecd2',1);ellipse(ctx,tipx,tipy,5,5,'#c7b58c');if(Math.sin(clock*1.8)>.25){poly(ctx,[[tipx-14,hooky],[tipx-7,hooky-5],[tipx+2,hooky],[tipx-7,hooky+4]],'#dce4c5')}if(level>=4){const end=x+53;poly(ctx,[[x+12,y+17],[end,y+37],[end+14,y+30],[x+25,y+10]],'#94aaa0');for(let j=0;j<5;j++){const k=(clock*.22+j*.2)%1,px=x+21+k*45,py=y+12+k*21;line(ctx,[[px-4,py+5],[px+3,py]],'#e0dbc1',2);if(j%2===0)ellipse(ctx,px,py,5,2,'#dce2c2')}}}
 function lookoutTower(x,y,level){const ground=y+40;line(ctx,[[x-16,ground],[x-13,y],[x+13,y],[x+17,ground]],'#ad9974',4);poly(ctx,[[x-23,y],[x,y-8],[x+23,y],[x,y+9]],'#e1c79a');line(ctx,[[x-20,y-1],[x-20,y-15],[x+20,y-15],[x+20,y-1]],'#d7c79f',2);for(let j=0;j<4;j++)line(ctx,[[x-11,y+8+j*8],[x+11,y+8+j*8]],'#c7b18b',2);if(level>=5){line(ctx,[[x+19,y-12],[x+19,y-55]],'#b6a37c',2);poly(ctx,[[x+19,y-55],[x+39,y-48],[x+19,y-42]],'#c88f7f')}}
 function fishingStation(){const l=state.facilities[0],plan=jobPlan(0,l,l);if(l>=2){const pts=l===2?[[268,490],[198,523],[235,552],[308,518]]:l===3?[[289,480],[168,529],[218,566],[333,520]]:l===4?[[295,479],[149,545],[213,585],[343,529]]:[[300,476],[129,548],[202,602],[355,534]];poly(ctx,pts.map(([x,y])=>[x,y+8]),'#b49d78');poly(ctx,pts,'#dfc59a');for(let j=0;j<8;j++)line(ctx,[[174+j*16,531-j*6],[224+j*13,569-j*6]],'#c5ae83',1.2);bucket(l===2?285:330,l===2?505:548,true)}if(l>=3){const op=plan.find(j=>j.role==='operate');winch(op.x-17,op.y-15,0,l);const watch=plan.find(j=>j.role==='lookout');if(watch)lookoutTower(watch.x,watch.y,l)}if(l>=4){cooler(294,564);canopy(280,488,85,'#96adb0')}if(l>=5){table(317,539,48);for(let j=0;j<3;j++)ellipse(ctx,307+j*7,531+j%2*2,6,2,'#b8d0bd');sign(354,524,'蓝湾渔业线',5);lamp(ctx,153,562)}}
 function bbqRoof(){if(state.facilities[1]>=3){canopy(307,635,188,'#c5aa8a');if(state.facilities[1]>=5)for(let j=0;j<6;j++)ellipse(ctx,225+j*30,606+Math.sin(j)*3,2.6,3.2,'#fff1a9')}}
 function bbqStations(){const l=state.facilities[1];if(l>=2){table(l===2?351:357,l===2?666:645,50);for(let j=0;j<4;j++)round(ctx,344+j*5,(l===2?654:637)+j%2*3,4,4,1,'#a6b986')}if(l>=3){const x=l>=5?264:278,y=626;line(ctx,[[x-24,y+15],[x-24,y-13],[x+30,y-13],[x+30,y+15]],'#93a397',4);line(ctx,[[x-29,y-15],[x+35,y-15]],'#b4c3ad',3);for(let j=0;j<3;j++){const a=t*2+j*2;ellipse(ctx,x-14+j*15,y-15+Math.sin(a)*3,6,4,'#d2a477')}wheel(x+35,y-15,8,t);if(l>=4){table(315,699,49);ellipse(ctx,315,691,14,5,'#f5e9cb');ellipse(ctx,315,690,7,3,'#d7b383')}if(l>=5){round(ctx,267,653,29,25,4,'#91aaa1');wheel(266,656,8,t);line(ctx,[[300,611],[300,647]],'#a4b4a0',3)}}}
 function extraStations(i){const l=state.facilities[i];if(i===2){if(l>=2)table(426,405,48);if(l>=3){crate(322,448);line(ctx,[[320,433],[346,446]],'#c8ad7c',8)}if(l>=4){table(477,367,48);poly(ctx,[[459,361],[478,355],[494,362],[478,368]],'#a9c8c7')}if(l>=5){round(ctx,377,409,32,19,3,'#9caf9c');wheel(382,409,9,t);line(ctx,[[382,397],[412,413]],'#d3b68b',5)}}if(i===3){if(l>=2)round(ctx,490,902,29,14,7,'#8fac79');if(l>=4){round(ctx,592,932,26,15,4,'#b7a282');flower(ctx,602,927,'#deb9bd',1.5)}}if(i===4){if(l>=2){round(ctx,658,409,19,19,3,'#bba27f');ellipse(ctx,668,407,8,3,'#e7d9b7');wheel(675,413,7,t)}if(l>=4){round(ctx,787,395,20,15,3,'#9fb6a7');round(ctx,790,390,13,7,2,'#d9e4c8')}if(l>=5)table(699,449,44)}if(i===5&&l>=3){const op=jobPlan(5,l,l).find(j=>j.role==='operate');winch(op.x+17,op.y-15,5,l);const look=jobPlan(5,l,l).find(j=>j.role==='lookout');if(look)lookoutTower(look.x,look.y,l);if(l>=5)table(1040,787,42)}}
 function harborEquipment(){const l=state.facilities[5];if(l>=2){poly(ctx,[[984,748],[1042,725],[1100,791],[1027,834],[972,798]],'#bba681');poly(ctx,[[984,740],[1042,717],[1100,783],[1027,826],[972,790]],'#d9c49a');for(let j=0;j<8;j++)line(ctx,[[987+j*9,742+j*4],[1041+j*7,719+j*8]],'#bea77b',1)}if(l>=3){cooler(1002,790);crate(1066,802)}if(l>=4)canopy(1040,742,145,'#87a4ad');if(l>=5){sign(955,758,'蓝湾渔业',5);lamp(ctx,1092,794)}}
 function parkUpgrades(){const l=state.facilities[3];if(l>=2){bench(ctx,465,958);for(let j=0;j<10;j++)flower(ctx,568+j*7,951+j%2*7,'#d9bed2',1.4)}if(l>=4){ellipse(ctx,457,872,30,14,'#d3d8bc');ellipse(ctx,457,867,25,10,'#95bdb5');line(ctx,[[457,867],[457,839]],'#badad0',3);ellipse(ctx,457,836,5,4,'#d5e8d1');for(let j=0;j<3;j++)ellipse(ctx,449+j*8,845+(t*20+j*8)%20,1,2,'#e7f0d6')}if(l>=5){line(ctx,[[589,943],[589,899],[628,884],[660,903],[660,946]],'#eee3bb',5);for(let j=0;j<8;j++)flower(ctx,590+j*9,900-Math.sin(j/7*Math.PI)*17,'#d8b3bc',1.3);sign(395,981,'繁花乐园',5)}}
 function cafeUpgrades(){const l=state.facilities[4];if(l>=2){round(ctx,649,414,37,18,4,'#d7c297');round(ctx,650,409,36,7,3,'#f5e7c5')}if(l>=3)house(688,370,1,l,.75);if(l>=4){bench(ctx,760,478);sign(790,449,'日光咖啡',l)}if(l>=5){line(ctx,[[635,387],[782,375]],'#9c9d7c',1);for(let j=0;j<8;j++)ellipse(ctx,640+j*19,387-j*1.5,2.5,3,'#fff1ae')}}
 function workshopUpgrades(){const l=state.facilities[2];if(l>=2){ctx.save();ctx.translate(61,27);workshop();ctx.restore()}if(l>=3){ctx.save();ctx.translate(15,62);workshop();ctx.restore()}if(l>=4)canopy(390,390,150,'#c4ad82');if(l>=5)sign(466,401,'海岛建造所',5)}
 function stageUpgrades(){const l=state.facilities[6];if(l>=2){poly(ctx,[[755,1026],[833,993],[897,1025],[830,1070]],'#c4a582');line(ctx,[[757,1024],[830,1057],[896,1024]],'#e3c293',3)}if(l>=3){line(ctx,[[762,1020],[762,966],[873,966],[873,1020]],'#a8a284',4);poly(ctx,[[764,970],[870,970],[870,1006],[764,1006]],'#a7acb6');text(ctx,'BLUE BAY',817,991,12,'#e8e9cd')}if(l>=4){for(let j=0;j<6;j++)ellipse(ctx,770+j*18,963,3,4,['#ead6aa','#c9d8b8','#dfc3b7'][j%3])}if(l>=5){sign(815,949,'海岛音乐会',5);round(ctx,755,1029,20,26,3,'#6e8985');round(ctx,878,1020,20,26,3,'#6e8985')}}
 function crate(x,y){poly(ctx,[[x-12,y-14],[x,y-19],[x+13,y-13],[x,y-7]],'#dabd87');poly(ctx,[[x-12,y-14],[x,y-7],[x,y+6],[x-12,y]],'#c3a67a');poly(ctx,[[x,y-7],[x+13,y-13],[x+13,y],[x,y+6]],'#b29b73');line(ctx,[[x-10,y-10],[x-1,y+2]],'#e9cc98',2)}
 function resident(x,y,role,id,scale=1,face=1,level=1){
  const walk=['walk','carry','bucket','serve','timber','cargo','sweep','guide'].includes(role),bob=walk?Math.abs(Math.sin(t*5+id))*2:Math.sin(t*1.7+id)*.4;
  ctx.save();ctx.translate(x,y);ctx.scale(scale*face,scale);ellipse(ctx,0,2,10,4,'#4e7c6428');ctx.translate(0,-bob);
  const stride=walk?Math.sin(t*5+id)*4:0;line(ctx,[[-3,-4],[-4+stride,0]],'#7b8068',4);line(ctx,[[3,-4],[4-stride,0]],'#7b8068',4);
  round(ctx,-7,-22,14,19,5,level>=4?'#648f88':colors[id%colors.length]);if(level>=2&&role!=='walk'&&role!=='carry'){round(ctx,-5,-16,10,12,2,role==='fish'?'#acc1b4':'#f0e7cb');line(ctx,[[-4,-20],[-3,-9],[4,-9],[5,-20]],'#d8d2ad',1.2)}
  let arm=Math.sin(t*2+id)*2;if(['operate','grind','keys','sound'].includes(role))arm=Math.sin(t*4+id)*5;if(['prep','saw','trim','plate'].includes(role))arm=Math.sin(t*5+id)*6;if(role==='lookout')arm=10+Math.sin(t*.7)*2;if(role==='plant')arm=8+Math.sin(t*2)*5;if(role==='bbq')arm=Math.sin(t*3)*6;if(role==='hammer')arm=Math.sin(t*7)*8;if(role==='water')arm=Math.sin(t*2)*3;if(role==='dance')arm=Math.sin(t*3)*9;
  line(ctx,[[-7,-18],[-10-arm*.3,-10+arm]],'#e9caa4',4);line(ctx,[[7,-18],[10+arm*.5,-11-arm]],'#e9caa4',4);
  ellipse(ctx,0,-29,8.3,9,'#efd5b1');ellipse(ctx,-1,-34,8.5,4.7,id%3===0?'#8a8271':'#b79d75');ellipse(ctx,3,-28,1,1.3,'#65766a');ellipse(ctx,7,-25,2,1.2,'#e8b9a0');
  if(['fish','water','hammer','carry','bucket','timber','net'].includes(role)&&level<3){ellipse(ctx,0,-36,13,3.6,'#dcc795');ellipse(ctx,-1,-40,8,4.5,'#e6d2a2')}
  if(level>=3&&role!=='walk'&&role!=='carry'){
   const hat=role==='bbq'||role==='coffee'?'#faf4df':role==='hammer'?'#e1bd65':role==='fish'?'#709da7':'#8cab7a';
   ellipse(ctx,0,-36,12,3,hat);round(ctx,-8,-42,16,8,4,hat);
   if(role==='bbq'||role==='coffee'){ellipse(ctx,-5,-43,5,5,hat);ellipse(ctx,2,-45,6,6,hat);ellipse(ctx,8,-42,4,4,hat)}
  }
  if(level>=4){ellipse(ctx,3,-13,2,2,'#e8c86a');line(ctx,[[-6,-19],[5,-19]],'#fff2ca',1)}
  if(level===5){poly(ctx,[[-4,-23],[0,-19],[4,-23],[0,-25]],'#dfb56b')}
  if(role==='fish'){const lift=Math.sin(t*.8+id)*4;line(ctx,[[10,-16],[31,-56-lift]],level>=3?'#739baa':'#8c8d70',level>=4?3:2);line(ctx,[[31,-56-lift],[52,-9]],'#eff0d79a',.8);ellipse(ctx,52,-6,10+Math.sin(t*2)*3,3,'#e0eee57a');if(Math.sin(t*.8+id)>.96){poly(ctx,[[43,-10],[49,-16],[55,-10],[49,-5]],'#b8d6c5')}}
  if(role==='hammer'){line(ctx,[[12,-15-arm],[19,-25-arm]],'#a89673',3);line(ctx,[[15,-28-arm],[24,-22-arm]],'#94a192',5)}
  if(role==='water'){ellipse(ctx,15,-12,7,5,'#91b5ac');line(ctx,[[20,-12],[28,-6]],'#91b5ac',3);for(let j=0;j<4;j++)ellipse(ctx,29+j*3,-4+(t*14+j*4)%13,1,1.5,'#c9e2d5')}
  if(role==='coffee'||role==='read'){if(role==='coffee'){round(ctx,8,-14,8,8,2,'#fff2d2');steam(12,-16)}else{poly(ctx,[[5,-18],[14,-14],[23,-18],[22,-6],[14,-3],[5,-7]],'#efe2b9');line(ctx,[[14,-14],[14,-3]],'#d4c59f',1)}}
  if(role==='bbq'){line(ctx,[[10,-13-arm],[25,-15-arm]],'#a1a287',2);poly(ctx,[[23,-18-arm],[32,-16-arm],[30,-12-arm],[22,-14-arm]],'#cfab79')}if(role==='carry')crate(11,-8);
  if(role==='music'){ellipse(ctx,8,-12,8,10,'#d4b279');line(ctx,[[11,-16],[24,-32]],'#ac926e',4);line(ctx,[[2,-14],[14+Math.sin(t*5)*3,-10]],'#e9caa4',3)}
  if(role==='bucket')bucket(13,-8,(t*.115+id*.071)%1<.5);
  if(role==='operate'){line(ctx,[[8,-15],[20,-17-Math.sin(t*3)*4]],'#e9caa4',3);wheel(19,-16,8,t)}
  if(role==='lookout'||role==='guide'){const scan=Math.sin(t*.65+id)*3;line(ctx,[[7,-18],[9+scan,-29]],'#e9caa4',4);ellipse(ctx,11+scan,-29,4,4,'#71887f');ellipse(ctx,17+scan,-29,4,4,'#71887f');ellipse(ctx,18+scan,-29,2,2,'#bcd6cf')}
  if(role==='sort'||role==='plate'){round(ctx,7,-12,24,6,2,'#e7d7ac');ellipse(ctx,19,-14+Math.sin(t*3)*2,7,2,role==='sort'?'#a9c8b8':'#d2a87e');line(ctx,[[8,-18],[20+Math.sin(t*3)*4,-11]],'#e9caa4',3)}
  if(role==='prep'){poly(ctx,[[5,-13],[22,-17],[31,-12],[14,-8]],'#d9bb8b');line(ctx,[[13,-15],[21,-24+Math.sin(t*6)*5]],'#c9d4c4',3);for(let j=0;j<3;j++)round(ctx,13+j*5,-14,3,3,1,'#a6b57c')}
  if(role==='serve'){ellipse(ctx,16,-15,15,5,'#e8d7b4');ellipse(ctx,13,-18,5,2,'#cba27c');round(ctx,20,-24,5,9,2,'#f3e8ca');line(ctx,[[6,-17],[17,-15]],'#e9caa4',4)}
  if(role==='saw'){line(ctx,[[8,-10],[28,-17]],'#c1aa7e',6);line(ctx,[[11+Math.sin(t*4)*4,-13],[26+Math.sin(t*4)*4,-26]],'#a6b7ad',4);line(ctx,[[26+Math.sin(t*4)*4,-26],[30+Math.sin(t*4)*4,-25]],'#b69675',4)}
  if(role==='timber'){line(ctx,[[-13,-20],[27,-8]],'#c3a77a',9);line(ctx,[[-10,-22],[28,-10]],'#e4cca1',2)}
  if(role==='plan'){poly(ctx,[[3,-20],[18,-15],[28,-19],[27,-5],[17,-1],[3,-7]],'#a9c6c5');line(ctx,[[9,-15],[20,-11],[23,-15]],'#eef0d6',1.5)}
  if(role==='trim'){const cut=Math.sin(t*4)*4;line(ctx,[[9,-14],[25,-21-cut]],'#c3c9b7',2);line(ctx,[[10,-21],[24,-12+cut]],'#c3c9b7',2);ellipse(ctx,8,-15,3,3,'#98aa86')}
  if(role==='sweep'){line(ctx,[[7,-19],[25,3]],'#b59e78',2);poly(ctx,[[20,-1],[29,-3],[35,4],[24,7]],'#d6c18d')}
  if(role==='plant'){line(ctx,[[8,-12],[17,0]],'#b69d73',2);poly(ctx,[[14,-2],[22,0],[20,6]],'#a3b09c');ellipse(ctx,16,5,5,2,'#ad9c75')}
  if(role==='grind'){round(ctx,9,-15,18,14,2,'#bfa67c');ellipse(ctx,18,-17,8,3,'#dcccab');line(ctx,[[18,-20],[25+Math.sin(t*3)*5,-22]],'#96aaa0',2)}
  if(role==='cashier'){round(ctx,10,-14,19,12,2,'#9eb5a5');line(ctx,[[10,-18],[20+Math.sin(t*4)*3,-10]],'#e9caa4',3);round(ctx,19,-21,9,7,1,'#d9e3c9')}
  if(role==='net'){line(ctx,[[7,-18],[27,-38+Math.sin(t*2)*5]],'#a49d78',2);line(ctx,[[27,-38],[38,-9],[17,-9],[27,-38]],'#c9d8c4',1);for(let j=0;j<3;j++)line(ctx,[[21+j*3,-28+j*5],[33+j,-12]],'#bdcdb9',.8)}
  if(role==='cargo')crate(12,-10);
  if(role==='drum'){ellipse(ctx,15,-11,12,5,'#e9d6af');round(ctx,3,-11,24,14,4,'#bd997a');ellipse(ctx,15,-11,12,5,'#f2e7c7');line(ctx,[[4,-18],[15,-23+Math.sin(t*8)*8]],'#d2bb8c',2);line(ctx,[[23,-18],[17,-22+Math.cos(t*8)*8]],'#d2bb8c',2)}
  if(role==='keys'||role==='sound'){round(ctx,4,-14,32,10,3,'#81958b');for(let j=0;j<7;j++)round(ctx,7+j*4,-13,2,7,1,role==='keys'?'#eee8d0':'#b8cbb6');line(ctx,[[8,-18],[18+Math.sin(t*5)*5,-9]],'#e9caa4',3)}
  if(role==='conduct'){line(ctx,[[7,-19],[23,-28-Math.sin(t*3)*8]],'#e9caa4',3);line(ctx,[[23,-28-Math.sin(t*3)*8],[34,-42-Math.sin(t*3)*8]],'#eee8cb',1.5)}
  if(role==='dance'){ctx.translate(0,Math.sin(t*3+id)*2);if(Math.sin(t*2+id)>.4)text(ctx,'♪',18,-40-Math.sin(t*2)*4,12,'#e9d7a1')}
  ctx.restore();hits.push({kind:'person',role,id,x,y:y-18,r:22*scale})
 }
 function workerPose(job){if(!job.path)return {x:job.x,y:job.y,face:job.face};const path=job.path,phase=((t*.115+job.id*.071)%1)*(path.length-1),segment=Math.floor(phase),k=phase-segment,a=path[segment],b=path[segment+1];return{x:a[0]+(b[0]-a[0])*k,y:a[1]+(b[1]-a[1])*k,face:b[0]>=a[0]?1:-1}}
 function walker(id,region=0){const main=[[340,418],[390,480],[575,500],[735,467],[715,395],[565,402],[480,380],[360,401]];const r=REGIONS[region];const path=region===0?main:[[r.x-65,r.y+15],[r.x-15,r.y+40],[r.x+65,r.y+15],[r.x+25,r.y-15]];const p=(t*.055+id*.19)%1*path.length,i=Math.floor(p),k=p-i,a=path[i],b=path[(i+1)%path.length];const x=a[0]+(b[0]-a[0])*k,y=a[1]+(b[1]-a[1])*k;return {x,y,draw:()=>resident(x,y,has('harbor')&&id%7===0?'carry':'walk',id,1,b[0]>a[0]?1:-1)}}
 function facilityMarker(i,x,y,locked){const scale=baseScale()*camera.zoom,screen=worldToScreen(x,y);if(screen.x<18||screen.x>W-18||screen.y<155||screen.y>H-155)return;const r=13/scale;ellipse(ctx,x,y,r,r,locked?'#fff5d4cf':'#fffbe3b5');text(ctx,locked?'＋':ACTIVITIES[i].icon,x,y+4/scale,14/scale,locked?'#a0a987':'#7f987b');hits.push({kind:'facility',i,x,y,r:22/scale})}
 function label(str,x,y,locked=false){const w=str.length*12+36;round(ctx,x-w/2,y-17,w,31,15,locked?'#e3efe6af':'#fff7ddd9');text(ctx,(locked?'⌑ ':'')+str,x,y+3,12,locked?'#789c96':'#728970');if(locked)hits.push({kind:'region',x,y,r:55})}
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
  if(terrainKey!==state.facilities.join())rebuildTerrain();ctx.drawImage(terrain,0,0);
  // Faraway sandbars keep the horizon alive while the inhabited bays grow.
  ellipse(ctx,96,285,46,19,'#b8dcd0');ellipse(ctx,96,280,36,13,'#f3dfae');palm(ctx,98,280,.65);ellipse(ctx,1033,429,35,15,'#ebdaad');tree(ctx,1035,425,.45);
  boat(160+Math.sin(t*.075)*85,560+Math.cos(t*.075)*45,.95,Math.cos(t*.075)>0?1:-1);boat(1000+Math.sin(t*.055)*80,305+Math.cos(t*.055)*35,.7,-1);
  if(boatFlash>t)boat(185+(boatFlash-t)*8,500,.6);
  const entities=[];
  if(has('fish'))entities.push({y:420,draw:fishingStation},{y:502,draw:()=>crate(211,505)});
  if(has('bbq'))entities.push({y:590,draw:bbqRoof},{y:625,draw:bbqStations},{y:600,draw:barbecue});
  if(has('cabin')){entities.push({y:385,draw:()=>extraStations(2)},{y:345,draw:()=>house(440,345,0,state.facilities[2])},{y:388,draw:workshop},{y:390,draw:workshopUpgrades});if(state.facilities[2]>=2)entities.push({y:325,draw:()=>house(565,325,1,1,.85)});if(state.facilities[2]>=4)entities.push({y:455,draw:()=>house(570,455,2,1,.9)})}
  if(has('cafe'))entities.push({y:375,draw:cafeUpgrades},{y:390,draw:()=>extraStations(4)},{y:395,draw:coffee});
  if(has('park')){entities.push({y:850,draw:parkUpgrades},{y:865,draw:()=>extraStations(3)});if(state.facilities[3]>=3)entities.push({y:866,draw:windmill})}
  if(has('harbor'))entities.push({y:710,draw:harborEquipment},{y:711,draw:()=>extraStations(5)},{y:734,draw:()=>crate(930,734)});
  if(has('stage'))entities.push({y:990,draw:stageUpgrades},{y:1000,draw:stage});
  const staff=staffing();
  for(let i=0;i<ACTIVITIES.length;i++)if(state.facilities[i]){
   for(const job of jobPlan(i)){const worker=workerPose(job);entities.push({y:worker.y,draw:()=>resident(worker.x,worker.y,job.role,job.id,1.1,worker.face,state.facilities[i])})}
   const a=ACTIVITIES[i];hits.push({kind:'facility',i,x:a.x,y:a.y-18,r:55})
  }
  const areas=[0,...(has('bbq')?[1]:[]),...(has('harbor')?[2]:[]),...(has('park')?[3]:[]),...(has('stage')?[4]:[])];
  for(let j=0;j<idle();j++){const id=35+j;const region=j<5?0:areas[j%areas.length];if(has('stage')&&j<2)entities.push({y:1060-j*15,draw:()=>resident(855+j*22,1060-j*15,'dance',id,1.1)});else entities.push(walker(id,region))}
  entities.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  const markers=[[112,593],[110,759],[321,477],[345,1000],[846,502],[1130,848],[1000,1104]];
  if(!$('game').classList.contains('zen')){
   for(let i=0;i<7;i++)if(state.facilities[i]){const [x,y]=markers[i];facilityMarker(i,x,y,false)}
   const next=nextIndex();if(next>=0){const a=ACTIVITIES[next],ghost=[1,3,5,6].includes(next);if(ghost){ctx.save();ctx.globalAlpha=.24;ellipse(ctx,a.x,a.y,100,46,'#d6e8d3');ctx.restore()}facilityMarker(next,a.x,a.y+(ghost?0:-35),true)}
  }
  if(!paused&&!reduced&&Math.floor(t/4)!==lastIncomePulse){lastIncomePulse=Math.floor(t/4);for(let i=0;i<7;i++)if(state.facilities[i])particles.push({x:ACTIVITIES[i].x+35,y:ACTIVITIES[i].y-72,kind:'spark',start:effectTime,life:1.3,seed:i})}
  const fishX=has('harbor')?1080:210,fishY=has('harbor')?810:550;const leap=(t*.2)%1;if(has('fish')&&leap<.2){const k=leap/.2;poly(ctx,[[fishX,fishY-Math.sin(k*Math.PI)*25],[fishX+9,fishY-5-Math.sin(k*Math.PI)*25],[fishX+15,fishY-Math.sin(k*Math.PI)*25],[fishX+8,fishY+5-Math.sin(k*Math.PI)*25]],'#e4edcc')}
  if(has('park'))for(let i=0;i<4;i++){const x=520+Math.sin(t*.6+i*2)*70,y=835+Math.cos(t*.7+i)*25;ellipse(ctx,x,y,Math.abs(Math.sin(t*7+i))*4+1,3,'#f5e6a6')}
  for(let i=0;i<4;i++)seagull(350+Math.sin(t*.07+i*1.8)*400,210+Math.cos(t*.07+i)*70,i);
  for(const p of particles){const age=effectTime-p.start;if(age>p.life)continue;ctx.globalAlpha=1-age/p.life;const py=p.y-age*(p.kind==='greet'?20:55),px=p.x+Math.sin(age*2+p.seed)*age*15;if(p.kind==='spark'){ellipse(ctx,px,py,3,3,'#f4de9a')}else if(p.kind==='coin')text(ctx,'✦',px,py,22,'#ffeb9e');else if(p.kind==='earn'){text(ctx,p.msg,px,py,16,'#fff1b2')}else if(p.kind==='greet'){round(ctx,px-27,py-17,54,24,10,'#fff9df');text(ctx,p.msg,px,py,10,'#719179')}else{ctx.save();ctx.translate(px,py);ctx.rotate(age+p.seed);ctx.fillStyle=p.seed%2?'#f6deb0':'#d4e9b9';ctx.fillRect(-3,-3,6,6);ctx.restore()}ctx.globalAlpha=1}particles=particles.filter(p=>effectTime-p.start<p.life);
  ctx.setTransform(DPR,0,0,DPR,0,0);
 }
 function burst(x,y,kind){const n=kind==='unlock'?34:kind==='coin'?12:20;for(let i=0;i<n;i++)particles.push({x:x+(hash(i+1)-.5)*100,y:y+(hash(i+9)-.5)*45,kind,start:effectTime,life:1.8+hash(i)*1.3,seed:i})}
 function home(){focusTarget={x:550,y:unlocked()<2?475:has('park')?630:530,zoom:unlocked()<2?1.5:1.2}}
 function focus(x,y,zoom=1.5){focusTarget={x,y,zoom}}
 function inspectWork(i){const a=ACTIVITIES[i];focus(i===1?300:a.x,i===1?678:i===0?515:a.y,1.95)}
 function tap(x,y){const p=screenToWorld(x,y);const hit=[...hits].reverse().find(h=>Math.hypot(h.x-p.x,h.y-p.y)<h.r);if(!hit)return;
  if(hit.kind==='facility')openActivity(hit.i);
  if(hit.kind==='person'){const words={bbq:['翻个面吧','烤鱼好香'],walk:['你好呀','海风真好','去散个步'],carry:['新鲜的鱼','借过一下'],hammer:['快修好啦','笃笃笃'],fish:['等一条鱼','嘘…上钩了'],water:['慢慢长大','花开啦'],coffee:['来杯咖啡？','刚刚煮好'],read:['再读一页','真舒服呀'],music:['♪ 海的歌','一起听吧'],dance:['啦啦啦','跟着摇摆']};const list=words[hit.role]||[`${ROLE_NAMES[hit.role]||'工作'}中`, '配合得真好'];particles.push({x:hit.x,y:hit.y-30,kind:'greet',msg:list[Math.floor(hash(t)*list.length)],start:effectTime,life:2.8,seed:0})}
 }
 function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;canvas.setPointerCapture(e.pointerId);const p=point(e);pointers.set(e.pointerId,p);focusTarget=null;if(pointers.size===1){tapStart={...p};moved=false;gesture={...p,cx:camera.x,cy:camera.y}}else if(pointers.size===2){moved=true;const a=[...pointers.values()];gesture={pinch:true,dist:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),zoom:camera.zoom}}});
 canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const p=point(e);pointers.set(e.pointerId,p);if(pointers.size===2&&gesture?.pinch){const a=[...pointers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);camera.zoom=Math.max(.65,Math.min(3.8,gesture.zoom*d/Math.max(gesture.dist,1)));return}if(pointers.size===1&&gesture&&!gesture.pinch){const dx=p.x-gesture.x,dy=p.y-gesture.y;if(Math.hypot(dx,dy)>7)moved=true;const s=baseScale()*camera.zoom;camera.x=Math.max(-100,Math.min(1300,gesture.cx-dx/s));camera.y=Math.max(100,Math.min(1300,gesture.cy-dy/s))}});
 function end(e){const p=point(e);if(pointers.size===1&&!moved&&tapStart)tap(p.x,p.y);pointers.delete(e.pointerId);if(pointers.size===1){const a=[...pointers.values()][0];gesture={...a,cx:camera.x,cy:camera.y};moved=true}else gesture=null;tapStart=null}
 canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);gesture=null;moved=true;tapStart=null});canvas.addEventListener('lostpointercapture',e=>pointers.delete(e.pointerId));
 canvas.addEventListener('wheel',e=>{e.preventDefault();focusTarget=null;camera.zoom=Math.max(.65,Math.min(3.8,camera.zoom*Math.exp(-e.deltaY*.001)))},{passive:false});
 canvas.addEventListener('keydown',e=>{const keys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','-','Home'];if(!keys.includes(e.key))return;e.preventDefault();focusTarget=null;if(e.key==='Home')home();if(e.key==='ArrowUp')camera.y-=35;if(e.key==='ArrowDown')camera.y+=35;if(e.key==='ArrowLeft')camera.x-=35;if(e.key==='ArrowRight')camera.x+=35;if(e.key==='+')camera.zoom=Math.min(3.8,camera.zoom*1.15);if(e.key==='-')camera.zoom=Math.max(.65,camera.zoom/1.15)});
 $('zoomIn').onclick=()=>{focusTarget=null;camera.zoom=Math.min(3.8,camera.zoom*1.25)};$('zoomOut').onclick=()=>{focusTarget=null;camera.zoom=Math.max(.65,camera.zoom/1.25)};$('recenter').onclick=home;
 window.islandScene={home,focus,inspectWork,burst,arrival:()=>{boatFlash=t+5},get reduced(){return reduced},toggleMotion(){reduced=!reduced},screenToWorld,worldToScreen};
 addEventListener('resize',resize);resize();home();requestAnimationFrame(draw);
})();
