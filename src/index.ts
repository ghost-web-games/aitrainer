import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EventController } from '@Glibs/systems/event/eventctrl'
import { Canvas } from '@Glibs/systems/event/canvas'
import { Effector } from '@Glibs/magical/effects/effector'
import { IPostPro, Postpro } from '@Glibs/systems/postprocess/postpro'
import { Camera } from '@Glibs/systems/camera/camera'
import { ThreeFactory } from './3dfactory'
import DefaultLights from '@Glibs/systems/lights/defaultlights'

class Index {
  scene = new THREE.Scene()
  camera: Camera
  renderer = new THREE.WebGLRenderer({ antialias: true, })
  eventCtrl = new EventController()
  canvas = new Canvas(this.eventCtrl)
  effector = new Effector(this.scene)
  pp: IPostPro
  fab = new ThreeFactory(this.eventCtrl, this.scene)
  light = new DefaultLights(this.scene)

  constructor() {
    this.camera = new Camera(this.canvas, this.eventCtrl, this.fab.player, this.renderer.domElement)
    this.camera.position.set(15, 15, 15)
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

    this.pp = new Postpro(this.scene, this.camera, this.renderer)
    // 4. 창 크기 변경 이벤트 리스너 추가
    window.addEventListener('resize', () => {
      this.camera.resize(window.innerWidth, window.innerHeight)
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      const pixel = (window.devicePixelRatio >= 2) ? window.devicePixelRatio / 2 : window.devicePixelRatio
      this.renderer.setPixelRatio(pixel);
    }, false);
  }

  async init() {
    const nonglowfn = (mesh: any) => { this.pp.setNonGlow(mesh) }
    await this.fab.init(this.camera, nonglowfn)
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
    this.fab.gamecenter.Renderer(this.pp, delta)
    this.canvas.update()
    this.fab.gphysics.update()
  }
}



const index = new Index()
window.requestAnimationFrame(() => {
  index.init().then(() => {
    index.animate()
  })
})
