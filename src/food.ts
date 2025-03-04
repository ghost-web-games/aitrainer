import * as THREE from "three";
import IEventController, { ILoop } from "@Glibs/interface/ievent";
import { IPhysicsObject, PhysicsObject } from "@Glibs/interface/iobject";
import { IAsset } from "@Glibs/loader/iasset";
import { EventTypes } from "@Glibs/types/globaltypes";
import { AttackType } from "@Glibs/types/playertypes";

const range = 20

export default class Food extends PhysicsObject implements ILoop {
    LoopId = 0
    constructor(
        asset: IAsset,
        private player: IPhysicsObject,
        private eventCtrl: IEventController,
    ) {
        super(asset)
        eventCtrl.SendEventMessage(EventTypes.RegisterLoop, this)
    }
    async Loader(name: string) {
        const [meshs, _exist] = await this.asset.UniqModel(name)
        this.meshs = meshs
        this.Pos.set(THREE.MathUtils.randInt(-range, range), 0, THREE.MathUtils.randInt(-range, range))
    }
    update(): void {
        if (this.player.Pos.distanceTo(this.Pos) < 1.5) {
            this.eventCtrl.SendEventMessage(EventTypes.Attack + "aiagent", [{
                type: AttackType.Heal,
                callback: () => {
                    this.Pos.set(THREE.MathUtils.randInt(-range, range), 0, THREE.MathUtils.randInt(-range, range))
                }
            }])
        }
    }
}