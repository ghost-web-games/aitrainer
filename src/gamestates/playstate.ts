import * as THREE from "three";
import Agent from '@Glibs/actors/agent/agent';
import ModelStore from '@Glibs/actors/agent/modelstore';
import { Monsters } from '@Glibs/actors/monsters/monsters';
import { PlayerCtrl } from '@Glibs/actors/player/playerctrl';
import IEventController, { ILoop } from '@Glibs/interface/ievent';
import { IPhysicsObject } from '@Glibs/interface/iobject';
import { IGameMode } from '@Glibs/systems/gamecenter/gamecenter'
import { IPostPro } from '@Glibs/systems/postprocess/postpro'
import { EventTypes } from '@Glibs/types/globaltypes';
import Food from '../food';
import { MonsterId } from '@Glibs/types/monstertypes';

export default class PlayState implements IGameMode {
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
        private agent: Agent,
        private food: Food[],
        private objs: THREE.Object3D[] | THREE.Group[] | THREE.Mesh[] = [],
        private taskObj: ILoop[] = [],
        private phyObj: IPhysicsObject[] = [],
    ) { 

    }
    async Init() {
        if (!this.modelStore.model) throw new Error("undefined model");
        this.eventCtrl.SendEventMessage(EventTypes.Spinner, true)

        const mon = await this.monster.CreateMonster(MonsterId.Zombie, false, new THREE.Vector3(5, 0, 5))
        if (!mon) throw new Error("undefined monster");
        this.nonglowfn?.(mon.monModel.Meshs)
        this.agent = new Agent(this.eventCtrl, this.modelStore.model, this.player,
            [mon.monModel], [...this.food])
        this.agent.Start()
        this.playerCtrl.Immortal = false
        this.playerCtrl.Enable = true
        this.eventCtrl.SendEventMessage(EventTypes.Spinner, false)
    }
    Uninit(): void {
        this.monster.ReleaseMonster()
        this.agent.Stop()
        this.playerCtrl.Enable = false
    }
    Renderer(r: IPostPro, delta: number): void {
       r.render(delta)
    }
}