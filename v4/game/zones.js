export const ZONES = [
  {
    id: 'jiazi', number: '01', name: '六十甲子',
    subtitle: '五庭巡岁 · 六十本命帐', color: '#9ab7b5',
    anchor: 'jiazi-44', destinations: ['jiazi-44', 'jiazi-1'],
    x: -3, z: -59
  },
  {
    id: 'market', number: '02', name: '山间市集',
    subtitle: '甲子文创 · 茶歇庭院', color: '#d3aa73',
    anchor: 'market', destinations: ['market', 'tea', 'wardrobe'],
    x: -29, z: 24
  },
  {
    id: 'performance', number: '03', name: '山谷演出',
    subtitle: '音乐节舞台 · 观演坐席', color: '#b4a1a2',
    anchor: 'festival', destinations: ['festival'],
    x: -66, z: 42
  },
  {
    id: 'ritual', number: '04', name: '礼岁疗愈',
    subtitle: '礼岁殿 · 太岁主帐 · 祈福诸帐', color: '#c6c19b',
    anchor: 'temple', destinations: [
      'temple', 'main', 'blessing', 'release', 'wealth', 'love', 'self', 'gift', 'rest'
    ],
    x: 0, z: -23
  }
];

export function zoneFor(location) {
  if (location.jiazi) return 'jiazi';
  return ZONES.find(zone => zone.destinations.includes(location.id))?.id ||
    (location.id === 'gate' || location.id === 'services' ? 'ritual' : 'market');
}
