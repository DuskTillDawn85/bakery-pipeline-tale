import * as THREE from 'three'

export function createTopDownRoomCamera(options) {
  const width = options?.width ?? 1
  const height = options?.height ?? 1
  const roomWidth = options?.roomWidth ?? 6
  const roomDepth = options?.roomDepth ?? 6
  const roomHeight = options?.roomHeight ?? 3

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)

  const y = roomHeight * 0.95
  const z = roomDepth * 0.55
  camera.position.set(0, y, z)
  camera.lookAt(0, 1, 0)
  camera.updateProjectionMatrix()

  return {
    camera,
    updateAspect(nextWidth, nextHeight) {
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
    },
  }
}
