import * as THREE from 'three'
import { EventController } from '@Glibs/systems/event/eventctrl'
import { Canvas } from '@Glibs/systems/event/canvas'
import { Effector } from '@Glibs/magical/effects/effector'
import { ThreeFactory } from './3dfactory'
import DefaultLights from '@Glibs/systems/lights/defaultlights'

class Index {
  scene = new THREE.Scene()
  renderer = new THREE.WebGLRenderer({ antialias: true, })
  eventCtrl = new EventController()
  canvas = new Canvas(this.eventCtrl)
  effector = new Effector(this.scene)
  fab = new ThreeFactory(this.eventCtrl, this.scene, this.canvas, this.renderer)
  light = new DefaultLights(this.scene)

  constructor() {
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

    // 4. 창 크기 변경 이벤트 리스너 추가
    window.addEventListener('resize', () => {
      this.fab.camera.resize(window.innerWidth, window.innerHeight)
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      const pixel = (window.devicePixelRatio >= 2) ? window.devicePixelRatio / 2 : window.devicePixelRatio
      this.renderer.setPixelRatio(pixel);
    }, false);
  }

  async init() {
    await this.fab.init()
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
    this.canvas.update()
    this.fab.update(delta)
  }
}



const index = new Index()
window.requestAnimationFrame(() => {
  index.init().then(() => {
    index.animate()
  })
})
