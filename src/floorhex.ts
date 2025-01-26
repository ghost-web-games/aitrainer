import { gui } from "@Glibs/helper/helper";
import { GhostObject, IPhysicsObject } from "@Glibs/interface/iobject";
import * as THREE from "three";


export class FloorHex extends GhostObject implements IPhysicsObject {
    get BoxPos() {
        const v = this.Pos
        return new THREE.Vector3(v.x, v.y, v.z)
    }
    constructor() {
        const shapedata = {
            width: 1, height: 18
        }
        const shape = new THREE.Shape()
        shape.moveTo(0, 0)
        shape.lineTo(0, shapedata.width)
        shape.lineTo(shapedata.height, shapedata.width)
        shape.lineTo(shapedata.height, 0)
        shape.lineTo(0, 0)

        const data = {
            steps:2, depth: 32, bevelEnabled: true, bevelThickness: 3, bevelSize: 2,
            bevelOffset: 1, bevelSegments: 2
        }

        const geometry = new THREE.ExtrudeGeometry(shape, data)
        const material = new THREE.MeshPhongMaterial({
            color: 0xffcc66, 
            side: THREE.FrontSide
        })
        super(geometry, material)
        const change = () => {
            const shape = new THREE.Shape()
            shape.moveTo(0, 0)
            shape.lineTo(0, shapedata.width)
            shape.lineTo(shapedata.height, shapedata.width)
            shape.lineTo(shapedata.height, 0)
            shape.lineTo(0, 0)

            this.geometry.dispose()
            this.geometry = new THREE.ExtrudeGeometry(shape, data)
        }
        this.position.x = -(shapedata.height / 2)
        this.position.y = -4
        this.position.z = -(data.depth / 2)

        // gui.open()
        // gui.show()
        // gui.add(this.rotation, "x").listen()
        // gui.add(this.rotation, "y").listen()
        // gui.add(this.rotation, "z").listen()
        // gui.add(this.position, "x").listen()
        // gui.add(this.position, "y").listen()
        // gui.add(this.position, "z").listen()

        // gui.add(shapedata, "width").listen().onChange(() => { change() })
        // gui.add(shapedata, "height").listen().onChange(() => { change() })
        // gui.add(data, "steps").listen().onChange(() => { change() })
        // gui.add(data, "depth").listen().onChange(() => { change() })
        // gui.add(data, "bevelThickness").listen().onChange(() => { change() })
        // gui.add(data, "bevelSize").listen().onChange(() => { change() })
        // gui.add(data, "bevelOffset").listen().onChange(() => { change() })
        // gui.add(data, "bevelSegments").listen().onChange(() => { change() })
        // const colors = []
        // const positionAttr = geometry.attributes.position
        // const range = 80
        // for (let i = 0; i < positionAttr.count; i++) {
        //     const x = positionAttr.getX(i)
        //     const z = positionAttr.getY(i)
        //     //const colorCode = (x <= range && x >= -range && z <= range && z >= -range) ? 0xffcc66 : 0xb2c655
        //     const color = new THREE.Color(0xffcc66/*colorCode 3f6d21 362907 d6ffa4*/)
        //     //const color = this.getRandomGreen()
        //     colors.push(color.r, color.g, color.b)
        // }
        // geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        // this.position.set(0, -height / 2, 0)
        // this.scale.x = 2
        // this.scale.z = 2
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