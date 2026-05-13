import * as THREE from 'three'
import { createRenderer } from '../core/createRenderer'

function createResizeObserver(container, onResize) {
  const ro = new ResizeObserver(() => {
    const rect = container.getBoundingClientRect()
    const width = Math.max(1, Math.floor(rect.width))
    const height = Math.max(1, Math.floor(rect.height))
    onResize(width, height)
  })
  ro.observe(container)
  return ro
}

export function createGameApp(container, createScene) {
  const renderer = createRenderer(container)
  const timer = new THREE.Timer()
  timer.connect(document)

  const rect = container.getBoundingClientRect()
  let width = Math.max(1, Math.floor(rect.width))
  let height = Math.max(1, Math.floor(rect.height))

  const sceneCtl = createScene({ width, height })
  const scene = sceneCtl.scene
  const camera = sceneCtl.camera

  function render() {
    renderer.render(scene, camera)
  }

  function setSize(nextWidth, nextHeight) {
    width = nextWidth
    height = nextHeight
    renderer.setSize(width, height, false)
    sceneCtl.setSize?.(width, height)
    render()
  }

  const ro = createResizeObserver(container, setSize)
  setSize(width, height)

  let raf = 0
  let running = false

  function tick() {
    if (!running) return
    timer.update()
    const dt = Math.min(timer.getDelta(), 0.05)
    sceneCtl.update?.(dt)
    render()
    raf = requestAnimationFrame(tick)
  }

  function start() {
    if (running) return
    running = true
    timer.update()
    tick()
  }

  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }

  function dispose() {
    stop()
    ro.disconnect()
    sceneCtl.dispose?.()
    timer.disconnect()
    renderer.dispose()
    renderer.domElement?.remove?.()
  }

  return {
    start,
    stop,
    dispose,
    sceneCtl,
  }
}
