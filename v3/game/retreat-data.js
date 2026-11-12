export const COURTS = {
 木:{name:'青岚庭',tone:'角',season:'春',color:'#668a79',x:10,z:-66,word:'生而有序',practice:'把一件想开始的小事，留给明天的自己。'},
 火:{name:'丹霞庭',tone:'徵',season:'夏',color:'#b27f68',x:57,z:-36,word:'明而有节',practice:'想起一件让你心里明亮的事，不必急着说出来。'},
 土:{name:'含章庭',tone:'宫',season:'长夏',color:'#b39f75',x:59,z:25,word:'厚而能运',practice:'感受脚下的支撑，慢慢找到舒服的坐姿。'},
 金:{name:'听白庭',tone:'商',season:'秋',color:'#a9b4b0',x:-50,z:-12,word:'断而有义',practice:'为自己分清一件值得继续的事，与一件可以放下的事。'},
 水:{name:'玄溪庭',tone:'羽',season:'冬',color:'#648b9c',x:-37,z:-62,word:'静而能通',practice:'听一段声音的起落，让思绪自然经过。'},
};
export const OUTFITS=[
 {id:'linen',name:'月白行衣',color:'#e6dec8',accent:'#bba77a',note:'本色织物 · 入山日常'},
 {id:'jade',name:'青岚听风',color:'#81a89c',accent:'#d8c89b',note:'青绿长衫 · 草木之间'},
 {id:'ink',name:'玄青礼服',color:'#344f62',accent:'#c9b47c',note:'深青礼衣 · 观礼听音'},
 {id:'rose',name:'霞染轻袍',color:'#b98c82',accent:'#edcfaa',note:'温柔赭粉 · 相遇时光'},
];
export const GOODS=[
 {id:'lamp',icon:'灯',name:'一盏山灯',type:'可穿戴',note:'手提暖光，照亮归途',accessory:'lantern'},
 {id:'bag',icon:'囊',name:'听音布囊',type:'可穿戴',note:'把旅途的小物收好',accessory:'bag'},
 {id:'cards',icon:'音',name:'甲子音笺',type:'收藏',note:'六十干支与纳音的文化图谱'},
 {id:'journal',icon:'岁',name:'四时手账',type:'收藏',note:'记录每个季节的片刻'},
 {id:'tea',icon:'茶',name:'山间茶礼',type:'收藏',note:'把一份清闲带回日常'},
 {id:'chime',icon:'磬',name:'听山风铃',type:'收藏',note:'以一声清响纪念此行'},
];
export const SERVICES=[
 {id:'blanket',name:'一条薄毯',detail:'入帐前的保暖与舒适',result:'薄毯已放在示意席旁。',step:'取用示意'},
 {id:'backrest',name:'靠背座席',detail:'坐姿自由，不要求盘腿',result:'已为本次体验选择靠背席。',step:'座席偏好'},
 {id:'quiet',name:'更安静一点',detail:'关闭自然声，保留可调音乐',result:'自然声已关闭，可随时在声音设置恢复。',step:'即时生效'},
 {id:'tea',name:'一杯温茶',detail:'到茶舍歇脚，不必赶场',result:'茶舍已经加入你的行程。',step:'行程提醒'},
 {id:'guide',name:'无障碍抵达',detail:'无需操作行走，直接到达目的地',result:'打开地图即可使用「直接抵达」。',step:'即时指引'},
 {id:'headphones',name:'耳机与音量指引',detail:'从舒适的小音量开始',result:'音乐已调至25%，请按个人舒适程度调整。',step:'即时生效'},
];
export const SETS=[
 {id:'preview',name:'四时安和',subtitle:'山间器乐 · 约4分钟 · 循环试听',color:'#b79a6b',description:'青、朱、白、玄的灯色缓缓流过舞台，音乐从季节间经过。'},
 {id:'self',name:'六十星图',subtitle:'古音律作品 · 约1分30秒 · 循环试听',color:'#7998bc',description:'六十个名字，铺开一片星图。此处为已有作品试听。'},
 {id:'ritual',name:'岁音 · 天河水',subtitle:'2027丁未年度主题 · 约6分钟 · 循环试听',color:'#73aab2',description:'从山谷听见天河水，以一场开放的听音会，迎接新岁。'},
];
export const ITINERARIES=[
 {id:'short',name:'一盏茶的时间',time:'建议 8–12 分钟',line:'换一身行衣，选一顶帐，最后喝杯茶。',stops:['wardrobe','jiazi-1','tea']},
 {id:'annual',name:'赴一场岁音',time:'完整节奏约 35 分钟',line:'接待入山、年度仪式、领取符贴、归山歇脚。',stops:['gate','main','gift','rest']},
 {id:'roam',name:'把一天交给山',time:'自由漫游 · 不赶时间',line:'五庭听音、山谷观演、市集相逢。',stops:['jiazi-3','jiazi-1','festival','market','tea']},
];
const SAVE_KEY='shanjian-suiyin:v3.0:guest';
export function defaultSave(){return {version:3,outfit:'linen',accessory:'lantern',visited:[],collections:[],requests:[],itinerary:null,stops:[]}}
export function loadSave(storage){try{const v=JSON.parse(storage.getItem(SAVE_KEY));if(v?.version!==3)return defaultSave();return {...defaultSave(),outfit:OUTFITS.some(o=>o.id===v.outfit)?v.outfit:'linen',accessory:['none','lantern','bag'].includes(v.accessory)?v.accessory:'lantern',visited:Array.isArray(v.visited)?[...new Set(v.visited.filter(n=>Number.isInteger(n)&&n>=1&&n<=60))]:[],collections:Array.isArray(v.collections)?v.collections.filter(id=>GOODS.some(g=>g.id===id)):[],requests:Array.isArray(v.requests)?v.requests.filter(id=>SERVICES.some(s=>s.id===id)):[],itinerary:ITINERARIES.some(i=>i.id===v.itinerary)?v.itinerary:null,stops:Array.isArray(v.stops)?v.stops.filter(s=>typeof s==='string').slice(0,90):[]}}catch{return defaultSave()}}
export function persist(storage,value){try{storage.setItem(SAVE_KEY,JSON.stringify(value));return true}catch{return false}}
export function clearSave(storage){try{storage.removeItem(SAVE_KEY)}catch{}}
