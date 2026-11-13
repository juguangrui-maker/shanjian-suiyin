import {T, avatar, label, mesh} from './world.js';

const boxGeometry = new T.BoxGeometry(1, 1, 1);
const cylinderGeometry = new T.CylinderGeometry(1, 1, 1, 16);
const material = (color, extra = {}) => new T.MeshStandardMaterial({
  color, roughness: .78, ...extra
});
const box = (parent, mat, x, y, z, width, height, depth) =>
  mesh(boxGeometry, mat, parent, x, y, z, width, height, depth);
const column = (parent, mat, x, y, z, radius, height) =>
  mesh(cylinderGeometry, mat, parent, x, y, z, radius, height, radius);

export function buildFestivalStage(world, parent) {
  const stage = new T.Group();
  stage.position.set(-66, 0, 42);
  parent.add(stage);
  world.stage = stage;

  const foundation = material('#25312f', {metalness: .18});
  const facing = material('#34403d', {metalness: .25});
  const floor = material('#6b6352', {roughness: .62});
  const bronze = material('#c1a36b', {metalness: .65, roughness: .32});
  const charcoal = material('#14272c', {metalness: .15});
  const acoustic = material('#28434a', {metalness: .25});
  const lampMat = material('#edc78b', {
    emissive: '#dca657', emissiveIntensity: .8
  });

  // A layered stage reads as a built venue, including from the valley overview.
  column(stage, foundation, 0, .39, 0, 9.3, .78);
  column(stage, facing, 0, .83, 0, 8.75, .26);
  column(stage, floor, 0, 1.01, 0, 8.2, .14);
  for (const [radius, y, width] of [[9.34, .12, .075], [8.78, .7, .065], [8.22, 1.12, .055]]) {
    const rim = mesh(new T.TorusGeometry(radius, width, 6, 96), bronze, stage, 0, y, 0);
    rim.rotation.x = -Math.PI / 2;
  }
  for (let i = 0; i < 5; i++) {
    box(stage, i % 2 ? facing : floor, 0, .17 + i * .18,
      9.75 + i * .45, 5.4 - i * .2, .19, .8);
  }

  const backWall = new T.Group();
  backWall.position.z = -6.1;
  stage.add(backWall);
  box(backWall, foundation, 0, 4.25, -.48, 15.6, 7.4, .7);
  box(backWall, bronze, 0, 4.2, -.05, 13.8, 6.45, .08);
  box(backWall, charcoal, 0, 4.2, .05, 13.55, 6.22, .08);
  world.stagePanels = [];
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 1.86;
    const height = 3.3 + (3 - Math.abs(i - 3)) * .8;
    const panel = box(backWall, material('#173d49', {
      emissive: '#2f7180', emissiveIntensity: .32, metalness: .3
    }), x, 1.15 + height / 2, .16, 1.57, height, .05);
    world.stagePanels.push(panel);
    box(backWall, bronze, x, 1.15 + height, .22, 1.6, .035, .06);
  }
  const title = label('山 谷 音 乐 台', 6.2, '#f1e5cc');
  title.position.set(0, 8.43, -6.45);
  stage.add(title);

  // Open steel and timber trusses frame the performers without hiding the stage.
  for (const side of [-1, 1]) {
    box(stage, foundation, side * 8.35, 4.7, -3.5, .52, 8.6, .75);
    box(stage, bronze, side * 8.35, 8.98, -3.5, .65, .14, 1.1);
    box(stage, acoustic, side * 9.45, 3.05, -1.15, 1.25, 5.1, 2.8);
    for (let i = 0; i < 3; i++) {
      box(stage, charcoal, side * 9.45, 1.55 + i * 1.42, .38, 1.04, 1.16, .12);
      box(stage, bronze, side * 9.45, 1.55 + i * 1.42, .45, .84, .035, .06);
    }
  }
  box(stage, charcoal, 0, 9.38, -3.5, 17.7, .25, 6.9);
  box(stage, bronze, 0, 9.32, .02, 18.05, .09, .13);
  for (const side of [-1, 1]) {
    box(stage, bronze, side * 8.82, 9.36, -3.5, .085, .1, 7);
  }
  box(stage, foundation, 0, 8.95, -3.5, 17.2, .42, .92);
  for (const z of [-5.2, -3.5, -1.8]) {
    box(stage, facing, 0, 8.74, z, 16.4, .12, .12);
    for (let x = -7.3; x <= 7.3; x += 2.45) {
      const lamp = mesh(new T.CylinderGeometry(.18, .23, .42, 10),
        lampMat, stage, x, 8.48, z);
      lamp.rotation.x = Math.PI / 2.5;
    }
  }
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 1.48;
    const note = mesh(new T.TorusGeometry(.2 + (i % 3) * .08, .035, 6, 24),
      bronze, stage, x, 4.4 + Math.sin(i * 1.7) * 1.25, -5.54);
    note.rotation.y = .18 * i;
  }

  world.stageLights = [];
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const x = Math.sin(angle) * 8, z = Math.cos(angle) * 8;
    const light = column(stage, lampMat, x, 1.34, z, .17, .44);
    world.stageLights.push(light);
  }
  world.performers = [];
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 1.75;
    const z = -1.3 + Math.abs(i - 3) * .28;
    const performer = avatar(i % 2 ? '#b0aa91' : '#344b51');
    performer.position.set(x, 1.13, z);
    stage.add(performer);
    world.performers.push(performer);
    box(stage, charcoal, x, 2.02, z + .96, 1.32, .12, .49);
    for (let string = 0; string < 5; string++) {
      box(stage, bronze, x, 2.09, z + .77 + string * .09, 1.18, .01, .012);
    }
  }
  for (let i = 0; i < 3; i++) {
    const drum = column(stage, foundation, (i - 1) * 3.2, 1.56, -4.1,
      .48 + i * .04, .78);
    drum.rotation.y = i * .4;
    const skin = mesh(new T.CircleGeometry(.5 + i * .04, 24),
      floor, stage, (i - 1) * 3.2, 1.97, -4.1);
    skin.rotation.x = -Math.PI / 2;
  }

  const seatFrame = material('#303a38');
  const seatCushion = material('#52615b');
  const seatTrim = material('#a89162', {metalness: .35});
  const seatBase = new T.InstancedMesh(boxGeometry, seatFrame, 154);
  const seatPads = new T.InstancedMesh(boxGeometry, seatCushion, 154);
  const seatBacks = new T.InstancedMesh(boxGeometry, seatFrame, 154);
  stage.add(seatBase, seatPads, seatBacks);
  const dummy = new T.Object3D();
  let count = 0;
  for (let row = 0; row < 7; row++) {
    const radius = 10.9 + row * 1.4;
    const seats = 16 + row;
    for (let j = 0; j < seats; j++) {
      const angle = -1.02 + (j + .5) / seats * 2.04;
      // Keep a clear aisle through the center and two side entries.
      if (Math.abs(angle) < .075 || Math.abs(Math.abs(angle) - .7) < .04) continue;
      const x = Math.sin(angle) * radius, z = Math.cos(angle) * radius;
      dummy.rotation.set(0, angle, 0);
      dummy.position.set(x, .34, z);
      dummy.scale.set(.92, .47, .84);
      dummy.updateMatrix();
      seatBase.setMatrixAt(count, dummy.matrix);
      dummy.position.y = .62;
      dummy.scale.set(.82, .16, .69);
      dummy.updateMatrix();
      seatPads.setMatrixAt(count, dummy.matrix);
      dummy.position.y = .83;
      dummy.position.z = z + Math.cos(angle) * .35;
      dummy.position.x = x + Math.sin(angle) * .35;
      dummy.scale.set(.87, .65, .12);
      dummy.updateMatrix();
      seatBacks.setMatrixAt(count, dummy.matrix);
      count++;
    }
  }
  for (const seats of [seatBase, seatPads, seatBacks]) {
    seats.count = count;
    seats.instanceMatrix.needsUpdate = true;
    seats.castShadow = false;
    seats.receiveShadow = true;
  }
  for (let row = 0; row < 7; row++) {
    const radius = 10.1 + row * 1.4;
    const arc = mesh(new T.TorusGeometry(radius, .045, 4, 72, 2.13),
      seatTrim, stage, 0, .03, 0);
    arc.rotation.set(-Math.PI / 2, 0, -.5);
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const radius = 11 + i * 2;
      const angle = side * 1.12;
      column(stage, lampMat, Math.sin(angle) * radius, .65,
        Math.cos(angle) * radius, .07, 1.3);
    }
  }
  world.festivalSeats = count;
  return stage;
}
