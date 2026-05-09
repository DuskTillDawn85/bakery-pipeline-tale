import { computed, ref } from 'vue'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const OP = {
  INBOX: 'INBOX',
  OUTBOX: 'OUTBOX',
}

export function useLevel1Machine(options) {
  const initialInbox = options?.initialInbox ?? []
  const expectedOutboxCount = initialInbox.length
  const stepDelayMs = options?.stepDelayMs ?? 650

  const inbox = ref([...initialInbox])
  const outbox = ref([])
  const hand = ref(null)

  const steps = ref([])
  const pointer = ref(-1)
  const running = ref(false)
  const errorMessage = ref('')
  const status = ref('idle')
  const result = ref('')
  const resultMessage = ref('')

  const canRun = computed(
    () => steps.value.length > 0 && !running.value && status.value === 'idle',
  )
  const hasError = computed(() => errorMessage.value.length > 0)
  const isFinished = computed(() => status.value === 'finished')

  let nextStepId = 1
  let aborted = false

  function clearResult() {
    result.value = ''
    resultMessage.value = ''
  }

  function reset() {
    running.value = false
    pointer.value = -1
    errorMessage.value = ''
    inbox.value = [...initialInbox]
    outbox.value = []
    hand.value = null
    status.value = 'idle'
    aborted = false
    clearResult()
  }

  function clearProgram() {
    if (running.value) return
    steps.value = []
    pointer.value = -1
    errorMessage.value = ''
    clearResult()
  }

  function addStep(op) {
    if (running.value || status.value !== 'idle') return
    steps.value = [...steps.value, { id: nextStepId++, op }]
  }

  function removeStep(stepId) {
    if (running.value || status.value !== 'idle') return
    steps.value = steps.value.filter((s) => s.id !== stepId)
    if (pointer.value >= steps.value.length) {
      pointer.value = steps.value.length - 1
    }
  }

  function stop() {
    if (!running.value) return
    aborted = true
    running.value = false
  }

  function setError(message) {
    errorMessage.value = message
    running.value = false
    status.value = 'finished'
    result.value = 'fail'
    resultMessage.value = message
  }

  function takeFromInbox() {
    if (inbox.value.length === 0) {
      setError('输入传送带已经空了，无法继续 INBOX')
      return false
    }
    const [next, ...rest] = inbox.value
    inbox.value = rest
    hand.value = next
    return true
  }

  function putToOutbox() {
    if (!hand.value) {
      setError('手里没有原料，无法 OUTBOX')
      return false
    }
    outbox.value = [...outbox.value, hand.value]
    hand.value = null
    return true
  }

  function execute(op) {
    errorMessage.value = ''
    if (op === OP.INBOX) return takeFromInbox()
    if (op === OP.OUTBOX) return putToOutbox()
    setError(`未知指令：${op}`)
    return false
  }

  function evaluate() {
    if (hasError.value) return

    const remainingInboxCount = inbox.value.length
    const holding = Boolean(hand.value)
    const outboxOk = outbox.value.length === expectedOutboxCount

    if (aborted) {
      result.value = 'fail'
      resultMessage.value = '你中途停止了播放，本次运行判定失败。'
      return
    }

    if (remainingInboxCount > 0 || holding || !outboxOk) {
      result.value = 'fail'
      resultMessage.value = `播放结束但仍有原料未处理（输入剩余 ${remainingInboxCount} 个${holding ? '，手里还有 1 个' : ''}）。`
      return
    }

    result.value = 'success'
    resultMessage.value = '恭喜通关：所有原料都被取出并放入输出传送带。'
  }

  async function run() {
    if (running.value) return
    if (steps.value.length === 0) return
    if (status.value !== 'idle') return

    running.value = true
    status.value = 'running'
    aborted = false
    pointer.value = 0
    errorMessage.value = ''
    clearResult()

    while (running.value && pointer.value < steps.value.length) {
      const current = steps.value[pointer.value]
      const ok = execute(current.op)
      if (!ok) return
      await wait(stepDelayMs)
      pointer.value += 1
    }

    running.value = false
    pointer.value = -1
    status.value = 'finished'
    evaluate()
  }

  return {
    OP,
    inbox,
    outbox,
    hand,
    steps,
    pointer,
    running,
    canRun,
    errorMessage,
    hasError,
    status,
    isFinished,
    result,
    resultMessage,
    addStep,
    removeStep,
    clearProgram,
    reset,
    run,
    stop,
  }
}
