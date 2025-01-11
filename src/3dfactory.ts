import * as THREE from "three";
import { Loader } from "@Glibs/loader/loader";
import { GPhysics } from "@Glibs/world/physics/gphysics";
import { Floor } from "./floor";
import { Light } from "./common/light";
import { Player } from "@Glibs/actors/player/player";
import { PlayerCtrl } from "@Glibs/actors/player/playerctrl";
import { Wind } from "@Glibs/world/wind/wind";
import IEventController from "@Glibs/interface/ievent";
import { InvenFactory } from "@Glibs/inventory/invenfactory";
import { TreeMaker } from "@Glibs/world/fluffytree/treemaker";
import Trainer from "@Glibs/actors/agent/trainer";
import { MonsterDb } from "@Glibs/types/monsterdb";
import { Monsters } from "@Glibs/actors/monsters/monsters";
import { MonsterId } from "@Glibs/types/monstertypes";
import Food from "./food";
import { Alarm } from "@Glibs/systems/alarm/alarm";
import GameCenter from "@Glibs/systems/gamecenter/gamecenter";
import PlayState from "@Glibs/systems/gamecenter/playstate";
import MenuState from "@Glibs/systems/gamecenter/menustate";
import LolliBar from "@Glibs/ux/progress/lollibar";
import UiTrainerHelper from "./uitrainerhelper";
import WeelLoader from "@Glibs/ux/loading/loading";
import { EventTypes } from "@Glibs/types/globaltypes";
import TitleScreen from "@Glibs/ux/titlescreen/titlescreen";
import MenuItem from "@Glibs/ux/titlescreen/menuitem";
import BootModal from "@Glibs/ux/dialog/bootmodal";
import ModelStore from "@Glibs/actors/agent/modelstore";
import Setting, { OptType, Options } from "@Glibs/ux/settings/settings";
import Toast from "@Glibs/ux/toast/toast";
import Agent from "@Glibs/actors/agent/agent";
import TrainerX from "@Glibs/actors/agent/trainerx";
import { SkyBoxAllTime } from "@Glibs/world/sky/skyboxalltime";
import Spinning from "@Glibs/ux/loading/spinning";

export class ThreeFactory {
    loader = new Loader()
    light = new Light()
    monDb = new MonsterDb()
    invenFab: InvenFactory

    gphysics: GPhysics
    player: Player
    playerCtrl : PlayerCtrl
    floor: Floor
    tree: TreeMaker
    wind: Wind
    agent?: Agent
    monster: Monsters
    food: Food[] = []
    modelStore = new ModelStore(this.eventCtrl)
    alarm = new Alarm(this.eventCtrl)
    toast = new Toast(this.eventCtrl)
    sky = new SkyBoxAllTime(this.light)

    loading = new WeelLoader(this.eventCtrl)
    spin = new Spinning(this.eventCtrl)
    gamecenter = new GameCenter()
    dialog = new BootModal()
    settings = new Setting()

    bar = new LolliBar(this.eventCtrl, {initValue: 0.0})
    uiTexter = new UiTrainerHelper(this.eventCtrl, this.dialog)
    titleScreen: TitleScreen
    timeScale = 1

    constructor(
        private eventCtrl: IEventController, 
        private game: THREE.Scene,
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
                        this.gamecenter.ChangeMode("play")
                    }),
                    new MenuItem("Training", () => {
                        this.titleScreen.Dispose()
                        this.bar.RenderHTML()
                        this.uiTexter.RenderHTML()
                        this.gamecenter.ChangeMode("training")
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
        ])
        this.gphysics = new GPhysics(this.game, this.eventCtrl)
        this.invenFab = new InvenFactory(this.loader, this.eventCtrl)
        this.player = new Player(this.loader, this.loader.DogAsset, this.eventCtrl, this.game)
        this.playerCtrl = new PlayerCtrl(this.player, this.invenFab.inven, this.gphysics, this.eventCtrl, { immortal: true })
        this.floor = new Floor(500)
        this.tree = new TreeMaker(this.loader, eventCtrl, game)
        this.wind = new Wind(this.eventCtrl)
        this.monster = new Monsters(this.loader, this.eventCtrl, this.game, this.player, [], [], this.gphysics, this.monDb)
        this.monster.Enable = true

    }
    async init(nonglowfn?: Function) {
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 10)
        await this.GltfLoad()
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 40)
        await this.FoodLoad()
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 70)
        await this.InitScene(nonglowfn)
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 90)
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 100)
        this.titleScreen.RenderHTML()
    }
    async FoodLoad() {
        for (let i = 0; i < 100; i++) {
            this.food.push(new Food(this.loader.AppleAsset, this.player, this.eventCtrl))
        }
        const ret = await Promise.all(
            this.food.map(async (f) => {
                await f.Loader("apple")
            })
        )
    }
    async GltfLoad() {
        const ret = await Promise.all([
            await this.player.Loader(this.loader.DogAsset, new THREE.Vector3(0, 0, 0), "dog"),
            await this.tree.Create({ position: new THREE.Vector3(-3, 0, -3) }),
        ]).then(() => {
            this.player.Visible = true
            this.gphysics.addPlayer(this.player)
            this.gphysics.addLand(this.floor)
        })
        return ret
    }
    async InitScene(nonglowfn?: Function) {
        this.food.forEach((f) => {
            nonglowfn?.(f.Meshs)
            this.game.add(f.Meshs)
        })
        nonglowfn?.(this.sky)
        this.game.add(this.sky)

        nonglowfn?.(this.player.Meshs)
        nonglowfn?.(this.floor.Meshs)
        nonglowfn?.(this.wind.mesh)
        nonglowfn?.(this.player.Meshs)
        //this.tree.models.forEach((m) => { nonglowfn?.(m.Meshs) })
        this.gamecenter.RegisterGameMode("play",
            new PlayState(this.game, [
                this.player.Meshs,
                this.floor.Meshs,
                this.wind.mesh,
                this.light,
            ], {
                initCall: async () => {
                    if (!this.modelStore.model) throw new Error("undefined model");

                    const mon = await this.monster.CreateMonster(MonsterId.Zombie, false, new THREE.Vector3(5, 0, 5))
                    if (!mon) throw new Error("undefined monster");
                    nonglowfn?.(mon.monModel.Meshs)
                    this.agent = new Agent(this.eventCtrl, this.modelStore.model, this.player, 
                        [mon.monModel], [...this.food])
                    this.agent.Start()
                    this.playerCtrl.Immortal = false
                    this.playerCtrl.Enable = true
                }
            }))
        this.gamecenter.RegisterGameMode("training",
            new PlayState(this.game, [
                this.player.Meshs,
                this.floor.Meshs,
                this.wind.mesh,
                this.light,
            ], {
                initCall: async () => {
                    const mon = await this.monster.CreateMonster(MonsterId.Zombie, false, new THREE.Vector3(5, 0, 5))
                    if (!mon) throw new Error("undefined monster");
                    nonglowfn?.(mon.monModel.Meshs)
                    // const trainer = new Trainer(this.eventCtrl, this.modelStore, this.player, 
                    //     [mon.monModel], [...this.food], { timeScale: this.timeScale })
                    const trainer = new TrainerX(this.eventCtrl, this.modelStore, this.player,
                        [mon.monModel], [...this.food], { timeScale: this.timeScale })
                    trainer.Start()
                    this.playerCtrl.Enable = true
                }
            }))
        this.gamecenter.RegisterGameMode("menumode",
            new MenuState(this.game, [
                this.player.Meshs,
                this.floor.Meshs,
                this.wind.mesh,
                this.light,
            ], {
                initCall: () => {
                }
            }))
        this.gamecenter.ChangeMode("menumode")
    }
}