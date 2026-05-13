import * as THREE from 'three'

export function createRoomLights(options) {
  const roomWidth = options?.roomWidth ?? 8
  const roomDepth = options?.roomDepth ?? 8
  const roomHeight = options?.roomHeight ?? 3.2

  const group = new THREE.Group()

  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  group.add(ambient)

  const hemi = new THREE.HemisphereLight(0xffffff, 0x3b2f2f, 0.75)
  hemi.position.set(0, roomHeight + 0.5, 0)
  group.add(hemi)

  const dir = new THREE.DirectionalLight(0xffffff, 1.4)
  dir.position.set(2.8, roomHeight + 2.2, 2.8)
  dir.target.position.set(0, 0, 0)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  dir.shadow.camera.near = 0.5
  dir.shadow.camera.far = 20
  dir.shadow.camera.left = -roomWidth
  dir.shadow.camera.right = roomWidth
  dir.shadow.camera.top = roomDepth
  dir.shadow.camera.bottom = -roomDepth
  group.add(dir)
  group.add(dir.target)

  const ceilingLightA = new THREE.PointLight(0xfff2d6, 0.9, 30, 2)
  ceilingLightA.position.set(-roomWidth * 0.18, roomHeight - 0.2, 0)
  group.add(ceilingLightA)

  const ceilingLightB = new THREE.PointLight(0xfff2d6, 0.75, 30, 2)
  ceilingLightB.position.set(roomWidth * 0.18, roomHeight - 0.2, 0)
  group.add(ceilingLightB)

  return group
}
