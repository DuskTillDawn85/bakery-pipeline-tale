import * as THREE from 'three'
import { createTopDownRoomCamera } from '../../core/createCamera'
import { createRoomLights } from '../../core/createLights'
import { createRoom } from '../../objects/createRoom'
import { createConveyorBelt } from '../../entities/createConveyorBelt'
import { createWorker } from '../../entities/createWorker'
import { createEmitter } from '../../utils/createEmitter'
import { createLevel2InboxItems } from '../../levels/level2/level2Items'
import { OP } from '../../logic/ops'

function disposeScene(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return
    obj.geometry?.dispose?.()
    const mat = obj.material
    if (Array.isArray(mat)) {
      mat.forEach((m) => m?.dispose?.())
    } else {
      mat?.dispose?.()
    }
  })
}

export function createLevel2Scene(ctx) {
  const roomWidth = 9
  const roomDepth = 9
  const roomHeight = 3.2
  const moveDuration = 0.42

  const emitter = createEmitter()
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f172a)

  const cameraCtl = createTopDownRoomCamera({
    width: ctx.width,
    height: ctx.height,
    roomWidth,
    roomDepth,
    roomHeight,
  })

  const lights = createRoomLights()
  scene.add(lights)

  const room = createRoom({ roomWidth, roomDepth, roomHeight })
  scene.add(room)

  const initialInbox = createLevel2InboxItems()
  const expectedOutCount = initialInbox.length

  const beltDepth = 6.4
  const inboxBelt = createConveyorBelt({
    width: 1.1,
    depth: beltDepth,
    height: 0.28,
    color: 0x1f2937,
    itemCapacity: expectedOutCount,
  })
  inboxBelt.group.position.set(-3.25, 0, 0)
  scene.add(inboxBelt.group)

  const outboxBelt = createConveyorBelt({
    width: 1.1,
    depth: beltDepth,
    height: 0.28,
    color: 0x111827,
    itemCapacity: expectedOutCount,
  })
  outboxBelt.group.position.set(3.25, 0, 0)
  scene.add(outboxBelt.group)

  const worker = createWorker()
  worker.setPosition(0, 0)
  scene.add(worker.group)

  const state = {
    status: 'idle',
    pointer: -1,
    result: '',
    message: '',
    expectedOutCount,
    inboxCount: expectedOutCount,
    outboxCount: 0,
    carryingName: '',
  }

  let moveResolve = null

  function updateState(partial) {
    Object.assign(state, partial)
    emitter.emit({ ...state })
  }

  function reset() {
    updateState({
      status: 'idle',
      pointer: -1,
      result: '',
      message: '',
      inboxCount: expectedOutCount,
      outboxCount: 0,
      carryingName: '',
    })

    if (worker.state.carrying) {
      const dropped = worker.drop()
      dropped.geometry?.dispose?.()
      dropped.material?.dispose?.()
    }
    inboxBelt.setItems(initialInbox)
    outboxBelt.setItems([])
    worker.setPosition(0, 0)
  }

  function setFail(message) {
    updateState({
      status: 'finished',
      result: 'fail',
      message,
      pointer: -1,
      carryingName: worker.state.carrying?.userData?.item?.name ?? '',
      inboxCount: inboxBelt.state.items.length,
      outboxCount: outboxBelt.state.items.length,
    })
  }

  function setSuccess() {
    updateState({
      status: 'finished',
      result: 'success',
      message: '恭喜通关：你成功处理了更繁忙的收发室。',
      pointer: -1,
      carryingName: '',
      inboxCount: 0,
      outboxCount: expectedOutCount,
    })
  }

  function moveWorkerTo(target, duration = moveDuration) {
    return new Promise((resolve) => {
      moveResolve = resolve
      worker.moveTo(target, duration)
    })
  }

  async function doInbox() {
    if (worker.state.carrying) {
      setFail('手里已经拿着东西了，无法继续 INBOX')
      return false
    }
    if (inboxBelt.state.items.length === 0) {
      setFail('输入传送带已经空了，无法继续 INBOX')
      return false
    }

    const pickup = inboxBelt.getPickupPoint(new THREE.Vector3())
    pickup.x -= 0.45
    await moveWorkerTo(pickup)

    const taken = inboxBelt.takeNext()
    if (!taken) {
      setFail('输入传送带已经空了，无法继续 INBOX')
      return false
    }

    worker.pick(taken.mesh)
    updateState({
      carryingName: taken.item.name,
      inboxCount: inboxBelt.state.items.length,
    })
    return true
  }

  async function doOutbox() {
    if (!worker.state.carrying) {
      setFail('手里没有原料，无法 OUTBOX')
      return false
    }

    const drop = outboxBelt.getDropPoint(new THREE.Vector3())
    drop.x += 0.45
    await moveWorkerTo(drop)

    const mesh = worker.drop()
    if (!mesh) {
      setFail('手里没有原料，无法 OUTBOX')
      return false
    }

    const ok = outboxBelt.put(mesh)
    if (!ok) {
      mesh.geometry?.dispose?.()
      mesh.material?.dispose?.()
      setFail('输出传送带已满，无法继续 OUTBOX')
      return false
    }

    updateState({
      carryingName: '',
      outboxCount: outboxBelt.state.items.length,
    })
    return true
  }

  function evaluateAfterRun() {
    const inboxRemaining = inboxBelt.state.items.length
    const outCount = outboxBelt.state.items.length
    const holding = Boolean(worker.state.carrying)

    if (inboxRemaining > 0 || holding || outCount !== expectedOutCount) {
      const holdingText = holding ? '，手里还有 1 个' : ''
      setFail(`播放结束但仍有原料未处理（输入剩余 ${inboxRemaining} 个${holdingText}）。`)
      return
    }

    setSuccess()
  }

  async function play(programOps) {
    if (state.status !== 'idle') return
    if (!Array.isArray(programOps) || programOps.length === 0) return

    updateState({
      status: 'running',
      pointer: 0,
      result: '',
      message: '',
    })

    for (let i = 0; i < programOps.length; i += 1) {
      updateState({ pointer: i })
      const op = programOps[i]
      if (op === OP.INBOX) {
        const ok = await doInbox()
        if (!ok) return
      } else if (op === OP.OUTBOX) {
        const ok = await doOutbox()
        if (!ok) return
      } else {
        setFail(`未知指令：${op}`)
        return
      }
    }

    evaluateAfterRun()
  }

  reset()

  function setSize(width, height) {
    cameraCtl.updateAspect(width, height)
  }

  function update(dt) {
    const moveDone = worker.update(dt)
    if (moveDone && moveResolve) {
      const resolve = moveResolve
      moveResolve = null
      resolve()
    }
  }

  function dispose() {
    inboxBelt.dispose()
    outboxBelt.dispose()
    worker.dispose()
    disposeScene(scene)
  }

  const api = {
    OP,
    onStateChange: emitter.on,
    getState: () => ({ ...state }),
    reset,
    play,
  }

  return {
    scene,
    camera: cameraCtl.camera,
    setSize,
    update,
    dispose,
    api,
  }
}

