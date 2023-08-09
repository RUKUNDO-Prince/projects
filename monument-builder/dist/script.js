/* 
 * The purpose is to easily create building structures. The building style was inspired by the Monument Valley game https://www.monumentvalleygame.com/mv2
 *
 * Floorplan coordinates and building settings are at the very bottom of the page.
 */

let scene,
renderer,
controls,
camera,
floorplan,
settings,
light,
grid,
monumentSquareSize,
monumentHeight,
container;

const width = window.innerWidth;
const height = window.innerHeight;
const aspectRatio = width / height;
const fieldOfView = 25;
const nearView = 1;
const farView = 10000;
const assetPath = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1290466';
const blockSize = 20; // Value need to remain 20 in order to match assets ratio exported from Blender

window.addEventListener('load', () => {
  settings = data.settings;
  document.body.style.background = `rgb(${settings.background})`;
  floorplan = data.floorplan;
  init();
  animate();
});

function init() {
  grid = floorplan[0][0].length;
  monumentSquareSize = blockSize * grid;
  monumentHeight = blockSize * floorplan.length;

  // Scene Setting
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create the scene.
  scene = new THREE.Scene();

  // Camera Setting
  if (settings.perspectiveCamera) {
    // Perspective Camera
    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearView, farView);
    camera.position.set(800, -800, 800);
    camera.up = new THREE.Vector3(0, 0, 1);
  } else {
    // Orthographic Camera
    camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -1000, 5000);
    camera.position.set(20, -20, 20);
    camera.up = new THREE.Vector3(0, 0, 1);
  }

  // Point Light Setting
  light = new THREE.PointLight(`rgb(${settings.globalLight})`, 12, 1000);
  light.position.set(600, -200, 250 + monumentHeight);
  light.castShadow = true;

  scene.add(light, new THREE.AmbientLight(`rgb(${settings.ambientLight})`));

  // Floor Setting
  // const floorGeometry = new THREE.CircleGeometry(600, 600)
  // floorGeometry.translate(0, 0, -200)
  // const floorMaterial = new THREE.MeshLambertMaterial({
  //   color: `rgb(${settings.floor})`
  // })
  // const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  // floor.receiveShadow = true;
  // scene.add(floor)

  // Mouse Interaction Setting
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = Math.PI / 2 - 0.5;
  controls.maxPolarAngle = Math.PI / 2 - 0.5;
  controls.autoRotate = settings.autoRotate;
  controls.autoRotateSpeed = settings.rotationSpeed;
  controls.zoomSpeed = 0.3;
  controls.minZoom = 0.5;
  controls.maxZoom = 2.5;
  controls.enableDamping = true;
  controls.dampingFactor = 0.15;

  // Add the Renderer to the DOM, in the world div.
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  floorplanRenderer();

  //RESPONSIVE LISTENER
  window.addEventListener('resize', onWindowResize, false);
}

function floorplanRenderer() {
  let zPos = -monumentSquareSize - settings.offsetY,yPos = 0,xPos = 0;

  for (let z = 0; z < floorplan.length; z++) {

    let reversedZ = floorplan.length - (z + 1);

    zPos += blockSize;
    xPos = monumentSquareSize / 2;

    for (let x = 0; x < floorplan[reversedZ].length; x++) {

      let reversedX = floorplan[reversedZ].length - (x + 1);

      xPos -= blockSize;
      yPos = monumentSquareSize / 2;

      for (let y = 0; y < floorplan[reversedZ][reversedX].length; y++) {

        let reversedY = floorplan[reversedZ][reversedX].length - (y + 1);
        let cell = floorplan[reversedZ][reversedX][reversedY];
        let shape = null;

        yPos -= blockSize;

        switch (cell) {
          case 1:
            shape = new Cube(xPos, yPos, zPos, `rgb(${settings.cube})`,
            blockSize);

            break;
          case 2:
            shape = new Shape(xPos, yPos, zPos, `rgb(${settings.tale})`, `${assetPath}/tail1.json`,
            1);

            break;
          case 3:
            shape = new Shape(xPos, yPos, zPos, `rgb(${settings.stairs})`, `${assetPath}/stairs1.json`,
            1,
            7.855);

            break;
          case 4:
            shape = new Light(xPos, yPos, zPos, `rgb(${settings.pointLight})`,
            settings.pointLightScale);

            break;
          case 5:
            shape = new Shape(xPos, yPos, zPos, `rgb(${settings.pillar})`,
            `${assetPath}/pillar1.json`,
            1);

            break;}


        if (shape !== null) shape.render();
      }
    }
  }
}

function onWindowResize() {
  camera.left = window.innerWidth / -2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function renderView() {
  // let time = Date.now() * 0.0005
  // firefly.position.set(0, 0, Math.sin(time*3)*10)
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderView();
}

class Cube {
  constructor(x, y, z, color, size, rotate = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = color;
    this.size = size;
    this.rotate = rotate;
  }

  render() {
    let boxGeometry = new THREE.BoxGeometry(this.size, this.size, this.size);
    let lambertMaterial = new THREE.MeshLambertMaterial({
      color: this.color
      // overdraw: 1,
    });
    let mesh = new THREE.Mesh(boxGeometry, lambertMaterial);

    mesh.position.x = this.x;
    mesh.position.y = this.y;
    mesh.position.z = this.z;
    mesh.rotation.y = this.rotate;
    scene.add(mesh);
  }}


class Shape {
  constructor(x, y, z, color, source, scale = 1, rotate = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = color;
    this.source = source;
    this.scale = scale;
    this.rotate = rotate;
  }

  render() {
    let loader = new THREE.LegacyJSONLoader();
    loader.load(this.source, geometry => {
      let mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        color: this.color
        // overdraw: 1
      }));

      mesh.position.x = this.x;
      mesh.position.y = this.y;
      mesh.position.z = this.z;
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.y = this.rotate;
      mesh.scale.set(this.scale, this.scale, this.scale);

      scene.add(mesh);
    });
  }}


class Light {
  constructor(x, y, z, color, size = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = color;
    this.size = size;
  }

  render() {
    let pointLight = new THREE.PointLight(this.color, 1.1, 100);

    if (this.size !== 0) {
      let sphereGeometry = new THREE.SphereGeometry(this.size, 50, 50);
      let basicMaterial = new THREE.MeshBasicMaterial({ color: this.color });
      let lightBulbe = new THREE.Mesh(sphereGeometry, basicMaterial);
      pointLight.add(lightBulbe);
    }

    let time = Date.now() * 0.0005;
    // firefly.position.set(0, 0, Math.sin(time*3)*10)

    pointLight.position.set(this.x, this.y, this.z + Math.sin(time * 3) * 10);
    pointLight.castShadow = true;

    scene.add(pointLight);
  }}



/*
 *  block = 1
 *  tile = 2
 *  staircase = 3
 *  firefly = 4
 *  4 pillar = 5 
*/

let data = {
  "settings": {
    "perspectiveCamera": false,
    "autoRotate": true,
    "rotationSpeed": 0.25,
    "offsetY": -30,
    "background": "0, 0, 16",
    "globalLight": "255, 255, 255",
    "ambientLight": "0, 0, 32",
    "cube": "107, 126, 127",
    "tale": "81, 91, 95",
    "stairs": "107, 126, 127",
    "pointLight": "255, 255, 255",
    "pointLightScale": 2,
    "pillar": "107, 126, 127" },

  "floorplan": [
  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 4, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 5, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 5, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0, 0, 5, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 0, 0, 3, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5]],

  [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5]]] };