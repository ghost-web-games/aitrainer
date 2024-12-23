import { GhostObject, IPhysicsObject } from "@Glibs/interface/iobject";
import * as THREE from "three";


export class Floor extends GhostObject implements IPhysicsObject {
    get BoxPos() {
        const v = this.Pos
        return new THREE.Vector3(v.x, v.y, v.z)
    }
    constructor() {
        const width = 15
        const height = 2
        //const geometry = new THREE.PlaneGeometry(width, width, 10, 10)
        const geometry = new THREE.CylinderGeometry(width, width + 4, 2, 32)
        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            //color: 0x228b22, 
            side: THREE.DoubleSide,
        })
        super(geometry, material)
        //this.rotateX(-Math.PI / 2)

        const colors = []
        const positionAttr = geometry.attributes.position
        const range = 80
        for (let i = 0; i < positionAttr.count; i++) {
            const x = positionAttr.getX(i)
            const z = positionAttr.getY(i)
            //const colorCode = (x <= range && x >= -range && z <= range && z >= -range) ? 0xffcc66 : 0xb2c655
            const color = new THREE.Color(0xffcc66/*colorCode 3f6d21 362907 d6ffa4*/)
            //const color = this.getRandomGreen()
            colors.push(color.r, color.g, color.b)
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        this.position.set(0, -height / 2, 0)
        this.receiveShadow = true
    }
    getRandomGreen() {
        if (Math.random() < 0.3) return new THREE.Color(1, .8, .4)
        const r = Math.random() * 0.2
        const g = 0.1 + Math.random() * 0.5
        const b = Math.random() * 0.2
        return new THREE.Color(r, g, b)
    }
}