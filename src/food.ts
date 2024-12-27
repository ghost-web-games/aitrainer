import * as THREE from "three";
import IEventController, { ILoop } from "@Glibs/interface/ievent";
import { IPhysicsObject, PhysicsObject } from "@Glibs/interface/iobject";
import { IAsset } from "@Glibs/loader/iasset";
import { Loader } from "@Glibs/loader/loader";
import { EventTypes } from "@Glibs/types/globaltypes";


export default class Food extends PhysicsObject implements ILoop {
    constructor(
        private loader: Loader,
        asset: IAsset,
        private player: IPhysicsObject,
        eventCtrl: IEventController,
        private game: THREE.Scene
    ) {
        super(asset)
        eventCtrl.SendEventMessage(EventTypes.RegisterLoop, this)
    }
    async Loader(position: THREE.Vector3, name: string) {
        const [meshs, _exist] = await this.asset.UniqModel(name)
        this.meshs = meshs
        this.meshs.position.copy(position)
    }
    update(): void {
       if(this.player.Pos.distanceTo(this.Pos) < 0.5) {
        this.Pos.set(THREE.MathUtils.randInt(3, 20), 0, THREE.MathUtils.randInt(3, 20))
       }
    }
}