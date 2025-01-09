import * as THREE from "three";
import IEventController, { ILoop } from "@Glibs/interface/ievent";
import { IPhysicsObject, PhysicsObject } from "@Glibs/interface/iobject";
import { IAsset } from "@Glibs/loader/iasset";
import { Loader } from "@Glibs/loader/loader";
import { EventTypes } from "@Glibs/types/globaltypes";
import { AttackType } from "@Glibs/types/playertypes";


export default class Food extends PhysicsObject implements ILoop {
    constructor(
        private loader: Loader,
        asset: IAsset,
        private player: IPhysicsObject,
        private eventCtrl: IEventController,
        private game: THREE.Scene
    ) {
        super(asset)
        eventCtrl.SendEventMessage(EventTypes.RegisterLoop, this)
    }
    async Loader(name: string) {
        const [meshs, _exist] = await this.asset.UniqModel(name)
        this.meshs = meshs
        this.Pos.set(THREE.MathUtils.randInt(-20, 20), 0, THREE.MathUtils.randInt(-20, 20))
    }
    update(): void {
       if(this.player.Pos.distanceTo(this.Pos) < 1.5) {
           this.eventCtrl.SendEventMessage(EventTypes.Attack + "aiagent", [{
            type: AttackType.Heal,
            callback: () => {
                this.Pos.set(THREE.MathUtils.randInt(-20, 20), 0, THREE.MathUtils.randInt(-20, 20))
            }
        }])
       }
    }
}