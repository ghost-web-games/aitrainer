import * as THREE from "three";
import IEventController, { ILoop, IViewer } from "@Glibs/interface/ievent";
import { Canvas } from "@Glibs/systems/event/canvas";
import { EventTypes } from "@Glibs/types/globaltypes";
import { Camera } from "@Glibs/systems/camera/camera";

export class Renderer extends THREE.WebGLRenderer implements IViewer, ILoop {

    constructor(private camera: Camera, private scene: THREE.Scene, canvas: Canvas, eventCtrl: IEventController) {
        super({ /*alpha: true,*/ antialias: true, canvas: canvas.Canvas })

        THREE.ColorManagement.enabled = true
        this.outputColorSpace = THREE.SRGBColorSpace
        this.shadowMap.enabled = true
        this.shadowMap.type = THREE.PCFSoftShadowMap

        this.setClearColor(0x66ccff, 1)
        this.setSize(canvas.Width, canvas.Height)
        this.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        eventCtrl.SendEventMessage(EventTypes.RegisterLoop, this)
        eventCtrl.SendEventMessage(EventTypes.RegisterViewer, this)
    }

    setScene(scene: THREE.Scene) {
        this.scene = scene
    }

    resize(width: number, height: number) {
        this.setSize(width, height)
        this.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    update() {
        this.render(this.scene, this.camera)
    }
}