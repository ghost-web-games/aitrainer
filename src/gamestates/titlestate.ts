import * as THREE from "three";
import ModelStore from '@Glibs/actors/agent/modelstore';
import IEventController from '@Glibs/interface/ievent';
import { IGameMode } from '@Glibs/systems/gamecenter/gamecenter'
import { IPostPro } from '@Glibs/systems/postprocess/postpro'
import { EventTypes } from '@Glibs/types/globaltypes';
import TitleScreen from "@Glibs/ux/titlescreen/titlescreen";
import MenuItem from "@Glibs/ux/titlescreen/menuitem";
import LolliBar from "@Glibs/ux/progress/lollibar";
import UiTrainerHelper from "../uitrainerhelper";
import BootModal from "@Glibs/ux/dialog/bootmodal";
import Setting, { OptType, Options } from "@Glibs/ux/settings/settings";
import TapButton from "@Glibs/ux/buttons/tapbutton";

export default class TitleState implements IGameMode {
    titleScreen: TitleScreen
    dialog = new BootModal()
    bar = new LolliBar(this.eventCtrl, {initValue: 0.0})
    uiTexter = new UiTrainerHelper(this.eventCtrl, this.dialog)
    settings = new Setting()
    tap: TapButton
    constructor(
        private scene: THREE.Scene,
        private eventCtrl: IEventController,
        private modelStore: ModelStore,
        private timeScale: number,
        private objs: THREE.Object3D[] | THREE.Group[] | THREE.Mesh[] = [],
    ) {
        this.settings.addOption("Randomness", { type: OptType.Inputs, value: [0.995] })
        this.settings.addLine()
        this.settings.addOption("Auto Save",  { type: OptType.Switches })
        this.settings.addLine()
        this.settings.addOption("Speed", { 
            type: OptType.Selects, name: "_speed", value: [1, 2, 3, 4, 5, 10], onchange: (opt: Options) => {
                const dom = document.getElementById(opt.uniqId) as HTMLSelectElement
                if(!dom) return
                this.timeScale = Number(dom.value)
                eventCtrl.SendEventMessage(EventTypes.TimeCtrl, this.timeScale)
            }
        })
        this.titleScreen = new TitleScreen("Monster<br>Trainer", [
            new MenuItem("Start", () => {
                this.titleScreen.SubMenuShow([
                    new MenuItem("Play", () => {
                        if (!this.modelStore.model) {
                            this.eventCtrl.SendEventMessage(EventTypes.Toast, "Notice", "Model Card is Empty")
                            return
                        }
                        this.titleScreen.Dispose()
                        this.bar.RenderHTML()
                        this.uiTexter.RenderHTML()
                        this.eventCtrl.SendEventMessage(EventTypes.GameCenter, "play")
                    }),
                    new MenuItem("Training", () => {
                        this.titleScreen.Dispose()
                        this.bar.RenderHTML()
                        this.uiTexter.RenderHTML()
                        this.eventCtrl.SendEventMessage(EventTypes.GameCenter, "training")
                    }),
                    new MenuItem("Multi Play", () => {
                        this.eventCtrl.SendEventMessage(EventTypes.Toast, "Notics", "Not Implemented yet")
                    })
                ])
            }),
            new MenuItem("Load Ai Card", async () => {
                this.dialog.RenderHtml("Load Ai Card", await this.modelStore.GetModelListElement())
                this.dialog.show()
            }),
            new MenuItem("Upload Ai Card", () => {
                this.dialog.RenderHtml("Upload Ai Card", this.modelStore.GetUploadElement())
                this.dialog.show()
            }),
            new MenuItem("Settings", () => {
                this.dialog.RenderHtml("Settings", this.settings.GetElements())
                this.dialog.show()
            }),
            new MenuItem("How To", () => { }),
        ], { selfAdd: false })
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
        this.scene.add(...this.objs)
    }
    Uninit(): void {
        this.objs.forEach((obj) => {
            this.scene.remove(obj)
        })
    }
    Renderer(r: IPostPro, delta: number): void {
        r.render(delta)
    }
}