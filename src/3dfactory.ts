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
import { MonsterDb } from "@Glibs/types/monsterdb";
import { Monsters } from "@Glibs/actors/monsters/monsters";
import Food from "./food";
import { Alarm } from "@Glibs/systems/alarm/alarm";
import GameCenter from "@Glibs/systems/gamecenter/gamecenter";
import WeelLoader from "@Glibs/ux/loading/loading";
import { EventTypes } from "@Glibs/types/globaltypes";
import ModelStore from "@Glibs/actors/agent/modelstore";
import Toast from "@Glibs/ux/toast/toast";
import Agent from "@Glibs/actors/agent/agent";
import { SkyBoxAllTime } from "@Glibs/world/sky/skyboxalltime";
import Spinning from "@Glibs/ux/loading/spinning";
import PlayState from "./gamestates/playstate";
import TraningState from "./gamestates/traningstate";
import MenuState from "./gamestates/menustate";
import TitleState from "./gamestates/titlestate";
import { Camera } from "@Glibs/systems/camera/camera";
import FontLoader from "@Glibs/ux/text/fontloader";
import { FontType } from "@Glibs/ux/text/fonttypes";

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
    sky = new SkyBoxAllTime(this.light, { daytime: 0 })

    font = new FontLoader()

    loading = new WeelLoader(this.eventCtrl)
    spin = new Spinning(this.eventCtrl)
    gamecenter = new GameCenter(this.eventCtrl, this.game)

    timeScale = 1

    constructor(
        private eventCtrl: IEventController, 
        private game: THREE.Scene,
    ) {
        this.gphysics = new GPhysics(this.game, this.eventCtrl)
        this.invenFab = new InvenFactory(this.loader, this.eventCtrl)
        this.player = new Player(this.loader, this.loader.DogAsset, this.eventCtrl, this.game)
        this.playerCtrl = new PlayerCtrl(this.player, this.invenFab.inven, this.gphysics, this.eventCtrl, { immortal: true })
        this.floor = new Floor(500)
        this.tree = new TreeMaker(this.loader, eventCtrl, game)
        this.wind = new Wind(this.eventCtrl)
        this.monster = new Monsters(this.loader, this.eventCtrl, this.game, this.player, [], [], this.gphysics, this.monDb)
        this.monster.Enable = true

        this.font.fontCss(FontType.Coiny)
    }
    async init(camera: Camera, nonglowfn?: Function) {
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 10)
        await this.GltfLoad()
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 40)
        await this.FoodLoad()
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 70)
        await this.InitScene(camera, nonglowfn)
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 90)
        this.eventCtrl.SendEventMessage(EventTypes.LoadingProgress, 100)
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
    async InitScene(camera: Camera, nonglowfn?: Function) {
        const foods: THREE.Object3D[] = []
        this.food.forEach((f) => {
            nonglowfn?.(f.Meshs)
            foods.push(f.Meshs)
        })
        nonglowfn?.(this.sky)
        this.game.add(this.sky)

        nonglowfn?.(this.player.Meshs)
        nonglowfn?.(this.floor.Meshs)
        nonglowfn?.(this.wind.mesh)
        nonglowfn?.(this.player.Meshs)
        //this.tree.models.forEach((m) => { nonglowfn?.(m.Meshs) })
        this.gamecenter.RegisterGameMode("play",
            new PlayState(this.eventCtrl, this.player, this.playerCtrl,
                this.modelStore, this.monster, nonglowfn!, this.agent!, this.food,
                [
                    this.player.Meshs,
                    this.wind.mesh,
                    this.floor,
                    this.light,
                    ...foods,
                ], [
                this.wind,
                ...this.food,
            ], [
                this.player,
            ]))
        this.gamecenter.RegisterGameMode("training",
            new TraningState(this.eventCtrl, this.player, this.playerCtrl,
                this.modelStore, this.monster, nonglowfn!, this.food,
                [
                    this.player.Meshs,
                    this.wind.mesh,
                    this.floor,
                    this.light,
                    ...foods,
                ], [
                this.wind,
                ...this.food,
            ], [
                this.player,
            ]))
        this.gamecenter.RegisterGameMode("titlemode",
            new TitleState(this.eventCtrl, [
                this.player.Meshs,
                this.wind.mesh,
                this.floor,
                this.light,
                ...foods,
            ], [
                this.wind,
                ...this.food
            ], [
                this.player,
            ]))
        this.gamecenter.RegisterGameMode("menumode",
            new MenuState(this.eventCtrl, this.loader, this.player, this.modelStore, this.game, camera,
                nonglowfn!, [
                this.player.Meshs,
                this.floor,
                this.light,
            ], [], [
                this.player,

            ]))
        this.eventCtrl.SendEventMessage(EventTypes.GameCenter, "titlemode")
    }
}