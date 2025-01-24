import * as THREE from "three";
import { gsap } from "gsap";
import ModelStore from '@Glibs/actors/agent/modelstore';
import { Monsters } from '@Glibs/actors/monsters/monsters';
import { PlayerCtrl } from '@Glibs/actors/player/playerctrl';
import IEventController, { ILoop } from '@Glibs/interface/ievent';
import { IPhysicsObject } from '@Glibs/interface/iobject';
import { IGameMode } from '@Glibs/systems/gamecenter/gamecenter'
import { IPostPro } from '@Glibs/systems/postprocess/postpro'
import { EventTypes, UiInfoType } from '@Glibs/types/globaltypes';
import Food from '../food';
import { MonsterId } from '@Glibs/types/monstertypes';
import TrainerX from "@Glibs/actors/agent/trainerx";
import BootModal from "@Glibs/ux/dialog/bootmodal";
import MenuGroup from "@Glibs/ux/menuicons/menugroup";
import StatusBar from "@Glibs/ux/menuicons/statusbar";
import { Icons } from "@Glibs/types/icontypes";
import { AttackOption, AttackType } from "@Glibs/types/playertypes";
import Setting, { OptType, Options } from "@Glibs/ux/settings/settings";
import MenuIcon from "@Glibs/ux/menuicons/menuicon";
import { TrainingParam } from "@Glibs/types/agenttypes";
import { Camera } from "@Glibs/systems/camera/camera";

export default class TraningState implements IGameMode {
    trainer?: TrainerX
    dialog = new BootModal()
    sdom: MenuGroup
    cdom: MenuGroup
    apples = 0
    timeScale = 1
    setting = new Setting()

    get Objects() { return this.objs }
    get TaskObj() { return this.taskObj }
    get Physics() { return this.phyObj }

    constructor(
        private eventCtrl: IEventController,
        private player: IPhysicsObject,
        private playerCtrl: PlayerCtrl,
        private modelStore: ModelStore,
        private monster: Monsters,
        private nonglowfn: Function,
        private camera: Camera,
        private food: Food[],
        private objs: THREE.Object3D[] | THREE.Group[] | THREE.Mesh[] = [],
        private taskObj: ILoop[] = [],
        private phyObj: IPhysicsObject[] = [],
    ) { 
        this.cdom = new MenuGroup(document.body, { top: "10%", left: "0px", opacity: "0.5", vertical: true })
        this.cdom.addMenu(new MenuIcon({
            icon: Icons.Setting, click: () => {
                this.eventCtrl.SendEventMessage(EventTypes.TimeCtrl, 0)
                this.dialog.RenderHtml("Settings", this.setting.GetElements(), {
                    close: () => {
                        this.eventCtrl.SendEventMessage(EventTypes.TimeCtrl, this.timeScale)
                    }
                })
                this.dialog.show()
            }
        }))
        this.cdom.addMenu(new MenuIcon({
            icon: Icons.Pause, click: () => {
                this.eventCtrl.SendEventMessage(EventTypes.GameCenter, "menumode")

        }}))

        this.sdom = new MenuGroup(document.body, { height: "45px", top: "-10px", opacity: "0" })
        const status = this.sdom.addMenu(new StatusBar({ icon: Icons.Lightning, plusIcon: true, lolliBar: true }))
        const apple = this.sdom.addMenu(new StatusBar({ icon: Icons.Apple, value: 0 }))
        const ep = this.sdom.addMenu(new StatusBar({ icon: Icons.Stats, value: 0 }))
        

        eventCtrl.RegisterEventListener(EventTypes.UiInfo, (type: UiInfoType, value: number, max: number) => {
            const bar = (status as StatusBar).lbar
            if (type == UiInfoType.LolliBar && bar) {
                bar.updateValue(value, max)
            }
        })
        this.eventCtrl.RegisterEventListener(EventTypes.Attack + "aiagent", (opts: AttackOption[]) => {
            opts.forEach((opt) => {
                switch (opt.type) {
                    case AttackType.Heal:
                        this.apples++
                        (apple as StatusBar).UpdateStatus(this.apples)
                        break;
                }
            })
        })
        eventCtrl.RegisterEventListener(EventTypes.TimeCtrl, (scale: number) => {
            if (scale) this.timeScale = scale
        })
        eventCtrl.SendEventMessage(EventTypes.UiInfo, UiInfoType.LolliBar, 0, 100)
        const domId = this.setting.addOption("With Download", {
            type: OptType.Switches
        })
        this.setting.addOption("Save Training Data", {
            type: OptType.Buttons,
            onclick: (opt: Options) => {
                const dom = document.getElementById(opt.uniqId) as HTMLInputElement
                const domDownload = document.getElementById(domId) as HTMLInputElement
                eventCtrl.SendEventMessage(EventTypes.AgentSave, dom.value, domDownload.checked, opt)
            }
        })
        this.setting.addOption("Speed", {
            type: OptType.Selects, name: "_speed", value: [1, 2, 3, 4, 5, 10], onchange: (opt: Options) => {
                const dom = document.getElementById(opt.uniqId) as HTMLSelectElement
                if (!dom) return
                this.timeScale = Number(dom.value)
            }
        })
        this.eventCtrl.RegisterEventListener(EventTypes.AgentEpisode, (param: TrainingParam) => {
            (ep as StatusBar).UpdateStatus(param.episode)
            this.apples = param.doneCount
            this.eventCtrl.SendEventMessage(EventTypes.UiInfo, UiInfoType.LolliBar, (1 - param.epsilon) * 100, 100)
        })
    }
    async Init() {
        this.sdom.Show()
        this.cdom.Show()
        this.eventCtrl.SendEventMessage(EventTypes.Spinner, true)
        const mon = await this.monster.CreateMonster(MonsterId.Zombie, false, new THREE.Vector3(5, 0, 5))
        if (!mon) throw new Error("undefined monster");
        this.nonglowfn(mon.monModel.Meshs)
        this.trainer = new TrainerX(this.eventCtrl, this.modelStore, this.player,
            [mon.monModel], [...this.food], { timeScale: this.timeScale, step: 100 })
        this.trainer.Start()
        this.playerCtrl.Enable = true
        this.eventCtrl.SendEventMessage(EventTypes.Spinner, false)

        gsap.to(this.camera.position, {
            x: 15, y: 15, z: 15, duration: 1, onComplete: () => {
                this.camera.lookAt(this.player.Pos)
            }
        })
    }
    Uninit(): void {
        this.sdom.Hide()
        this.cdom.Hide()
        this.monster.ReleaseMonster()
        this.trainer?.Stop()
        this.playerCtrl.Enable = false
    }
    Renderer(r: IPostPro, delta: number): void {
       r.render(delta)
    }
}