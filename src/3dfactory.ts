import * as THREE from "three";
import { Renderer } from "./common/renderer";
import { Loader } from "@Glibs/loader/loader";
import { GPhysics } from "@Glibs/world/physics/gphysics";
import { Floor } from "./floor";
import { Light } from "./common/light";
import { Player } from "@Glibs/actors/player/player";
import { PlayerCtrl } from "@Glibs/actors/player/playerctrl";
import { ZeldaGrass } from "@Glibs/world/grass/zeldagrass";
import { FluffyTree } from "@Glibs/world/fluffytree/fluffytree";
import { Ocean } from "@Glibs/world/ocean/ocean";
import { Wind } from "@Glibs/world/wind/wind";
import IEventController from "@Glibs/interface/ievent";
import { InvenFactory } from "@Glibs/inventory/invenfactory";
import { Canvas } from "@Glibs/systems/event/canvas";
import { Camera } from "@Glibs/systems/camera/camera";

export class ThreeFactory {
    loader = new Loader()
    game = new THREE.Scene()
    light = new Light()
    canvas: Canvas
    camera: Camera
    renderer: Renderer
    invenFab: InvenFactory

    gphysics: GPhysics
    player: Player
    playerCtrl : PlayerCtrl
    floor: Floor
    grass: ZeldaGrass
    tree: FluffyTree
    ocean: Ocean
    wind: Wind

    constructor(private eventCtrl: IEventController) {
        this.canvas = new Canvas(this.eventCtrl)
        this.gphysics = new GPhysics(this.game, this.eventCtrl)
        this.invenFab = new InvenFactory(this.loader, this.eventCtrl)
        this.player = new Player(this.loader, this.loader.DogAsset, this.eventCtrl, this.game)
        this.playerCtrl = new PlayerCtrl(this.player, this.invenFab.inven, this.gphysics, this.eventCtrl)
        this.floor = new Floor()
        this.grass = new ZeldaGrass(this.eventCtrl)
        this.tree = new FluffyTree(this.loader)
        this.ocean = new Ocean(this.eventCtrl)
        this.wind = new Wind(this.eventCtrl)
        
        this.camera = new Camera(this.canvas, this.eventCtrl, this.player)
        this.renderer = new Renderer(this.camera, this.game, this.canvas, this.eventCtrl)
    }
    async init() {
        await this.GltfLoad()
        await this.InitScene()
    }
    async GltfLoad() {
        const ret = await Promise.all([
            await this.player.Loader(this.loader.DogAsset, new THREE.Vector3(0, 0, 0), "dog"),
            await this.tree.createTree(new THREE.Euler(), new THREE.Vector3(-3, 0, -3))
        ]).then(() => {
            this.player.Visible = true
            this.gphysics.addPlayer(this.player)
            this.gphysics.addLand(this.floor)
        })
    }
    InitScene() {
        this.game.add(
            this.player.Meshs, 
            this.floor.Meshs, 
            this.tree.Meshs,
            this.grass.mesh,
            this.ocean.mesh,
            this.wind.mesh,
            this.light,
        )
    }
}