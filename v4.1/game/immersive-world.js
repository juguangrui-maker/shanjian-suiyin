import {T, label, mesh} from './world.js';
import {COURTS} from './retreat-data.js';

const COLORS = {
  main: '#a9c7d7', blessing: '#96c8a5', release: '#80b9c9',
  wealth: '#d9b976', love: '#c9999b', self: '#a5b8d9',
  金: '#e8e3d5', 木: '#78b48c', 水: '#779fc1', 火: '#d98375', 土: '#caa45f'
};
const mat = (color, extra = {}) => new T.MeshStandardMaterial({color, roughness: .85, ...extra});
const basic = (color, extra = {}) => new T.MeshBasicMaterial({color, ...extra});
const boxGeo = new T.BoxGeometry(1, 1, 1);
const addBox = (group, material, x, y, z, w, h, d) =>
  mesh(boxGeo, material, group, x, y, z, w, h, d);
const domeCache = new Map();
const ribCache = new Map();

function domeGeometry(radius) {
  if (!domeCache.has(radius)) domeCache.set(radius, new T.SphereGeometry(radius, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2));
  return domeCache.get(radius);
}

function ribGeometry(radius) {
  if (ribCache.has(radius)) return ribCache.get(radius);
  const positions = [];
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2;
    for (let j = 0; j < 16; j++) {
      for (const p of [j / 16 * Math.PI / 2, (j + 1) / 16 * Math.PI / 2]) {
        positions.push((radius + .035) * Math.sin(p) * Math.cos(a),
          .27 + radius * .86 * Math.cos(p),
          (radius + .035) * Math.sin(p) * Math.sin(a));
      }
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  ribCache.set(radius, geometry);
  return geometry;
}

function addTent(parent, x, z, radius, name, accent, rotation = 0, major = false) {
  const group = new T.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  parent.add(group);
  const dark = mat('#111a20', {metalness: .12, roughness: .97});
  const bronze = mat('#947952', {metalness: .55, roughness: .5});
  const color = mat(accent, {emissive: accent, emissiveIntensity: .24});
  mesh(new T.CylinderGeometry(radius + .35, radius + .35, .3, 48), mat('#414b46'), group, 0, .12, 0);
  const shell = mesh(domeGeometry(radius), dark, group, 0, .27, 0, 1, .86, 1);
  shell.castShadow = major;
  const ribs = new T.LineSegments(ribGeometry(radius),
    new T.LineBasicMaterial({color: major ? '#7d8075' : '#596562', transparent: true, opacity: major ? .8 : .65}));
  group.add(ribs);
  const belt = mesh(new T.TorusGeometry(radius + .045, major ? .055 : .035, 6, 56),
    color, group, 0, .27 + radius * .4, 0);
  belt.rotation.x = Math.PI / 2;
  const crown = mesh(new T.TorusGeometry(major ? .62 : .34, .045, 6, 36),
    bronze, group, 0, .32 + radius * .86, 0);
  crown.rotation.x = Math.PI / 2;
  const doorZ = radius + .33;
  addBox(group, mat('#1d2528'), 0, 1.08, doorZ - .18, major ? 2.65 : 1.35, 2.16, .8);
  addBox(group, basic('#0b1218'), 0, 1.04, doorZ + .25, major ? 2.06 : .96, 1.86, .06);
  const opening = addBox(group, basic(accent, {transparent: true, opacity: .34, depthWrite: false}),
    0, .99, doorZ + .31, major ? 1.7 : .7, 1.62, .018);
  opening.renderOrder = 2;
  const doorW = major ? 1.35 : .72;
  for (const side of [-1, 1]) {
    addBox(group, bronze, side * doorW, 1.18, doorZ + .38, .08, 2.42, .12);
    mesh(new T.CylinderGeometry(major ? .13 : .08, major ? .13 : .08, major ? 2.6 : 1.7, 8),
      mat('#565042'), group, side * (doorW + .26), (major ? 1.3 : .85), doorZ + .62);
  }
  addBox(group, bronze, 0, 2.37, doorZ + .38, doorW * 2 + .22, .11, .18);
  addBox(group, mat('#354448'), 0, .06, doorZ + .88, major ? 4.1 : 2.05, .12, 1.2);
  const plaque = label(name, major ? 5.5 : 2.05, '#f0e3bf');
  plaque.position.set(0, major ? 3.05 : 2.65, doorZ + .48);
  group.add(plaque);
  if (major) {
    for (let i = 0; i < 7; i++) {
      const ring = mesh(new T.RingGeometry(2 + i * 1.27, 2.025 + i * 1.27, 72),
        basic(i % 2 ? '#b6c9c6' : '#b99e69', {transparent: true, opacity: .34, side: T.DoubleSide}),
        group, 0, .04, 0);
      ring.rotation.x = -Math.PI / 2;
    }
    const portal = new T.PointLight('#c2a16c', 6, 9);
    portal.position.set(0, 2.2, doorZ + 1);
    group.add(portal);
  }
  return group;
}

function replaceExterior(world) {
  const originals = [
    [0, -15, 7, '太 岁 驾 到', COLORS.main, true],
    [-17, 3, 3, '明 愿 · 祈 福', COLORS.blessing],
    [18, -17, 3, '静 水 · 解 忧', COLORS.release],
    [-19, -9, 3, '丰 愿 · 求 财', COLORS.wealth],
    [18, 3, 2.7, '同 心 · 姻 缘', COLORS.love],
    [17, 18, 2.6, '归 音 · 本 命', COLORS.self]
  ];
  for (const [x, z, radius, name, accent, major] of originals) {
    const old = world.outdoor.children.find(object => object.type === 'Group' &&
      Math.abs(object.position.x - x) < .05 && Math.abs(object.position.z - z) < .05);
    if (old) old.visible = false;
    addTent(world.outdoor, x, z, radius, name, accent, 0, major);
  }
  for (const [element, court] of Object.entries(COURTS)) {
    const group = world.expansion.children.find(object => object.type === 'Group' &&
      Math.abs(object.position.x - court.x) < .05 && Math.abs(object.position.z - court.z) < .05);
    if (!group) continue;
    for (const old of [...group.children]) {
      if (old.type !== 'Group' || Math.hypot(old.position.x, old.position.z) < 11) continue;
      old.visible = false;
      const number = world.locations.find(location => location.jiazi &&
        Math.hypot(location.x - court.x - old.position.x, location.z - court.z - old.position.z) < 4)?.jiazi;
      if (number) addTent(group, old.position.x, old.position.z, 2.4,
        number.name, COLORS[element], old.rotation.y);
    }
  }
}

const vertexShader = [
  'varying vec2 vUv;',
  'void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'
].join('\n');
const fragmentShader = [
  'precision mediump float;',
  'varying vec2 vUv;',
  'uniform float uTime; uniform float uEnergy; uniform float uMode;',
  'uniform vec3 uTint;',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'void main(){',
  'vec2 uv=vUv;',
  'float wave=sin(uv.x*32.0+sin(uv.x*13.0+uTime*.13)*2.0+uTime*.19);',
  'float river=exp(-70.0*abs(uv.y-(.24+.035*wave)));',
  'river+=.65*exp(-100.0*abs(uv.y-(.32+.025*sin(uv.x*40.0-uTime*.11))));',
  'float orbit=exp(-75.0*abs(uv.y-(.58+.14*sin(uv.x*6.283+uTime*.07))));',
  'vec2 grid=floor(uv*vec2(170.0,31.0));',
  'float star=step(.977,hash(grid))*pow(max(0.0,1.0-length(fract(uv*vec2(170.0,31.0)))-.5),8.0);',
  'float season=exp(-70.0*abs(uv.y-(.14+.09*sin(uv.x*17.0+uTime*.09))));',
  'float signal=mix(river,orbit,step(.8,uMode));',
  'signal=mix(signal,river*.4+season*.9,step(4.5,uMode));',
  'vec3 base=vec3(.006,.018,.03);',
  'vec3 color=base+uTint*(signal*(.28+uEnergy*.65)+star*.58);',
  'gl_FragColor=vec4(color,1.0);',
  '}'
].join('\n');

function addRing(group, radius, y, color, opacity = .6) {
  const ring = mesh(new T.TorusGeometry(radius, .018, 4, 96),
    basic(color, {transparent: true, opacity, depthWrite: false}), group, 0, y, 0);
  ring.rotation.x = Math.PI / 2;
  return ring;
}

function createInterior(world) {
  world.indoor.clear();
  const root = new T.Group();
  world.indoor.add(root);
  mesh(new T.CircleGeometry(12, 96), mat('#10171d', {metalness: .22, roughness: .5}), root, 0, .01, 0).rotation.x = -Math.PI / 2;
  mesh(new T.SphereGeometry(12, 64, 28, 0, Math.PI * 2, 0, Math.PI / 2),
    mat('#090f16', {side: T.BackSide, roughness: 1}), root, 0, 0, 0, 1, .88, 1).castShadow = false;
  const uniforms = {uTime: {value: 0}, uEnergy: {value: .12}, uMode: {value: 0},
    uTint: {value: new T.Color(COLORS.main)}};
  const screen = mesh(new T.CylinderGeometry(11.75, 11.75, 5.9, 96, 1, true,
      Math.PI / 4, Math.PI * 1.5),
    new T.ShaderMaterial({vertexShader, fragmentShader, uniforms, side: T.BackSide}),
    root, 0, 3.55, 0);
  screen.castShadow = false;
  const ribMat = mat('#242a2e', {metalness: .2, roughness: .98});
  for (let i = 0; i < 28; i++) {
    const angle = i / 28 * Math.PI * 2, pts = [];
    for (let j = 0; j <= 12; j++) {
      const p = j / 12 * Math.PI / 2;
      pts.push(new T.Vector3(11.82 * Math.sin(p) * Math.cos(angle),
        10.35 * Math.cos(p), 11.82 * Math.sin(p) * Math.sin(angle)));
    }
    const rib = mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 12, .12, 5, false), ribMat, root);
    rib.castShadow = false;
  }
  for (const r of [2.6, 4.7, 6.8, 9.1, 11.4]) addRing(root, r, .05, '#b49a69', .55);
  const skyRing = addRing(root, 5.8, 8.7, '#b9cdd1', .8);
  const starPos = [];
  for (let i = 0; i < 650; i++) {
    const theta = i * 2.399963, p = .17 + (i % 79) / 79 * 1.13;
    starPos.push(11.43 * Math.sin(p) * Math.cos(theta),
      10.04 * Math.cos(p), 11.43 * Math.sin(p) * Math.sin(theta));
  }
  const starGeo = new T.BufferGeometry();
  starGeo.setAttribute('position', new T.Float32BufferAttribute(starPos, 3));
  const stars = new T.Points(starGeo, new T.PointsMaterial({color: '#b8cddd', size: .055,
    transparent: true, opacity: .78, depthWrite: false}));
  root.add(stars);
  const seats = new T.Group();
  root.add(seats);
  const cushionMaterial = mat('#262d30');
  const stitch = basic('#8b7654', {transparent: true, opacity: .7});
  for (let row = 0; row < 3; row++) {
    const radius = 6.6 + row * 1.6;
    for (let i = 0; i < 20; i++) {
      const angle = i / 20 * Math.PI * 2 + row * .07;
      const x = Math.sin(angle) * radius, z = Math.cos(angle) * radius;
      mesh(new T.CylinderGeometry(.46, .53, .19, 16), cushionMaterial, seats, x, .18, z);
      const trim = mesh(new T.TorusGeometry(.49, .012, 4, 24), stitch, seats, x, .29, z);
      trim.rotation.x = Math.PI / 2;
    }
  }
  const altar = new T.Group();
  altar.position.z = -3.7;
  root.add(altar);
  mesh(new T.CylinderGeometry(2.15, 2.3, .46, 48), mat('#192229', {metalness: .4}), altar, 0, .3, 0);
  addRing(altar, 2.1, .57, '#c4ad7c', .85);
  const veil = mesh(new T.CylinderGeometry(1.78, 1.78, 6.45, 64, 1, true),
    basic('#8da9b5', {transparent: true, opacity: .08, side: T.DoubleSide, depthWrite: false}),
    altar, 0, 3.78, 0);
  veil.castShadow = false;
  for (const y of [.65, 3.8, 6.95]) addRing(altar, 1.8, y, '#c7b88d', .68);
  const figure = new T.Group();
  altar.add(figure);
  mesh(new T.CylinderGeometry(.48, 1.03, 2.45, 20), mat('#344454',
    {metalness: .45, emissive: '#263c4d', emissiveIntensity: .34}), figure, 0, 1.7, 0);
  for (const side of [-1, 1]) {
    const sleeve = mesh(new T.ConeGeometry(.62, 1.75, 10),
      mat('#41556a', {metalness: .3}), figure, side * .65, 2.05, 0);
    sleeve.rotation.z = side * .42;
  }
  mesh(new T.SphereGeometry(.53, 20, 16), mat('#abc9ce',
    {emissive: '#91bfd2', emissiveIntensity: .65, metalness: .2}), figure, 0, 3.78, 0);
  const crown = mesh(new T.TorusGeometry(.67, .065, 7, 32),
    mat('#c3ad78', {metalness: .75}), figure, 0, 4.02, 0);
  crown.rotation.x = Math.PI / 2;
  for (const side of [-1, 1]) {
    const horn = mesh(new T.TorusGeometry(.27, .045, 5, 22, Math.PI * 1.3),
      mat('#c3ad78', {metalness: .75}), figure, side * .48, 4.23, 0);
    horn.rotation.y = side * .45;
  }
  const aura = addRing(figure, 1.45, 2.9, '#a8d5d8', .6);
  aura.rotation.x = .15;
  const portrait = mesh(new T.PlaneGeometry(3.1, 4.42),
    basic('#ffffff', {transparent: true, opacity: .96, side: T.DoubleSide}),
    altar, 0, 3.25, .23);
  portrait.visible = false;
  const portraitFrame = mesh(new T.PlaneGeometry(3.34, 4.66),
    basic('#9b835b', {side: T.DoubleSide}), altar, 0, 3.25, .18);
  portraitFrame.visible = false;
  const archive = mesh(new T.PlaneGeometry(1.8, 2.57),
    basic('#ffffff', {side: T.DoubleSide}), root, 4.35, 3.55, -8.4);
  archive.visible = false;
  const archiveFrame = mesh(new T.PlaneGeometry(2.02, 2.79),
    basic('#9b835b', {side: T.DoubleSide}), root, 4.35, 3.55, -8.45);
  archiveFrame.visible = false;
  const apparition = mesh(new T.PlaneGeometry(2.8, 4),
    basic('#ffffff', {transparent: true, opacity: .82, side: T.DoubleSide, depthWrite: false}),
    altar, 0, 3.45, 1.08);
  apparition.visible = false;
  apparition.renderOrder = 4;
  const motif = new T.Group();
  altar.add(motif);
  for (let i = 0; i < 9; i++) {
    const r = .55 + i * .2;
    const ring = addRing(motif, r, 1 + i * .22, '#98c1cf', .35);
    ring.rotation.z = i * .17;
  }
  motif.visible = false;
  const river = new T.Group();
  root.add(river);
  for (let i = 0; i < 11; i++) {
    const points = [];
    for (let j = 0; j <= 36; j++) {
      const z = -10 + j * .43;
      points.push(new T.Vector3(Math.sin(z * .5 + i * .21) * (1.3 + i * .045) +
        (i - 5) * .13, .08 + i * .002, z));
    }
    const line = new T.Line(new T.BufferGeometry().setFromPoints(points),
      new T.LineBasicMaterial({color: '#9bcad4', transparent: true, opacity: .22}));
    river.add(line);
  }
  const lanterns = new T.Group();
  root.add(lanterns);
  for (let i = 0; i < 14; i++) {
    const a = i * 2.39996, r = 3.2 + i % 4;
    const light = mesh(new T.OctahedronGeometry(.12, 0),
      basic('#f1d49b'), lanterns, Math.sin(a) * r, 3.7 + i % 5 * .7, Math.cos(a) * r - 2);
    light.userData.offset = i;
  }
  lanterns.visible = false;
  const wash = new T.PointLight('#99bad2', 24, 23, 1.7);
  wash.position.set(0, 5, -3);
  root.add(wash);
  const rim = new T.PointLight('#d5ae73', 12, 16);
  rim.position.set(-5, 3, 3);
  root.add(rim);
  return {root, uniforms, skyRing, stars, seats, figure, aura, veil,
    portrait, portraitFrame, archive, archiveFrame, apparition, motif, river, lanterns, wash};
}

export function installImmersiveWorld(world) {
  replaceExterior(world);
  const room = createInterior(world);
  let kind = 'main', chapter = 0, season = 0, currentImage = 0, energy = .12;
  let details = null;
  const library = fetch(new URL('./guardians.json', import.meta.url))
    .then(response => response.ok ? response.json() : [])
    .catch(() => []);
  const loader = new T.TextureLoader();
  loader.load(new URL((location.hostname==='localhost'||location.hostname==='127.0.0.1'?'./':'../../v4/game/')+'guardians/44_dingwei_B.jpg', import.meta.url).href, texture => {
    texture.colorSpace = T.SRGBColorSpace;
    room.archive.material.map = texture;
    room.archive.material.needsUpdate = true;
    room.apparition.material.map = texture;
    room.apparition.material.needsUpdate = true;
    room.archive.visible = kind === 'main' && chapter === 2;
    room.archiveFrame.visible = room.archive.visible;
    room.apparition.visible = kind === 'main' && [2, 4, 6].includes(chapter);
  });
  const toColor = value => room.uniforms.uTint.value.set(value);
  const hidePortrait = () => {
    room.portrait.visible = false;
    room.portraitFrame.visible = false;
    if (room.portrait.material.map) room.portrait.material.map.dispose();
    room.portrait.material.map = null;
    room.portrait.material.needsUpdate = true;
  };
  function enterMain() {
    kind = 'main';
    season = -1;
    details = null;
    document.querySelector('#guardian-card').hidden = true;
    room.figure.visible = true;
    room.seats.visible = true;
    room.motif.visible = false;
    hidePortrait();
    setChapter(0);
  }
  function setChapter(index) {
    chapter = index;
    if (kind !== 'main') return;
    const colors = ['#b8c9d1', '#8db7d3', '#c9b783', '#83b8bc',
      '#dfc38c', '#9bc5cf', '#bec4c0'];
    toColor(colors[index] || colors[0]);
    room.uniforms.uMode.value = index;
    room.figure.visible = [2, 4, 6].includes(index);
    room.apparition.visible = room.figure.visible && !!room.apparition.material.map;
    room.archive.visible = index === 2 && !!room.archive.material.map;
    room.archiveFrame.visible = room.archive.visible;
    room.lanterns.visible = index === 4;
    room.river.visible = index === 3 || index === 5;
    room.wash.color.set(colors[index] || colors[0]);
  }
  function setSeason(index) {
    season = index;
    if (kind !== 'main') return;
    const colors = ['#8fc5a6', '#8fbcae', '#d9b67d', '#a9c2d0'];
    toColor(colors[index] || colors[0]);
    room.wash.color.set(colors[index] || colors[0]);
  }
  function setSmall(id, jiaziNumber = 0) {
    kind = id;
    currentImage = jiaziNumber;
    season = -1;
    details = null;
    room.archive.visible = false;
    room.archiveFrame.visible = false;
    chapter = -1;
    room.seats.visible = false;
    room.figure.visible = false;
    room.apparition.visible = false;
    room.lanterns.visible = id === 'blessing' || id === 'love';
    room.river.visible = id === 'release';
    room.motif.visible = !jiaziNumber;
    room.uniforms.uMode.value = id === 'release' ? 3 : id === 'wealth' ? 5 : 2;
    const color = COLORS[id] || '#a9c2d2';
    toColor(color);
    room.wash.color.set(color);
    hidePortrait();
    document.querySelector('#guardian-card').hidden = true;
    if (!jiaziNumber) return;
    currentImage = jiaziNumber;
    library.then(rows => {
      if (kind !== id || currentImage !== jiaziNumber) return;
      const row = rows.find(item => item.number === jiaziNumber);
      if (!row) return;
      details = row;
      toColor(row.color || color);
      room.wash.color.set(row.color || color);
      const card = document.querySelector('#guardian-card');
      card.querySelector('img').src = (location.hostname==='localhost'||location.hostname==='127.0.0.1'?'guardians/':'../../v4/game/guardians/') + row.image;
      card.querySelector('strong').textContent = row.ganzhi + ' · ' + row.guardian;
      card.querySelector('small').textContent = row.nayin + ' / ' + row.zodiac +
        ' / ' + row.implement;
      card.hidden = false;
      loader.load(new URL((location.hostname==='localhost'||location.hostname==='127.0.0.1'?'./':'../../v4/game/')+'guardians/' + row.image, import.meta.url).href, texture => {
        if (kind !== id || currentImage !== jiaziNumber) {
          texture.dispose();
          return;
        }
        texture.colorSpace = T.SRGBColorSpace;
        room.portrait.material.map = texture;
        room.portrait.material.needsUpdate = true;
        room.portrait.visible = true;
        room.portraitFrame.visible = true;
      });
    });
  }
  function leave() {
    kind = 'outdoor';
    currentImage = 0;
    room.apparition.visible = false;
    room.archive.visible = false;
    room.archiveFrame.visible = false;
    document.querySelector('#guardian-card').hidden = true;
  }
  function tick(t, level, reduced) {
    energy += ((Number.isFinite(level) ? level : 0) - energy) * .08;
    room.uniforms.uTime.value = reduced ? 0 : t;
    room.uniforms.uEnergy.value = Math.max(.12, Math.min(1, energy));
    room.skyRing.rotation.z = reduced ? 0 : t * .006;
    room.aura.rotation.z = reduced ? 0 : t * .05;
    room.veil.material.opacity = .055 + Math.min(.09, energy * .1);
    room.motif.rotation.y = reduced ? 0 : t * .06;
    if (room.lanterns.visible && !reduced) room.lanterns.children.forEach(light => {
      light.position.y += Math.sin(t * .37 + light.userData.offset) * .0018;
    });
  }
  function sync(mode, index, seasonIndex, small) {
    if (mode === 'ritual') {
      if (kind !== 'main') enterMain();
      if (index >= 0 && chapter !== index) setChapter(index);
      if (seasonIndex >= 0 && season !== seasonIndex) setSeason(seasonIndex);
    } else if (mode === 'small' && small) {
      const number = small.jiazi?.number || 0;
      if (kind !== small.id || currentImage !== number) setSmall(small.id, number);
    } else if (kind !== 'outdoor') {
      leave();
    }
  }
  return {enterMain, setChapter, setSeason, setSmall, leave, tick, sync,
    get details() {return details;}, get kind() {return kind;}};
}
