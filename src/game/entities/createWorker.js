import * as THREE from 'three'

export function createWorker() {
  const group = new THREE.Group()

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0.05,
  })
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xffe7c4,
    roughness: 0.85,
    metalness: 0.02,
  })

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.6, 16), bodyMat)
  body.position.y = 0.3
  body.castShadow = true
  group.add(body)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 18), headMat)
  head.position.y = 0.78
  head.castShadow = true
  group.add(head)

  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.6,
    metalness: 0.1,
  })
  const eyeGeo = new THREE.SphereGeometry(0.03, 12, 12)
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
  leftEye.position.set(-0.06, 0.82, 0.19)
  group.add(leftEye)
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
  rightEye.position.set(0.06, 0.82, 0.19)
  group.add(rightEye)

  const hand = new THREE.Group()
  hand.position.set(0.32, 0.45, 0.08)
  group.add(hand)

  const state = {
    carrying: null,
    moving: false,
    moveFrom: new THREE.Vector3(),
    moveTo: new THREE.Vector3(),
    moveElapsed: 0,
    moveDuration: 0,
  }

  function setPosition(x, z) {
    group.position.set(x, 0, z)
  }

  function faceTowards(target) {
    const dir = new THREE.Vector3().subVectors(target, group.position)
    dir.y = 0
    if (dir.lengthSq() < 1e-6) return
    const yaw = Math.atan2(dir.x, dir.z)
    group.rotation.y = yaw
  }

  function moveTo(target, duration = 0.55) {
    state.moving = true
    state.moveFrom.copy(group.position)
    state.moveTo.copy(target)
    state.moveElapsed = 0
    state.moveDuration = Math.max(0.01, duration)
    faceTowards(target)
  }

  function update(dt) {
    if (!state.moving) return false
    state.moveElapsed += dt
    const t = Math.min(1, state.moveElapsed / state.moveDuration)
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    group.position.lerpVectors(state.moveFrom, state.moveTo, ease)
    if (t >= 1) {
      state.moving = false
      return true
    }
    return false
  }

  function pick(mesh) {
    if (!mesh) return
    state.carrying = mesh
    hand.add(mesh)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, 0, 0)
  }

  function drop() {
    const mesh = state.carrying
    if (!mesh) return null
    hand.remove(mesh)
    state.carrying = null
    return mesh
  }

  function dispose() {
    body.geometry?.dispose?.()
    body.material?.dispose?.()
    head.geometry?.dispose?.()
    head.material?.dispose?.()
    eyeGeo.dispose?.()
    eyeMat.dispose?.()
  }

  return {
    group,
    hand,
    state,
    setPosition,
    moveTo,
    update,
    pick,
    drop,
    dispose,
  }
}

