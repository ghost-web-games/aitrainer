import * as THREE from "three";
import ModelStore from '@Glibs/actors/agent/modelstore';
import IEventController from '@Glibs/interface/ievent';
import { IGameMode } from '@Glibs/systems/gamecenter/gamecenter'
import { IPostPro } from '@Glibs/systems/postprocess/postpro'
import { Camera } from "@Glibs/systems/camera/camera";
import MenuGroup from "@Glibs/ux/menuicons/menugroup";
import MenuIcon from "@Glibs/ux/menuicons/menuicon";
import { Icons } from "@Glibs/types/icontypes";
import { IPhysicsObject } from "@Glibs/interface/iobject";
import { gsap } from "gsap";
import SystemDialog from "../dialogs/sysdlg";

export default class MenuState implements IGameMode {
    sysdlg = new SystemDialog(this.modelStore)
    constructor(
        private scene: THREE.Scene,
        private eventCtrl: IEventController,
        private player: IPhysicsObject,
        private modelStore: ModelStore,
        private timeScale: number,
        private camera: Camera,
        private objs: THREE.Object3D[] | THREE.Group[] | THREE.Mesh[] = [],
    ) {

    }
    async Init() {
        this.camera.controls.enabled = false
        this.camera.lookTarget = false
        const mdom = new MenuGroup(document.body, { bottom: "0px", opacity: "0" })
        mdom.addMenu(new MenuIcon({ icon: Icons.Setting, boxEnable: true, click: () => { this.sysdlg.show() } }))
        
        const start = this.player.Pos.clone()
        start.addScalar(4)
        const look = this.player.Pos.clone()
        look.y += 2
        gsap.to(this.camera.position, {
            x: start.x, y: start.y, z: start.z, duration: 1, onUpdate: () => {
                this.camera.lookAt(look)
        } })

        this.scene.add(...this.objs)
    }
    Uninit(): void {
        this.camera.controls.enabled = true
        this.camera.lookTarget = true
        this.objs.forEach((obj) => {
            this.scene.remove(obj)
        })
    }
    Renderer(r: IPostPro, delta: number): void {
        r.render(delta)
    }
}