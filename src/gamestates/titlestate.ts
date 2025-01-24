import * as THREE from "three";
import IEventController, { ILoop } from '@Glibs/interface/ievent';
import { IGameMode } from '@Glibs/systems/gamecenter/gamecenter'
import { IPostPro } from '@Glibs/systems/postprocess/postpro'
import { EventTypes } from '@Glibs/types/globaltypes';
import TitleScreen from "@Glibs/ux/titlescreen/titlescreen";
import TapButton from "@Glibs/ux/buttons/tapbutton";
import { IPhysicsObject } from "@Glibs/interface/iobject";

export default class TitleState implements IGameMode {
    get Objects() { return this.objs }
    get TaskObj() { return this.taskObj }
    get Physics() { return this.phyObj }
    titleScreen: TitleScreen
    tap: TapButton
    constructor(
        private eventCtrl: IEventController,
        private objs: THREE.Object3D[] | THREE.Group[] | THREE.Mesh[] = [],
        private taskObj: ILoop[] = [],
        private phyObj: IPhysicsObject[] = [],
    ) {
        this.titleScreen = new TitleScreen("Monster<br>Trainer", [], { selfAdd: false })
        this.tap = new TapButton(document.body, {
            opacity: "0",
            click: () => {
                this.titleScreen.Dispose()
                this.eventCtrl.SendEventMessage(EventTypes.GameCenter, "menumode")
            }
        })
        this.titleScreen.RenderHTML()
        this.tap.addChild(this.titleScreen.dom!)
    }
    async Init() {
        this.tap.show()
    }
    Uninit(): void {
        this.tap.hide()
    }
    Renderer(r: IPostPro, delta: number): void {
        r.render(delta)
    }
}