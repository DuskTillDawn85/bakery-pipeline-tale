import * as THREE from 'three'

function createItemMesh(item) {
  const geo = new THREE.BoxGeometry(0.38, 0.22, 0.38)
  const mat = new THREE.MeshStandardMaterial({
    color: item.color ?? 0xffffff,
    roughness: 0.7,
    metalness: 0.05,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.userData.item = item
  return mesh
}

export function createConveyorBelt(options) {
  const width = options?.width ?? 0.9
  const depth = options?.depth ?? 4.2
  const height = options?.height ?? 0.25
  const color = options?.color ?? 0x56311b
  const itemCapacity = options?.itemCapacity ?? 6

  const group = new THREE.Group()

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.75,
      metalness: 0.1,
    }),
  )
  base.position.y = height / 2
  base.receiveShadow = true
  group.add(base)

  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.06, depth + 0.06),
    new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.2,
    }),
  )
  rail.position.y = height + 0.03
  rail.receiveShadow = true
  group.add(rail)

  const itemsGroup = new THREE.Group()
  itemsGroup.position.y = height + 0.12
  group.add(itemsGroup)

  const slots = []
  const padding = 0.35
  for (let i = 0; i < itemCapacity; i += 1) {
    const t = itemCapacity === 1 ? 0.5 : i / (itemCapacity - 1)
    const z = THREE.MathUtils.lerp(-depth / 2 + padding, depth / 2 - padding, t)
    slots.push(new THREE.Vector3(0, 0, z))
  }

  const state = {
    items: [],
    meshes: [],
  }

  function layout() {
    state.meshes.forEach((mesh, idx) => {
      const p = slots[Math.min(idx, slots.length - 1)]
      mesh.position.set(p.x, p.y, p.z)
    })
  }

  function setItems(items) {
    clear()
    items.forEach((item) => {
      const mesh = createItemMesh(item)
      itemsGroup.add(mesh)
      state.items.push(item)
      state.meshes.push(mesh)
    })
    layout()
  }

  function clear() {
    state.meshes.forEach((m) => {
      itemsGroup.remove(m)
      m.geometry?.dispose?.()
      m.material?.dispose?.()
    })
    state.items = []
    state.meshes = []
  }

  function takeNext() {
    if (state.items.length === 0) return null
    const item = state.items.shift()
    const mesh = state.meshes.shift()
    itemsGroup.remove(mesh)
    layout()
    return { item, mesh }
  }

  function put(mesh) {
    if (state.items.length >= itemCapacity) return false
    const item = mesh.userData.item
    state.items.push(item)
    state.meshes.push(mesh)
    itemsGroup.add(mesh)
    layout()
    return true
  }

  function getPickupPoint(target = new THREE.Vector3()) {
    const p = slots[0] ?? new THREE.Vector3()
    target.copy(p)
    target.applyMatrix4(group.matrixWorld)
    target.x += 0.65
    target.y = 0
    return target
  }

  function getDropPoint(target = new THREE.Vector3()) {
    const idx = Math.min(state.items.length, slots.length - 1)
    const p = slots[idx] ?? new THREE.Vector3()
    target.copy(p)
    target.applyMatrix4(group.matrixWorld)
    target.x -= 0.65
    target.y = 0
    return target
  }

  function dispose() {
    clear()
    base.geometry?.dispose?.()
    base.material?.dispose?.()
    rail.geometry?.dispose?.()
    rail.material?.dispose?.()
  }

  return {
    group,
    state,
    setItems,
    takeNext,
    put,
    getPickupPoint,
    getDropPoint,
    dispose,
  }
}
