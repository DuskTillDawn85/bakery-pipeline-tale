import * as THREE from 'three'
import aoUrl from '../../assets/texture/brick_wall/Brick_Wall_028_ambientOcclusion.webp'
import baseColorUrl from '../../assets/texture/brick_wall/Brick_Wall_028_basecolor.webp'
import heightUrl from '../../assets/texture/brick_wall/Brick_Wall_028_height.webp'
import normalUrl from '../../assets/texture/brick_wall/Brick_Wall_028_normal.webp'
import roughnessUrl from '../../assets/texture/brick_wall/Brick_Wall_028_roughness.webp'

let brickWallTextureSet = null

function ensureUv2(geometry) {
  const uv = geometry.attributes.uv
  if (!uv) return
  if (geometry.attributes.uv2) return
  geometry.setAttribute('uv2', new THREE.BufferAttribute(uv.array, 2))
}

function configureRepeatingTexture(texture, repeatX, repeatY, isColor) {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  if (isColor && 'colorSpace' in texture) texture.colorSpace = THREE.SRGBColorSpace
}

function getBrickWallTextureSet() {
  if (brickWallTextureSet) return brickWallTextureSet
  const loader = new THREE.TextureLoader()
  brickWallTextureSet = {
    baseColor: loader.load(baseColorUrl),
    ao: loader.load(aoUrl),
    normal: loader.load(normalUrl),
    roughness: loader.load(roughnessUrl),
    height: loader.load(heightUrl),
  }
  return brickWallTextureSet
}

export function createRoom(options) {
  const roomWidth = options?.roomWidth ?? 6
  const roomDepth = options?.roomDepth ?? 6
  const roomHeight = options?.roomHeight ?? 3

  const group = new THREE.Group()

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xd9c1a0,
    aoMapIntensity: 1.0,
    normalScale: new THREE.Vector2(0.9, 0.9),
    roughness: 1.0,
    metalness: 0.0,
  })
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xc8a57b,
    roughness: 0.95,
    metalness: 0,
  })

  const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth, 1, 1)
  ensureUv2(floorGeo)
  const floor = new THREE.Mesh(
    floorGeo,
    floorMat,
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  group.add(floor)

  const repeatX = Math.max(1, Math.round(roomWidth))
  const repeatY = Math.max(1, Math.round(roomDepth))

  const tex = getBrickWallTextureSet()
  configureRepeatingTexture(tex.baseColor, repeatX, repeatY, true)
  configureRepeatingTexture(tex.ao, repeatX, repeatY, false)
  configureRepeatingTexture(tex.normal, repeatX, repeatY, false)
  configureRepeatingTexture(tex.roughness, repeatX, repeatY, false)
  configureRepeatingTexture(tex.height, repeatX, repeatY, false)

  floorMat.color.setHex(0xffffff)
  floorMat.map = tex.baseColor
  floorMat.aoMap = tex.ao
  floorMat.normalMap = tex.normal
  floorMat.roughnessMap = tex.roughness
  floorMat.bumpMap = tex.height
  floorMat.bumpScale = 0.08
  floorMat.needsUpdate = true

  const wallGeoW = new THREE.PlaneGeometry(roomWidth, roomHeight)
  const wallGeoD = new THREE.PlaneGeometry(roomDepth, roomHeight)

  const backWall = new THREE.Mesh(wallGeoW, wallMat)
  backWall.position.set(0, roomHeight / 2, -roomDepth / 2)
  group.add(backWall)

  const frontWall = new THREE.Mesh(wallGeoW, wallMat)
  frontWall.position.set(0, roomHeight / 2, roomDepth / 2)
  frontWall.rotation.y = Math.PI
  group.add(frontWall)

  const leftWall = new THREE.Mesh(wallGeoD, wallMat)
  leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0)
  leftWall.rotation.y = Math.PI / 2
  group.add(leftWall)

  const rightWall = new THREE.Mesh(wallGeoD, wallMat)
  rightWall.position.set(roomWidth / 2, roomHeight / 2, 0)
  rightWall.rotation.y = -Math.PI / 2
  group.add(rightWall)

  return group
}
