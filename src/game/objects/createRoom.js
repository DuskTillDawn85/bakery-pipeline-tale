import * as THREE from 'three'

export function createRoom(options) {
  const roomWidth = options?.roomWidth ?? 6
  const roomDepth = options?.roomDepth ?? 6
  const roomHeight = options?.roomHeight ?? 3

  const group = new THREE.Group()

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xd9c1a0,
    roughness: 0.95,
    metalness: 0,
  })
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xc8a57b,
    roughness: 0.95,
    metalness: 0,
  })

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomDepth),
    floorMat,
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  group.add(floor)

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

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x5b3b21,
    roughness: 0.9,
    metalness: 0,
  })
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth + 0.12, 0.18, roomDepth + 0.12),
    trimMat,
  )
  trim.position.set(0, 0.09, 0)
  trim.receiveShadow = true
  group.add(trim)

  return group
}
