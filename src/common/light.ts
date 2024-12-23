import * as THREE from "three";

export class Light extends THREE.DirectionalLight {
    constructor() {
        super(0xffd700, 2)
        //const pos = this.player.Position
        this.position.set(100, 200, 30)
        this.target.position.set(0, 3, 0)
        this.castShadow = true
        this.shadow.radius = 1000
        this.shadow.mapSize.width = 4096
        this.shadow.mapSize.height = 4096
        this.shadow.camera.near = 1
        this.shadow.camera.far = 1000.0
        this.shadow.camera.left = 500
        this.shadow.camera.right = -500
        this.shadow.camera.top = 500
        this.shadow.camera.bottom = -500
    }
}