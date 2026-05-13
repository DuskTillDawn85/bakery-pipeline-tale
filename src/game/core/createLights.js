import * as THREE from 'three'

export function createRoomLights() {
  const group = new THREE.Group()

  const ambient = new THREE.AmbientLight(0xffffff, 0.35)
  group.add(ambient)

  const hemi = new THREE.HemisphereLight(0xffffff, 0x2c2c2c, 0.45)
  hemi.position.set(0, 3, 0)
  group.add(hemi)

  const dir = new THREE.DirectionalLight(0xffffff, 1.2)
  dir.position.set(2.5, 5.5, 2.5)
  dir.target.position.set(0, 0, 0)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  dir.shadow.camera.near = 0.5
  dir.shadow.camera.far = 20
  dir.shadow.camera.left = -6
  dir.shadow.camera.right = 6
  dir.shadow.camera.top = 6
  dir.shadow.camera.bottom = -6
  group.add(dir)
  group.add(dir.target)

  return group
}
