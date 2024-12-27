import * as THREE from "three";
import { GhostObject } from "@Glibs/interface/iobject";

export class Floor extends GhostObject {
    constructor(width: number) {
        width *= 10
        
        const geometry = new THREE.PlaneGeometry(width, width, 100, 100)
        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            //color: 0x228b22, 
            side: THREE.DoubleSide,
        })
        super(geometry, material)
        this.rotateX(-Math.PI / 2)

        const colors = []
        const positionAttr = geometry.attributes.position
        const range = 80
        for (let i = 0; i < positionAttr.count; i++) {
            const x = positionAttr.getX(i)
            const z = positionAttr.getY(i)
            const colorCode =
                (x <= range
                    && x >= -range && z <= range
                    && z >= -range) ? 0xA6C954/*0xffcc66*/ : 0xb2c655
            const color = new THREE.Color(colorCode)
            //const color = this.getRandomGreen()
            colors.push(color.r, color.g, color.b)
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        this.position.set(0, 0, 0)
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
