import {T, label, mesh} from './world.js';
import {ZONES} from './zones.js';

const boxGeometry = new T.BoxGeometry(1, 1, 1);
const cylinderGeometry = new T.CylinderGeometry(1, 1, 1, 12);
const stone = new T.MeshStandardMaterial({color: '#aaa99a', roughness: .95});
const darkStone = new T.MeshStandardMaterial({color: '#5b6662', roughness: .94});
const timber = new T.MeshStandardMaterial({color: '#43433b', roughness: .93});
const ink = new T.MeshStandardMaterial({color: '#1c292b', roughness: .86});
const bronze = new T.MeshStandardMaterial({color: '#a98b58', metalness: .58, roughness: .48});
const tile = new T.MeshStandardMaterial({color: '#30413f', roughness: .88, side: T.DoubleSide});
const warm = new T.MeshStandardMaterial({
  color: '#dfbf81', emissive: '#b87c3e', emissiveIntensity: .42
});
const box = (parent, material, x, y, z, w, h, d) =>
  mesh(boxGeometry, material, parent, x, y, z, w, h, d);
const post = (parent, material, x, y, z, radius, height) =>
  mesh(cylinderGeometry, material, parent, x, y, z, radius, height, radius);

function sign(parent, name, x, y, z, size = 3.4) {
  const text = label(name, size);
  text.position.set(x, y, z);
  parent.add(text);
  return text;
}

function pitchedRoof(parent, width, depth, eave, rise, z = 0) {
  const roof = new T.Group();
  roof.position.z = z;
  parent.add(roof);
  const w = width / 2, d = depth / 2;
  const vertices = new Float32Array([
    -w, eave, -d, 0, eave + rise, -d, -w, eave, d,
    -w, eave, d, 0, eave + rise, -d, 0, eave + rise, d,
    0, eave + rise, -d, w, eave, -d, 0, eave + rise, d,
    0, eave + rise, d, w, eave, -d, w, eave, d
  ]);
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  const shell = mesh(geometry, tile, roof);
  shell.castShadow = false;
  box(roof, timber, 0, eave - .14, 0, width + .3, .16, depth + .3);
  box(roof, bronze, 0, eave + rise + .03, 0, .09, .09, depth + .1);
  for (let i = 0; i < Math.floor(depth / .72); i++) {
    const rowZ = -d + .42 + i * .72;
    for (const side of [-1, 1]) {
      const rafter = box(roof, timber, side * w * .51,
        eave + rise * .49 + .035, rowZ, w * 1.01, .045, .07);
      rafter.rotation.z = -side * Math.atan2(rise, w);
      rafter.castShadow = false;
    }
  }
  for (const side of [-1, 1]) {
    box(roof, bronze, side * (w + .05), eave - .04, 0, .08, .1, depth + .18);
    for (const end of [-1, 1]) {
      post(roof, bronze, side * w, eave + .12, end * d, .095, .34);
    }
  }
  return roof;
}

function beamCorridor(group, x, start, end) {
  const length = Math.abs(end - start);
  const center = (start + end) / 2;
  box(group, darkStone, x, .025, center, 3.45, .05, length + 2);
  const count = Math.round(length / 4);
  for (let i = 0; i <= count; i++) {
    const z = start + (end - start) * i / count;
    for (const side of [-1, 1]) {
      const px = x + side * 1.47;
      post(group, stone, px, .16, z, .23, .32);
      post(group, timber, px, 1.98, z, .14, 3.32);
      box(group, bronze, px, 3.64, z, .42, .08, .42);
    }
    box(group, timber, x, 3.71, z, 3.45, .18, .25);
    if (i % 2 === 0) {
      const lantern = box(group, warm, x, 3.22, z, .28, .38, .28);
      lantern.castShadow = false;
    }
  }
  pitchedRoof(group, 4.2, length + 2.3, 3.82, .78, center);
  for (const side of [-1, 1]) {
    const rail = box(group, timber, x + side * 1.52, 1.1, center, .09, .08, length);
    rail.castShadow = false;
  }
}

function ceremonialAxis(group) {
  // Two roofed walks frame the open central approach to the main canopy.
  beamCorridor(group, -5.9, 25, -3.5);
  beamCorridor(group, 5.9, 25, -3.5);
  const axis = box(group, darkStone, 0, .018, 11, 7.9, .036, 30);
  axis.castShadow = false;
  const carpet = box(group, new T.MeshStandardMaterial({color: '#693f37', roughness: 1}),
    0, .048, 11, 1.45, .017, 30);
  carpet.castShadow = false;
  for (let i = 0; i < 12; i++) {
    const z = 24 - i * 2.45;
    for (const side of [-1, 1]) {
      post(group, ink, side * 3.1, .81, z, .12, 1.62);
      const cap = box(group, warm, side * 3.1, 1.68, z, .32, .3, .32);
      cap.castShadow = false;
    }
  }
  sign(group, '入 山 礼 廊', 0, 5.17, 22.5, 5.4);
}

function temple(group, world) {
  const temple = new T.Group();
  temple.position.set(0, 0, -38);
  group.add(temple);
  box(temple, stone, 0, .34, 0, 18.3, .68, 12.4);
  box(temple, darkStone, 0, .72, 0, 17.2, .12, 11.3);
  box(temple, ink, 0, 3.06, -5.1, 14.8, 4.55, .5);
  for (const side of [-1, 1]) {
    box(temple, timber, side * 7.3, 3.05, -1.1, .52, 4.8, 8.8);
    box(temple, ink, side * 5.7, 3.05, 3.2, 3, 4.55, .45);
    box(temple, bronze, side * 4.05, 3.08, 3.48, .09, 3.56, .08);
  }
  for (const x of [-6.9, -4.15, -1.4, 1.4, 4.15, 6.9]) {
    post(temple, stone, x, .87, 4.3, .3, .25);
    post(temple, timber, x, 3.28, 4.3, .2, 4.55);
    box(temple, bronze, x, 5.58, 4.3, .5, .17, .52);
  }
  for (const x of [-5.2, -2.7, 0, 2.7, 5.2]) {
    box(temple, timber, x, 2.88, 3.26, .12, 3.35, .12);
    box(temple, bronze, x, 2.88, 3.36, .035, 2.92, .03);
  }
  for (let i = 0; i < 3; i++) {
    box(temple, i % 2 ? stone : darkStone, 0, .12 + i * .16,
      6.6 + i * .65, 8.7 + i * .5, .17, .8);
  }
  pitchedRoof(temple, 19.4, 13.2, 5.7, 2.7, -.6);
  sign(temple, '礼 岁 殿', 0, 5.16, 4.8, 5.5);
  for (const side of [-1, 1]) {
    const bell = mesh(new T.CylinderGeometry(.32, .5, .75, 12, 1, true),
      bronze, temple, side * 6.2, 3.55, 4.1);
    bell.castShadow = false;
    box(temple, warm, side * 4.05, 3.4, 4.76, .33, .62, .3);
  }
  const tablet = box(temple, bronze, 0, 2.52, -4.52, 2.75, 3.2, .22);
  tablet.castShadow = false;
  box(temple, ink, 0, 2.52, -4.35, 2.46, 2.92, .08);
  sign(temple, '丁未 · 缪丙', 0, 2.64, -4.19, 3.8);
  const altar = box(temple, bronze, 0, 1.45, 2.75, 2.3, 1.1, .7);
  altar.castShadow = false;
  for (const side of [-1, 1]) {
    box(temple, warm, side * .76, 2.1, 2.75, .19, .27, .19);
  }
  const path = box(group, darkStone, -11.25, .018, -23.5, 3.1, .04, 31);
  path.castShadow = false;
  box(group, darkStone, -6, .018, -31, 11.8, .04, 2.9).castShadow = false;
  world.locations.push({
    id: 'temple', name: '礼岁殿', x: 0, z: -28.7, action: '参观礼岁殿',
    radius: 3.5
  });
  // A rectangular footprint keeps the entrance clear for interaction.
  world.collisions.push({x: 0, z: -38, r: 8.1});
  return temple;
}

function hideAt(parent, x, z) {
  const old = parent.children.find(item => item.type === 'Group' &&
    Math.abs(item.position.x - x) < .05 && Math.abs(item.position.z - z) < .05);
  if (old) old.visible = false;
}

function shop(group, x, z, name, wares) {
  const store = new T.Group();
  store.position.set(x, 0, z);
  group.add(store);
  box(store, stone, 0, .08, 0, 5.2, .17, 3.7);
  for (const side of [-1, 1]) for (const depth of [-1, 1]) {
    post(store, timber, side * 2.2, 1.65, depth * 1.5, .12, 3.3);
  }
  pitchedRoof(store, 5.9, 4.4, 3.28, .95);
  box(store, timber, 0, 1.17, .52, 4.5, .96, 1.5);
  box(store, bronze, 0, 1.68, 1.28, 4.5, .07, .11);
  for (let i = 0; i < 5; i++) {
    const color = new T.MeshStandardMaterial({
      color: wares[i % wares.length], roughness: .72
    });
    const item = mesh(new T.CylinderGeometry(.17, .21, .3, 10),
      color, store, -1.6 + i * .8, 1.82, .65);
    item.castShadow = false;
  }
  sign(store, name, 0, 3.02, 1.74, 3.5);
  return store;
}

function teahouse(group, world) {
  const x = -36, z = 33;
  hideAt(world.expansion, x, z);
  const tea = new T.Group();
  tea.position.set(x, 0, z);
  group.add(tea);
  box(tea, stone, 0, .12, 0, 11.7, .24, 9.5);
  box(tea, darkStone, 0, .3, 0, 10.9, .12, 8.7);
  for (const side of [-1, 1]) for (const depth of [-1, 1]) {
    post(tea, timber, side * 4.85, 2.6, depth * 3.8, .19, 4.7);
  }
  pitchedRoof(tea, 12.6, 10.2, 4.95, 1.65);
  for (const side of [-1, 1]) {
    box(tea, timber, side * 3.3, 1.1, 3.5, 2.2, .18, 1.3);
    for (const place of [-.65, .65]) {
      post(tea, stone, side * 3.3 + place, .44, 3.1, .33, .62);
    }
  }
  for (const center of [-2.5, 0, 2.5]) {
    post(tea, timber, center, .68, -.65, .56, 1.2);
    box(tea, bronze, center, 1.31, -.65, 1.55, .08, 1.2);
    for (const side of [-1, 1]) {
      post(tea, stone, center + side * .9, .35, -.65, .28, .5);
    }
  }
  for (const side of [-1, 1]) box(tea, warm, side * 4.3, 3.92, 3.9, .28, .42, .28);
  sign(tea, '山 间 茶 歇', 0, 4.25, 4.38, 5);
  return tea;
}

function market(group, world) {
  for (const [x, z] of [[-15, 18], [-19, 15], [-22, 20]]) hideAt(world.outdoor, x, z);
  world.collisions = world.collisions.filter(c =>
    ![[-15, 18], [-19, 15], [-22, 20]].some(([x,z]) => c.x === x && c.z === z));
  const stores = [
    [-15, 18, '岁 时 手 账', ['#c5af88', '#8fa69b']],
    [-22, 18, '甲 子 音 卡', ['#8aa9a6', '#c4a66d']],
    [-29, 18, '山 间 茶 礼', ['#b9966c', '#a6b69d']],
    [-15, 26, '香 方 工 坊', ['#c49e7d', '#879b8b']],
    [-22, 26, '织 物 与 佩 饰', ['#d7c7a9', '#7a9190']]
  ];
  for (const [x, z, name, colors] of stores) {
    shop(group, x, z, name, colors);
    world.collisions.push({x, z, r: 2.75});
  }
  teahouse(group, world);
  const marketPaving = box(group,
    new T.MeshStandardMaterial({color: '#afaa95', roughness: 1}),
    -24, .005, 24, 31, .01, 24);
  marketPaving.castShadow = false;
  for (let i = 0; i < 12; i++) {
    const x = -37 + (i % 4) * 7.5, z = 14 + Math.floor(i / 4) * 8;
    const stoneTile = box(group, stone, x, .03, z, 1.35, .06, 1.35);
    stoneTile.castShadow = false;
  }
  sign(group, '山 间 市 集', -24, 5.9, 29, 7);
}

function zoneMarkers(group) {
  const markers = new T.Group();
  group.add(markers);
  for (const zone of ZONES) {
    const x = zone.id === 'ritual' ? 14 : zone.x;
    const z = zone.id === 'performance' ? 67 : zone.id === 'jiazi' ? -82 : zone.z;
    post(markers, darkStone, x, 2.2, z, .16, 4.4);
    box(markers, bronze, x, 4.4, z, .56, .11, .56);
    const plaque = label(zone.number + ' · ' + zone.name, 7.5, '#f4eddb');
    plaque.position.set(x, 5.25, z);
    markers.add(plaque);
  }
  return markers;
}

export function buildRitualGrounds(world) {
  const ground = new T.Group();
  ground.name = 'V4 ritual valley';
  world.outdoor.add(ground);
  ceremonialAxis(ground);
  temple(ground, world);
  market(ground, world);
  world.zoneMarkers = zoneMarkers(ground);
  world.zones = ZONES;
  return ground;
}
