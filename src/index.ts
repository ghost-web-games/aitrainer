import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EventController } from '@Glibs/systems/event/eventctrl'
import { Loader } from '@Glibs/loader/loader'
import { Canvas } from '@Glibs/systems/event/canvas'
import { Effector } from '@Glibs/magical/effects/effector'
import { IPostPro, Postpro } from '@Glibs/systems/postprocess/postpro'
import { Camera } from '@Glibs/systems/camera/camera'
import { ThreeFactory } from './3dfactory'

class Index {
  scene = new THREE.Scene()
  camera: Camera
  renderer = new THREE.WebGLRenderer({ antialias: true, })
  eventCtrl = new EventController()
  canvas = new Canvas(this.eventCtrl)
  effector = new Effector(this.scene)
  pp: IPostPro
  directlight: THREE.DirectionalLight
  fab = new ThreeFactory(this.eventCtrl, this.scene)
  controls: OrbitControls

  constructor() {
    this.camera = new Camera(this.canvas, this.eventCtrl, this.fab.player)
    this.camera.position.set(20, 20, 20)
    // Renderer Start
    THREE.ColorManagement.enabled = true
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = .8
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    const pixel = (window.devicePixelRatio >= 2) ? window.devicePixelRatio / 2 : window.devicePixelRatio
    this.renderer.setPixelRatio(pixel);
    document.body.appendChild(this.renderer.domElement)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.pp = new Postpro(this.scene, this.camera, this.renderer)

    this.directlight = this.light()
  }
  
  light() {
    const abmbient = new THREE.AmbientLight(0xffffff, 1)
    const hemispherelight = new THREE.HemisphereLight(0xffffff, 0x333333)
    hemispherelight.position.set(0, 20, 10)
    const directlight = new THREE.DirectionalLight(0xffffff, 3);
    directlight.position.set(4, 10, 4)
    directlight.lookAt(new THREE.Vector3().set(0, 2, 0))
    directlight.castShadow = true
    directlight.shadow.radius = 1000
    directlight.shadow.mapSize.width = 4096
    directlight.shadow.mapSize.height = 4096
    directlight.shadow.camera.near = 1
    directlight.shadow.camera.far = 1000.0
    directlight.shadow.camera.left = 500
    directlight.shadow.camera.right = -500
    directlight.shadow.camera.top = 500
    directlight.shadow.camera.bottom = -500
    this.scene.add(abmbient, /*hemispherelight,*/ directlight, /*this.effector.meshs*/)
    return directlight
  }
  async init() {
    const nonglowfn = (mesh: any) => { this.pp.setNonGlow(mesh) }
    await this.fab.init(nonglowfn)
  }

  clock = new THREE.Clock()
  animate() {
    window.requestAnimationFrame(() => {
      this.render()
      this.animate()
    })
  }
  render() {
    const delta = this.clock.getDelta()
    this.pp.render(delta)
    this.controls.update()
    this.canvas.update()
    this.fab.gphysics.update()
  }
}



const index = new Index()
index.init().then(() => {
  index.animate()
})