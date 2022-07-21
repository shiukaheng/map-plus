// ThreeJS object that displays image using PlaneGeometry and MeshBasicMaterial

import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, sRGBEncoding, TextureLoader } from "three"

const loader = new TextureLoader()

async function loadImage(url: string) {
    const texture = await loader.load(url)
    texture.encoding = sRGBEncoding
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)
    return texture
}