import { Container, Graphics, Text } from 'pixi.js'
import { createConveyorBelt } from '../../entities/createConveyorBelt'
import { createWorker } from '../../entities/createWorker'
import { createEmitter } from '../../utils/createEmitter'
import { OP } from '../../logic/ops'

function createText(text, style) {
  try {
    return new Text(text, style)
  } catch {
    return new Text({ text, style })
  }
}

export function createMailroomScene(ctx, config) {
  const roomWidth = 8
  const roomDepth = 8

  const beltDepth = 5.2
  const beltWidth = 0.5
  const beltCapacity = 10

  const inboxX = -1.5
  const outboxX = 1.0
  const beltY = 0
  const moveDuration = 0.55

  const inboxItems = config?.inboxItems ?? []
  const expectedOutCount = inboxItems.length
  const availableOps =
    config?.availableOps ??
    [
      { op: OP.INBOX, title: 'INBOX', desc: '取原料（从输入传送带拿一个）' },
      { op: OP.OUTBOX, title: 'OUTBOX', desc: '放成品（把手里的原料放到输出带）' },
    ]

  const emitter = createEmitter()
  const root = new Container()
  const world = new Container()
  root.addChild(world)
  ctx.app.stage.addChild(root)

  function updateViewSize(width, height) {
    const margin = 48
    const usableW = Math.max(1, width - margin * 2)
    const usableH = Math.max(1, height - margin * 2)
    const scale = Math.min(usableW / roomWidth, usableH / roomDepth)
    world.scale.set(scale)
    world.position.set(width / 2, height / 2)
  }

  updateViewSize(ctx.width, ctx.height)

  const background = new Graphics()
  background.beginFill(0xf3e6d3, 1)
  background.lineStyle(0.06, 0x000000, 0.18)
  background.drawRoundedRect(-roomWidth / 2, -roomDepth / 2, roomWidth, roomDepth, 0.35)
  background.endFill()
  world.addChild(background)

  const inboxBelt = createConveyorBelt({
    width: beltWidth,
    depth: beltDepth,
    color: 0xb37d4a,
    itemCapacity: beltCapacity,
  })
  inboxBelt.setPosition(inboxX, beltY)
  world.addChild(inboxBelt.container)

  const outboxBelt = createConveyorBelt({
    width: beltWidth,
    depth: beltDepth,
    color: 0xb37d4a,
    itemCapacity: beltCapacity,
  })
  outboxBelt.setPosition(outboxX, beltY)
  world.addChild(outboxBelt.container)

  const worker = createWorker()
  worker.setPosition(0, 0)
  world.addChild(worker.container)

  const hud = new Container()
  root.addChild(hud)

  const hudStyle = {
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto',
    fontSize: 14,
    fontWeight: '900',
    fill: 0x111827,
  }

  const inboxLabel = createText('', hudStyle)
  inboxLabel.anchor?.set?.(0.5)
  hud.addChild(inboxLabel)

  const outboxLabel = createText('', hudStyle)
  outboxLabel.anchor?.set?.(0.5)
  hud.addChild(outboxLabel)

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

  function refreshHud() {
    const s = world.scale.x || 1
    inboxLabel.text = `INBOX ${state.inboxCount}/${expectedOutCount}`
    outboxLabel.text = `OUTBOX ${state.outboxCount}/${expectedOutCount}`

    inboxLabel.position.set(world.position.x + inboxX * s, world.position.y + (-beltDepth / 2 - 0.7) * s)
    outboxLabel.position.set(world.position.x + outboxX * s, world.position.y + (-beltDepth / 2 - 0.7) * s)
  }

  function updateState(partial) {
    Object.assign(state, partial)
    emitter.emit({ ...state })
    refreshHud()
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
      dropped?.gfx?.destroy?.()
    }
    inboxBelt.setItems(inboxItems)
    outboxBelt.setItems([])
    worker.setPosition(0, 0)
  }

  function setFail(message) {
    updateState({
      status: 'finished',
      result: 'fail',
      message,
      pointer: -1,
      carryingName: worker.state.carrying?.item?.name ?? '',
      inboxCount: inboxBelt.state.items.length,
      outboxCount: outboxBelt.state.items.length,
    })
  }

  function setSuccess(message) {
    updateState({
      status: 'finished',
      result: 'success',
      message,
      pointer: -1,
      carryingName: '',
      inboxCount: 0,
      outboxCount: expectedOutCount,
    })
  }

  function moveWorkerTo(target, duration = moveDuration) {
    return worker.moveTo(target, duration)
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

    const pickup = inboxBelt.getPickupPoint({ x: 0, y: 0 })
    await moveWorkerTo({ x: pickup.x - 0.1, y: pickup.y })

    const taken = inboxBelt.takeNext()
    if (!taken) {
      setFail('输入传送带已经空了，无法继续 INBOX')
      return false
    }

    worker.pick(taken)
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

    const drop = outboxBelt.getDropPoint({ x: 0, y: 0 })
    await moveWorkerTo({ x: drop.x + 0.1, y: drop.y })

    const taken = worker.drop()
    if (!taken) {
      setFail('手里没有原料，无法 OUTBOX')
      return false
    }

    const ok = outboxBelt.put(taken)
    if (!ok) {
      taken.gfx?.destroy?.()
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

    setSuccess(config?.successMessage ?? '恭喜通关！')
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
    updateViewSize(width, height)
    refreshHud()
  }

  function update(dt) {
    worker.update(dt)
  }

  function dispose() {
    inboxBelt.dispose()
    outboxBelt.dispose()
    worker.dispose()
    ctx.app.stage.removeChild(root)
    root.destroy({ children: true })
  }

  const api = {
    OP,
    availableOps,
    onStateChange: emitter.on,
    getState: () => ({ ...state }),
    reset,
    play,
  }

  return {
    setSize,
    update,
    dispose,
    api,
  }
}
