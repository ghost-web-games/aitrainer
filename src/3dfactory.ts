import * as THREE from "three";
import { Loader } from "@Glibs/loader/loader";
import { GPhysics } from "@Glibs/world/physics/gphysics";
import { Floor } from "./floor";
import { Light } from "./common/light";
import { Player } from "@Glibs/actors/player/player";
import { PlayerCtrl } from "@Glibs/actors/player/playerctrl";
import { FluffyTree } from "@Glibs/world/fluffytree/fluffytree";
import { Wind } from "@Glibs/world/wind/wind";
import IEventController from "@Glibs/interface/ievent";
import { InvenFactory } from "@Glibs/inventory/invenfactory";
import { FluffyTreeType, TreeMaker } from "@Glibs/world/fluffytree/treemaker";
import Training from "@Glibs/actors/agent/trainer";
import { MonsterDb } from "@Glibs/types/monsterdb";
import { Monsters } from "@Glibs/actors/monsters/monsters";
import { MonsterId } from "@Glibs/types/monstertypes";
import Food from "./food";
import { Alarm } from "@Glibs/systems/alarm/alarm";
import LolliBar from "@Glibs/ux/progress/lollibar";
import UiTexter from "./uitexter";

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
    trainer?: Training
    monster: Monsters
    food: Food[] = []
    alarm = new Alarm(this.eventCtrl)
    bar = new LolliBar(this.eventCtrl)
    uiTexter = new UiTexter(this.eventCtrl)

    constructor(
        private eventCtrl: IEventController, 
        private game: THREE.Scene
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

    }
    async init(nonglowfn?: Function) {
        await this.GltfLoad()
        await this.FoodLoad()
        await this.InitScene(nonglowfn)
    }
    async FoodLoad() {
        for(let i = 0; i < 10; i++)  {
            this.food.push(new Food(this.loader, this.loader.AppleAsset, this.player, this.eventCtrl, this.game))
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
        const mon = await this.monster.CreateMonster(MonsterId.Zombie, false, new THREE.Vector3(5, 0, 5))
        if(!mon) throw new Error("undefined monster");

        this.food.forEach((f) => {
            nonglowfn?.(f.Meshs)
            this.game.add(f.Meshs)
        })
        
        nonglowfn?.(mon.monModel.Meshs)
        nonglowfn?.(this.player.Meshs)
        nonglowfn?.(this.floor.Meshs)
        nonglowfn?.(this.wind.mesh)
        nonglowfn?.(this.player.Meshs)
        //this.tree.models.forEach((m) => { nonglowfn?.(m.Meshs) })

        this.trainer = new Training(this.eventCtrl, this.player, [mon.monModel], [...this.food])
        this.trainer.Start()

        this.playerCtrl.Enable = true

        this.game.add(
            this.player.Meshs, 
            this.floor.Meshs, 
            this.wind.mesh,
            this.light,
        )
    }
}