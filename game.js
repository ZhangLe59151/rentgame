'use strict';
const ACTIVITIES=[
 {id:'fish',name:'岸边钓鱼',icon:'♧',cost:50,people:1,rate:2,cap:2,role:'fish',worker:'阿潮',x:250,y:502,desc:'为第一个岛民准备鱼竿。他会一直钓鱼，把收获换成金币。'},
 {id:'bbq',name:'海风烧烤',icon:'♨',cost:180,people:3,rate:5,cap:2,role:'bbq',worker:'阿炭',x:280,y:650,desc:'在新海湾点起炭火。专职厨师反复翻烤、装盘，让香气吸引新邻居。'},
 {id:'cabin',name:'小屋工坊',icon:'⌂',cost:420,people:5,rate:8,cap:3,role:'hammer',worker:'阿木',x:470,y:370,desc:'木匠开始敲敲打打，建起海边小屋。工坊持续带来收入和更多居住名额。'},
 {id:'park',name:'风铃公园',icon:'❀',cost:900,people:8,rate:14,cap:4,role:'water',worker:'阿芽',x:510,y:917,desc:'修起花田与风车。园丁每天浇花、打理公园，游园收益让小岛继续成长。'},
 {id:'cafe',name:'日光咖啡',icon:'☕',cost:1800,people:12,rate:23,cap:5,role:'coffee',worker:'小葵',x:700,y:395,desc:'咖啡师不停磨豆、冲泡。多一个停留的理由，也多一份稳定收入。'},
 {id:'harbor',name:'潮汐渔港',icon:'⚓',cost:3600,people:17,rate:38,cap:6,role:'fish',worker:'阿帆',x:832,y:678,desc:'修通渔港和长栈桥。专业渔夫开始工作，带来更丰富的渔获和居住空间。'},
 {id:'stage',name:'星光乐台',icon:'♫',cost:7200,people:23,rate:65,cap:8,role:'music',worker:'小弦',x:835,y:1026,desc:'让海边响起音乐。乐手持续演出，邻居聚在一起跳舞，演出收益不断增长。'}
];
const REGIONS=[{x:550,y:415},{x:280,y:666},{x:832,y:678},{x:510,y:917},{x:835,y:1026}];
const TYPES=[{color:'#c77d64'},{color:'#739a7d'},{color:'#779eae'},{color:'#d2ab65'}];
const STAGES=[
 ['岸边鱼竿','鱼桶接力站','简易收线站','协作渔站','蓝湾渔业线'],
 ['炭火小炉','备料烧烤摊','旋转烤坊','分工厨房','海风烧烤流水线'],
 ['木匠小桌','双人工坊','木屋作坊','精工营地','海岛建造所'],
 ['小小花圃','双人花园','风铃公园','观景花园','繁花乐园'],
 ['咖啡小摊','双人吧台','海风咖啡屋','日光咖啡馆','招牌咖啡厅'],
 ['钓鱼栈桥','双人渔桥','渔具小站','专业渔港','蓝湾渔业'],
 ['海边乐手','双人合奏','小小乐台','灯光舞台','海岛音乐会']
];
const LOOKS=[
 ['一根鱼竿，一个人等鱼。','一人垂钓，一人在钓位与鱼桶库之间搬运。','重新布置为简易收线站：垂钓、操作摇轮、登台瞭望。','加入搬桶路线，鱼竿、摇轮、瞭望和运输各司其职。','自动收线装置连接分拣台，五人分别垂钓、操作、分拣、运送、瞭望。'],
 ['一只炭火炉，一位烧烤师。','一人翻烤，另一人在独立工作台切配食材。','增加旋转烤架和送餐路线：翻烤、备料、送餐。','重新分区为烤制、备料、装盘和送餐四个岗位。','半自动旋转炉加入专职操作员，五人按工序协作。'],
 ['一张木工桌，慢慢敲打。','木匠装配，锯工在另一张桌子切木料。','装配、锯木与来回运送木料形成三道工序。','加入看图施工的领班，原有工位重新布置。','设备操作、装配、锯木、搬料和施工规划各司其职。'],
 ['一片花圃，一位园丁。','浇水和修剪分到不同花坛。','增加沿园路清扫的小路，三人各自忙碌。','新增栽种区，浇花、修剪、清扫和栽种分区协作。','园丁各司其职，巡园员在花园里往返巡视。'],
 ['一座咖啡小摊。','一人冲泡，另一人在磨豆机旁摇动手柄。','加入在吧台与露台之间送餐的服务员。','咖啡馆重新分为磨豆、冲泡、接单和送餐四个岗位。','新增备点心的工作台，五人在不同位置协作。'],
 ['一座栈桥，一位专业渔夫。','一人垂钓，另一人在栈桥另一侧收网。','搭起绞盘和观察台，改为操作、收网与瞭望。','钓鱼、操作绞盘、收网与搬货共同运转。','收网、绞盘、分拣、搬货和瞭望形成完整渔港工序。'],
 ['一位海边乐手。','吉他手和鼓手在不同位置合奏。','键盘手加入，舞台重新排成三人乐队。','加入独立调音台，乐队和音响师一起工作。','指挥站到舞台前方，五人演出各有职责。']
];
const ROLE_NAMES={fish:'垂钓',bucket:'搬鱼桶',operate:'操作装置',lookout:'瞭望鱼群',sort:'分拣渔获',bbq:'翻烤',prep:'备料',plate:'装盘',serve:'送餐',saw:'锯木',timber:'搬木料',hammer:'装配建造',plan:'看图施工',water:'浇花',trim:'修剪',sweep:'清扫',plant:'栽种',guide:'巡园',coffee:'冲泡',grind:'磨豆',cashier:'接单',net:'收网',cargo:'搬货',music:'吉他',drum:'打鼓',keys:'键盘',sound:'调音',conduct:'指挥'};
// Each tier is a complete stage plan. Earlier workers change duties and positions too.
const WORKFLOWS=[
 [
  [['fish',250,502,-1]],
  [['fish',231,512,-1],['bucket',274,525,-1,[[224,535],[288,512],[278,493],[224,535]]]],
  [['fish',205,527,-1],['operate',271,515,-1],['lookout',313,473,-1]],
  [['fish',187,545,-1],['operate',251,517,-1],['bucket',258,550,1,[[205,565],[288,546],[266,518],[205,565]]],['lookout',318,476,-1]],
  [['fish',166,549,-1],['operate',239,515,-1],['sort',300,550,1],['bucket',232,568,1,[[194,572],[293,561],[263,535],[194,572]]],['lookout',324,465,-1]]
 ],
 [
  [['bbq',268,645,1]],
  [['bbq',253,646,1],['prep',334,675,-1]],
  [['bbq',248,640,1],['prep',340,658,-1],['serve',312,715,1,[[307,702],[371,720],[355,739],[307,702]]]],
  [['bbq',239,646,1],['prep',343,654,-1],['plate',295,707,1],['serve',372,711,1,[[322,716],[399,710],[380,675],[322,716]]]],
  [['bbq',229,637,1],['operate',281,671,-1],['prep',361,650,-1],['plate',309,716,1],['serve',369,715,1,[[331,721],[404,700],[372,672],[331,721]]]]
 ],
 [
  [['hammer',338,402,1]],
  [['hammer',335,403,1],['saw',407,418,-1]],
  [['hammer',328,398,1],['saw',414,419,-1],['timber',384,449,1,[[325,449],[421,456],[450,417],[325,449]]]],
  [['hammer',329,396,1],['saw',424,420,-1],['timber',400,448,1,[[329,452],[457,448],[437,408],[329,452]]],['plan',461,390,-1]],
  [['hammer',324,395,1],['saw',426,420,-1],['timber',396,449,1,[[323,454],[464,451],[438,404],[323,454]]],['plan',470,380,-1],['operate',374,427,1]]
 ],
 [
  [['water',546,881,1]],
  [['water',550,876,1],['trim',489,936,1]],
  [['water',555,872,1],['trim',485,923,1],['sweep',575,966,-1,[[478,975],[586,975],[616,949],[478,975]]]],
  [['water',557,872,1],['trim',488,920,1],['sweep',577,969,-1,[[478,979],[596,975],[612,946],[478,979]]],['plant',597,937,-1]],
  [['water',560,868,1],['trim',478,920,1],['sweep',572,970,-1,[[465,977],[607,976],[612,936],[465,977]]],['plant',601,931,-1],['guide',423,909,1,[[404,932],[461,902],[492,904],[404,932]]]]
 ],
 [
  [['coffee',724,407,1]],
  [['coffee',726,403,1],['grind',659,426,1]],
  [['coffee',723,404,1],['grind',652,421,1],['serve',760,461,-1,[[719,443],[781,472],[749,481],[719,443]]]],
  [['coffee',722,400,1],['grind',651,420,1],['serve',760,462,-1,[[718,441],[788,474],[749,482],[718,441]]],['cashier',784,417,-1]],
  [['coffee',716,397,1],['grind',645,417,1],['prep',680,462,1],['serve',758,463,-1,[[719,442],[790,475],[740,488],[719,442]]],['cashier',794,411,-1]]
 ],
 [
  [['fish',1027,756,1]],
  [['fish',1041,766,1],['net',982,752,1]],
  [['operate',1025,749,1],['net',980,779,1],['lookout',959,720,1]],
  [['fish',1054,783,1],['operate',1023,748,1],['net',979,779,1],['cargo',1011,808,1,[[981,808],[1065,806],[1037,776],[981,808]]]],
  [['operate',1023,747,1],['net',977,781,1],['sort',1061,801,-1],['cargo',1016,818,1,[[977,816],[1074,817],[1036,778],[977,816]]],['lookout',953,714,1]]
 ],
 [
  [['music',806,1020,1]],
  [['music',786,1025,1],['drum',845,1024,-1]],
  [['music',776,1030,1],['drum',823,1019,1],['keys',873,1035,-1]],
  [['music',776,1035,1],['drum',823,1015,1],['keys',876,1035,-1],['sound',895,1069,-1]],
  [['music',770,1035,1],['drum',818,1012,1],['keys',873,1036,-1],['sound',899,1069,-1],['conduct',821,1074,-1]]
 ]
];
function jobPlan(i,level=state.facilities[i],staff=staffing()[i]){return (WORKFLOWS[i][Math.max(1,level)-1]||[]).slice(0,staff).map((j,n)=>({role:j[0],name:ROLE_NAMES[j[0]],x:j[1],y:j[2],face:j[3],path:j[4]||null,id:i*5+n}))}
function jobSummary(i,level=state.facilities[i]||1){return jobPlan(i,level,level).map(j=>j.name).join(' → ')}
const KEY='harbor-home-v3',LEGACY_KEY='harbor-home-v1',ARRIVAL=25000,MAX_OFFLINE=14400000;
const $=id=>document.getElementById(id),fmt=n=>Math.floor(n).toLocaleString('zh-CN');
function fresh(){return{version:3,coins:100,population:1,facilities:Array(7).fill(0),phase:0,earned:0,last:Date.now(),logs:['只有阿潮一个人，带着 100 金币登上了小岛。']}}
function valid(s){return s&&s.version===3&&['coins','earned','last','phase'].every(k=>Number.isFinite(s[k])&&s[k]>=0)&&s.phase<ARRIVAL&&Number.isInteger(s.population)&&s.population>=1&&s.population<=59&&Array.isArray(s.facilities)&&s.facilities.length===7&&s.facilities.every((n,i)=>Number.isInteger(n)&&n>=0&&n<=5&&(!n||i===0||s.facilities[i-1]>0)&&(!n||s.population>=ACTIVITIES[i].people))&&s.population<=1+s.facilities.reduce((n,l,i)=>n+(l?ACTIVITIES[i].cap+l-1:0),0)&&Array.isArray(s.logs)&&s.logs.every(x=>typeof x==='string')}
let state=fresh(),paused=false,lastTick=Date.now(),saveWarned=false,installPrompt=null,toastTimer,legacyExists=false;
try{const s=JSON.parse(localStorage.getItem(KEY));if(valid(s))state=s;legacyExists=!!localStorage.getItem(LEGACY_KEY)}catch{}
const has=id=>state.facilities[ACTIVITIES.findIndex(a=>a.id===id)]>0;
const unlocked=()=>state.facilities.filter(Boolean).length;
const residents=()=>state.population;
function capacity(){return 1+state.facilities.reduce((n,l,i)=>n+(l?ACTIVITIES[i].cap+l-1:0),0)}
function activityRate(i){return rateFor(i,state.facilities[i],staffing()[i])}
function income(){return state.facilities.reduce((n,_,i)=>n+activityRate(i),0)}
function nextIndex(){return state.facilities.findIndex(l=>l===0)}
function staffing(){const result=state.facilities.map(l=>l?1:0);let left=Math.max(0,state.population-result.reduce((n,v)=>n+v,0));for(let rank=2;rank<=5&&left;rank++)for(let i=0;i<7&&left;i++)if(state.facilities[i]>=rank){result[i]++;left--}return result}
function working(){return staffing().reduce((n,v)=>n+v,0)}
function idle(){return state.population-working()}
function facilityName(i,l=state.facilities[i]||1){return STAGES[i][l-1]}
function rateFor(i,l,staff){return staff?ACTIVITIES[i].rate*staff*(1+(l-1)*.15):0}
function canUnlock(i){const a=ACTIVITIES[i];return !!a&&state.facilities[i]===0&&(i===0||state.facilities[i-1]>0)&&state.population>=a.people&&idle()>=1&&state.coins>=a.cost}
function upgradeCost(i){return Math.ceil(ACTIVITIES[i].cost*1.2*2**(state.facilities[i]-1))}
function upgradePeople(i){return ACTIVITIES[i].people+state.facilities[i]}
function canUpgrade(i){return state.facilities[i]>0&&state.facilities[i]<5&&state.population>=upgradePeople(i)&&idle()>=1&&state.coins>=upgradeCost(i)}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4000)}
function save(){state.last=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state))}catch{if(!saveWarned){saveWarned=true;toast('浏览器无法保存，请在设置中导出存档。')}}}
function note(msg){state.logs.unshift(msg);state.logs=state.logs.slice(0,12)}
function settleElapsed(delta){let remaining=Math.min(MAX_OFFLINE,Math.max(0,delta)),gain=0,added=0;while(remaining>0){if(state.population>=capacity()){gain+=income()*remaining/1000;remaining=0;state.phase=0;break}const step=Math.min(remaining,ARRIVAL-state.phase);gain+=income()*step/1000;state.phase+=step;remaining-=step;if(state.phase>=ARRIVAL){state.phase=0;state.population++;added++}}state.coins+=gain;state.earned+=gain;return{gain,added}}
const offline=settleElapsed(Date.now()-state.last);
function modal(html){$('sheetContent').innerHTML=html;if(!$('sheet').open)$('sheet').showModal();$('sheet').scrollTop=0}
function closeSheet(){$('sheet').close()}
function stageName(){return ['初来乍到','第一根鱼竿','炭火与海风','小屋成家','花开的小岛','咖啡飘香','渔港日常','星光港湾'][unlocked()]}
function updateUI(){const i=nextIndex(),a=ACTIVITIES[i];$('coins').textContent=fmt(state.coins);$('rate').textContent=`+${Number(income().toFixed(1))} / 秒`;$('levelLabel').textContent=stageName();$('population').textContent=`${state.population}/${capacity()} 人 · ${working()} 人工作 · ${idle()} 人空闲`;$('guestCount').textContent=`人口上限 ${capacity()} 人`;
 $('questText').textContent=a?`下一步：${a.name}`:'小岛已热闹起来，继续升级设施吧';$('questReward').textContent=a?`${a.people}人 · ${fmt(a.cost)}✦`:'查看发展手记';
 $('rent').textContent=a?(canUnlock(i)?`解锁${a.name}`:a.name):'小岛的每一天，都在成长';$('collectHint').textContent=a?`${state.population}/${a.people} 人 · ${fmt(state.coins)}/${fmt(a.cost)} 金币`:`${state.population}/${capacity()} 人 · 持续收入 +${Number(income().toFixed(1))}/秒`;$('collect').classList.toggle('has-rent',!!a&&canUnlock(i));$('expandDot').hidden=state.population>=capacity();$('selectionHint').hidden=true;
 $('arrival').textContent=paused?'小岛时间暂停中':state.population<capacity()?`新岛民乘船抵达 · ${Math.ceil((ARRIVAL-state.phase)/1000)} 秒`:'人口已满 · 解锁或升级设施增加上限';$('cycleBar').style.width=(state.population<capacity()?state.phase/ARRIVAL*100:100)+'%';
}
function facilityArt(i,l,staff){
 const jobs=jobPlan(i,l,l),points=jobs.flatMap(j=>[[j.x,j.y],...(j.path||[])]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),minX=Math.min(...xs),minY=Math.min(...ys),dx=Math.max(...xs)-minX,dy=Math.max(...ys)-minY;
 const project=(x,y)=>[dx?25+(x-minX)/dx*170:110,dy?38+(y-minY)/dy*62:72];
 const symbols={fish:'⌁',bucket:'▱',operate:'⚙',lookout:'⌕',sort:'≋',bbq:'♨',prep:'╱',plate:'◯',serve:'▰',saw:'⋀',timber:'═',hammer:'⚒',plan:'▧',water:'⋰',trim:'✂',sweep:'╱',plant:'❀',guide:'⌕',coffee:'☕',grind:'⚙',cashier:'▣',net:'⋕',cargo:'▱',music:'♫',drum:'◉',keys:'▤',sound:'≡',conduct:'♪'};
 const links=jobs.map(j=>{const [x,y]=project(j.x,j.y);return`${x},${y}`}).join(' ');
 return `<svg viewBox="0 0 220 142" aria-hidden="true"><ellipse cx="110" cy="90" rx="105" ry="38" fill="#dfe7d1"/><ellipse cx="110" cy="94" rx="97" ry="27" fill="#ece1bc"/><polyline points="${links}" fill="none" stroke="#b7c7a5" stroke-dasharray="4 4" stroke-width="2"/>${jobs.map((j,k)=>{const [x,y]=project(j.x,j.y),active=k<staff,route=j.path?.map(p=>project(...p).join(',')).join(' ');return `${route?`<polyline class="work-route" points="${route}" fill="none" stroke="#b6bda3" stroke-width="1.5" stroke-dasharray="3 4"/>`:''}<g transform="translate(${x},${y})" opacity="${active?1:.35}"><rect x="1" y="-10" width="23" height="13" rx="3" fill="${j.role==='operate'?'#93b1ab':'#d8c292'}"/><text x="13" y="0" text-anchor="middle" font-size="12" fill="#fff7db">${symbols[j.role]||'•'}</text><path d="M-3 2L-4 9M3 2L4 9" stroke="#81917b" stroke-width="3"/><rect x="-6" y="-13" width="12" height="17" rx="4" fill="${['#cc967e','#89a4a0','#bea477','#8faa7d','#a39cb2'][k]}"/><circle cy="-19" r="6" fill="#efd5af"/><path d="M-8-23H8" stroke="#dfcca0" stroke-width="3"/><rect x="-23" y="13" width="46" height="15" rx="6" fill="#fff8e0"/><text x="0" y="24" text-anchor="middle" font-size="8" fill="#7f936f">${j.name}</text></g>`}).join('')}</svg>`
}
function activityCard(a,i){const l=state.facilities[i],prior=i===0||state.facilities[i-1]>0,n=staffing()[i];return `<button class="facility-card ${l?'working':prior?'next':'locked'}" data-activity="${i}"><span class="facility-symbol">${a.icon}</span><div><strong>${l?facilityName(i):a.name}<small>${l?`Lv.${l} · ${n}/${l} 人工作`:prior?'下一步':'未解锁'}</small></strong><p>${l?`+${Number(activityRate(i).toFixed(1))} 金币/秒 · 人口上限 +${a.cap+l-1}`:`需要 ${a.people} 人 + ${fmt(a.cost)} 金币`}</p><span>${l?(l===5?'满级设施 · 点击查看':`下一级分工：${jobSummary(i,l+1)}`):`解锁后 +${a.rate}/秒 · 人口上限 +${a.cap}`}</span></div><b>${l?(l===5?'✦':'升级 ↗'):prior?'＋':'⌑'}</b></button>`}
function openFacilities(){modal(`<p class="eyebrow">GROW TOGETHER, WORK TOGETHER</p><h2>让小事业，慢慢长大</h2><p class="intro">每一级都会重新布置工序：有人生产、有人操作设备、有人搬运。新增岛民会加入不同岗位，组成协作小队。</p><div class="staff-summary">${working()} 人工作 · <b>${idle()} 人空闲</b> · 全岛 ${state.population}/${capacity()} 人</div>${ACTIVITIES.map(activityCard).join('')}`);document.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>openActivity(Number(b.dataset.activity)))}
function openActivity(i){
 const a=ACTIVITIES[i],l=state.facilities[i],prior=i===0||state.facilities[i-1]>0,n=staffing()[i],max=l===5;
 let body='';
 if(l){
  if(max)body='<div class="intro-banner">已经是招牌级设施！大家在这里一起工作。</div>';
  else body=`<section class="upgrade-preview"><span>下一级 · ${facilityName(i,l+1)}</span><strong>Lv.${l} → Lv.${l+1}</strong><p id="upgradeForecast">工作人员 ${n} → ${n+1} 人<br>收入 +${Number(activityRate(i).toFixed(1))} → +${Number(rateFor(i,l+1,n+1).toFixed(1))} 金币/秒<br>人口上限额外 +1</p><div class="next-look">${LOOKS[i][l]}<br><b>${jobSummary(i,l+1)}</b></div></section><div class="requirement"><span>岛上人数门槛（不消耗）</span><strong id="requirementPeople">${state.population} / ${upgradePeople(i)} 人</strong></div><div class="requirement"><span>增加 1 位工作人员</span><strong id="requirementStaff">空闲 ${idle()} / 需要 1 人</strong></div><div class="requirement"><span>升级花费金币</span><strong id="requirementCoins">${fmt(state.coins)} / ${fmt(upgradeCost(i))}</strong></div><button class="primary" id="facilityAction" ${!canUpgrade(i)?'disabled':''}>升级并安排 1 人 · ✦ ${fmt(upgradeCost(i))}</button>`;
  body+=`<p class="note">${n<l?'现有岗位尚未坐满，新居民上岛后会自动补位。':''}每处设施最多 5 级。工人仍然是岛民，不会消失或被消耗。</p>`;
 }else body=`<div class="requirement"><span>岛上人数（不消耗）</span><strong id="requirementPeople">${state.population} / ${a.people} 人</strong></div><div class="requirement"><span>安排 1 位工作人员</span><strong id="requirementStaff">空闲 ${idle()} / 需要 1 人</strong></div><div class="requirement"><span>花费金币</span><strong id="requirementCoins">${fmt(state.coins)} / ${fmt(a.cost)}</strong></div>${!prior?`<p class="note">先解锁${ACTIVITIES[i-1].name}，故事才能继续。</p>`:''}<button class="primary" id="facilityAction" ${!canUnlock(i)?'disabled':''}>${prior?`解锁${a.name}`:`先解锁${ACTIVITIES[i-1].name}`}</button>`;
 modal(`<p class="eyebrow">${l?'A LITTLE BUSINESS, GROWING UP':'A NEW CHAPTER'}</p><div class="facility-preview">${facilityArt(i,l||1,n||1)}</div><h2>${l?facilityName(i):a.name}${l?` · Lv.${l}`:''}</h2><div class="level-steps">${Array.from({length:5},(_,k)=>`<span class="${k<l?'lit':''}">${k+1}</span>`).join('')}</div><p class="intro">${l?LOOKS[i][l-1]:a.desc}</p><div class="workflow-summary">${jobSummary(i,l||1)}</div><div class="stat-row"><div>持续金币收入<strong id="detailRate">+${Number((l?activityRate(i):a.rate).toFixed(1))}<small> /秒</small></strong></div><div>工作岗位<strong id="detailWorkers">${n} / ${l||1}<small> 人</small></strong></div><div>人口名额<strong>+${l?a.cap+l-1:a.cap}</strong></div></div>${body}${l?'<button class="secondary view-work" id="viewWork">⌖ 查看工作现场</button>':''}<section class="job-roster"><h3>这一等级的工作安排</h3>${jobPlan(i,l||1,l||1).map((j,k)=>`<div class="job-row ${k<n?'active':'vacant'}"><span>${k+1}</span><strong>${j.name}</strong><small>${k<n?'已就位':'等待岛民'}</small></div>`).join('')}</section><button class="secondary" id="backFacilities" style="width:100%;margin-top:10px">查看全部设施与升级</button>`);
 if($('facilityAction'))$('facilityAction').onclick=()=>l?upgrade(i):unlock(i);$('backFacilities').onclick=openFacilities;if($('viewWork'))$('viewWork').onclick=()=>{closeSheet();window.islandScene?.inspectWork(i)};activeDetail=i;refreshDetail()
}
function refreshDetail(){if(activeDetail===null||!$('sheet').open)return;const i=activeDetail,l=state.facilities[i],people=l?upgradePeople(i):ACTIVITIES[i].people,cost=l?upgradeCost(i):ACTIVITIES[i].cost;if($('facilityAction'))$('facilityAction').disabled=l?!canUpgrade(i):!canUnlock(i);if($('requirementPeople')){$('requirementPeople').textContent=`${state.population} / ${people} 人`;$('requirementPeople').classList.toggle('met',state.population>=people)}if($('requirementCoins')){$('requirementCoins').textContent=`${fmt(state.coins)} / ${fmt(cost)}`;$('requirementCoins').classList.toggle('met',state.coins>=cost)}if($('requirementStaff')){$('requirementStaff').textContent=`空闲 ${idle()} / 需要 1 人`;$('requirementStaff').classList.toggle('met',idle()>=1)}const n=staffing()[i];if($('detailWorkers'))$('detailWorkers').textContent=`${n} / ${l||1} 人`;if($('detailRate'))$('detailRate').textContent=`+${Number((l?activityRate(i):ACTIVITIES[i].rate).toFixed(1))} /秒`;if(l&&l<5&&$('upgradeForecast'))$('upgradeForecast').innerHTML=`工作人员 ${n} → ${n+1} 人<br>收入 +${Number(activityRate(i).toFixed(1))} → +${Number(rateFor(i,l+1,n+1).toFixed(1))} 金币/秒<br>人口上限额外 +1`;}
let activeDetail=null;
function unlock(i){if(!canUnlock(i))return;const a=ACTIVITIES[i];state.coins-=a.cost;state.facilities[i]=1;note(`${a.worker}开始${a.name}，人口上限增加 ${a.cap} 人。`);save();updateUI();closeSheet();window.islandScene?.focus(a.x,a.y,1.6);window.islandScene?.burst(a.x,a.y,'unlock');toast(`${a.name}开始工作！+${a.rate} 金币/秒，人口上限 +${a.cap}。`)}
function upgrade(i){if(!canUpgrade(i))return;state.coins-=upgradeCost(i);state.facilities[i]++;note(`${ACTIVITIES[i].name}升级至 ${state.facilities[i]} 级，新增一位工作人员。`);save();updateUI();closeSheet();window.islandScene?.burst(ACTIVITIES[i].x,ACTIVITIES[i].y,'build');window.islandScene?.focus(ACTIVITIES[i].x,ACTIVITIES[i].y,1.9);toast(`${facilityName(i)}升级完成！${jobSummary(i)}各自就位。`)}
function openRoute(){modal(`<p class="eyebrow">A NEW NEIGHBOR IS ON THE WAY</p><h2>等待下一次相遇</h2><div class="stat-row"><div>岛上居民<strong>${state.population}</strong></div><div>人口上限<strong>${capacity()}</strong></div><div>工作中的岛民<strong>${working()}</strong></div></div><div class="intro-banner">${state.population<capacity()?`客船每 25 秒带来 1 位新居民。<br>下一位将在 ${Math.ceil((ARRIVAL-state.phase)/1000)} 秒后到达。`:'人口名额已经住满了。<br>解锁或升级任意设施，提高上限后，新居民会继续乘船前来。'}</div><p class="intro" style="margin-top:17px">新居民会先在岛上散步。满足人数与金币条件，解锁新设施后，其中一位就会成为专职工作人员。</p><button class="primary" id="routeFacilities">看看下一处设施</button>`);$('routeFacilities').onclick=openFacilities}
function openResidents(){modal(`<p class="eyebrow">EVERY NEW FACE HAS A STORY</p><h2>${state.population} 个人的小岛生活</h2><div class="intro-banner">${working()} 位岛民在设施工作，${idle()} 位邻居在享受海风。<br>所有工作都持续产生金币，当前 +${Number(income().toFixed(1))}/秒。</div>${ACTIVITIES.map((a,i)=>state.facilities[i]?`<div class="resident-row"><span class="resident-icon">${a.icon}</span><div><strong>${a.worker}的小队 · ${facilityName(i)}</strong><small>${staffing()[i]}/${state.facilities[i]} 人 · Lv.${state.facilities[i]} · 持续收入 +${Number(activityRate(i).toFixed(1))}/秒<br>${jobPlan(i).map(j=>j.name).join('、')}</small></div><span class="status">协作中</span></div>`:'').join('')}${!unlocked()?'<p class="intro" style="margin-top:18px">阿潮刚刚上岛，还没有工作。先给他解锁岸边钓鱼吧。</p>':''}<p class="note">点画面里的居民可以打招呼。单指拖动、双指缩放，点 ◉ 静静看岛。</p>`)}
function openJournal(){modal(`<p class="eyebrow">ISLAND JOURNAL</p><h2>从一个人开始的故事</h2><p class="intro">先有一根鱼竿，再有炭火、屋檐和花园。</p><div class="intro-banner">累计生产 ${fmt(state.earned)} 金币<br>当前 ${state.population}/${capacity()} 人 · ${unlocked()}/7 处设施</div><p class="welcome">${state.logs.map(x=>x.replace(/[<>&]/g,'')).join('<br>')}</p><button class="primary" id="journalNext">查看下一步</button>`);$('journalNext').onclick=()=>nextIndex()<0?openFacilities():openActivity(nextIndex())}
function download(s,name){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(s,null,2)],{type:'application/json'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function openSettings(){modal(`<p class="eyebrow">TAKE YOUR TIME</p><h2>海风里的设置</h2><div class="option-row"><span>小岛时间</span><button id="pause">${paused?'继续生活':'暂停生活'}</button></div><div class="option-row"><span>动画效果</span><button id="motion">${window.islandScene?.reduced?'恢复动画':'减少动画'}</button></div><div class="option-row"><span>当前旅程备份</span><button id="export">导出存档</button></div><div class="option-row"><span>恢复当前玩法存档</span><button id="importButton">导入存档</button></div>${legacyExists?'<div class="option-row"><span>保留的 V1 / V2 旧旅程</span><button id="exportLegacy">导出旧版存档</button></div>':''}<div class="option-row"><span>安装到手机桌面</span><button id="install">安装方法</button></div><p class="note">V6 · 看清每个人的小日子<br>金币自动增长，离线最多累计 4 小时收入与新居民。人数为解锁门槛、不消耗；设施等级决定岗位数，每升一级多 1 位工作人员；需要有空闲岛民加入。进度保存在当前浏览器。<br>成长版本共用当前旅程，更新不重置进度；V1 / V2 备份独立保留。</p>`);$('pause').onclick=()=>{paused=!paused;lastTick=Date.now();openSettings()};$('motion').onclick=()=>{window.islandScene?.toggleMotion();openSettings()};$('export').onclick=()=>{save();download(state,'航途小岛-成长存档.json')};$('importButton').onclick=()=>$('import').click();if($('exportLegacy'))$('exportLegacy').onclick=()=>{try{download(JSON.parse(localStorage.getItem(LEGACY_KEY)),'航途小岛-旧版存档.json')}catch{toast('没有找到旧版存档。')}};$('install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null}else toast('iPhone：Safari 分享 → 添加到主屏幕；Android：浏览器菜单 → 安装应用。')}}
$('closeSheet').onclick=closeSheet;$('sheet').addEventListener('click',e=>{if(e.target===$('sheet')){const r=$('sheet').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeSheet()}});
$('collect').onclick=()=>nextIndex()<0?openFacilities():openActivity(nextIndex());$('buildMenu').onclick=openFacilities;$('expandMenu').onclick=openRoute;$('residentsMenu').onclick=openResidents;$('islandInfo').onclick=openJournal;$('settings').onclick=openSettings;$('quest').onclick=()=>nextIndex()<0?openJournal():openActivity(nextIndex());$('cancelBuild').onclick=()=>{};
$('fullScreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('iPhone 可添加到主屏幕，获得独立全屏体验。')}catch{toast('可添加到主屏幕，获得独立全屏体验。')}};
$('zen').onclick=()=>{$('game').classList.add('zen');$('exitZen').hidden=false};$('exitZen').onclick=()=>{$('game').classList.remove('zen');$('exitZen').hidden=true};
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error();const s=JSON.parse(await file.text());if(!valid(s))throw Error();modal('<h2>恢复这段小岛旅程？</h2><p class="intro">将替换当前成长旅程的进度。建议先导出备份。</p><button class="primary" id="confirmImport">替换当前进度</button>');$('confirmImport').onclick=()=>{state=s;state.last=Date.now();lastTick=Date.now();save();updateUI();closeSheet();window.islandScene?.home();toast('欢迎回来，岛民都在等你。')}}catch{toast('请选择游戏导出的 成长存档，旧版存档请单独保留。')}e.target.value=''};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
updateUI();save();let lastPanelRefresh=0;setInterval(()=>{const now=Date.now(),delta=now-lastTick;lastTick=now;if(!paused){const r=settleElapsed(delta);if(r.added){note(`${r.added} 位新邻居乘船上岛，现有 ${state.population} 人。`);save();window.islandScene?.arrival();toast(`新邻居上岛了！现在 ${state.population}/${capacity()} 人。`)}}updateUI();if($('sheet').open&&activeDetail!==null&&now-lastPanelRefresh>1000){refreshDetail();lastPanelRefresh=now}},250);setInterval(save,5000);window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
setTimeout(()=>{if(offline.gain>1)toast(`离岛期间赚了 ${fmt(offline.gain)} 金币，${offline.added} 位新邻居上岛。`);else if(!unlocked())toast('只有一个人的小岛。从第一根鱼竿开始吧。')},1200);
