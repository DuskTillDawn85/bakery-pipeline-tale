<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createGameApp } from '~/game/app/createGameApp'
import { createLevel1Scene } from '~/game/scenes/level1/createLevel1Scene'
import { createLevel2Scene } from '~/game/scenes/level2/createLevel2Scene'
import MailroomOverlay from '~/components/game/MailroomOverlay.vue'

const route = useRoute()
const router = useRouter()

const levelId = computed(() => `${route.params.id ?? ''}`)
const levelNumber = computed(() => parseInt(levelId.value, 10))
const levelTitle = computed(() => {
  if (levelNumber.value === 1) return '收发室'
  if (levelNumber.value === 2) return '繁忙的收发室'
  return '关卡'
})

const containerRef = ref(null)
const overlayApiRef = ref(null)
let app = null
let off = null

function getSceneFactory() {
  if (levelNumber.value === 1) return createLevel1Scene
  if (levelNumber.value === 2) return createLevel2Scene
  return null
}

onMounted(() => {
  const factory = getSceneFactory()
  if (!containerRef.value || !factory) return
  Promise.resolve(createGameApp(containerRef.value, factory)).then((created) => {
    app = created
    overlayApiRef.value = app.sceneCtl.api
    off = overlayApiRef.value.onStateChange((s) => {
      if (s.status !== 'finished' || s.result !== 'success') return
      const current = levelNumber.value
      if (!Number.isFinite(current)) return
      const nextUnlocked = Math.min(2, current + 1)
      const saved = localStorage.getItem('bakery-max-level')
      const savedNum = saved ? parseInt(saved, 10) : 1
      const target = Math.max(savedNum, nextUnlocked)
      localStorage.setItem('bakery-max-level', String(target))
    })
    app.start()
  })
})

onBeforeUnmount(() => {
  off?.()
  off = null
  app?.dispose()
  app = null
})

const goBack = () => {
  router.push('/levels')
}
</script>

<template>
  <div class="play">
    <div class="play__layout">
      <div class="play__stage" ref="containerRef"></div>
      <MailroomOverlay
        v-if="overlayApiRef"
        class="play__panel"
        :api="overlayApiRef"
        :title="levelTitle"
        :mission="`目标：把输入传送带上的所有原料搬到输出传送带。`"
      />
    </div>
    <button class="play__back" type="button" @click="goBack">
      返回关卡
    </button>
  </div>
</template>

<style scoped lang="scss">
.play {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: #0f172a;

  .play__layout {
    width: 100%;
    height: 100%;
    display: flex;
    overflow: hidden;
  }

  .play__stage {
    flex: 1;
    height: 100%;
  }

  .play__panel {
    height: 100%;
  }

  .play__back {
    position: absolute;
    top: 14px;
    left: 14px;
    height: 44px;
    padding: 0 1rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(0, 0, 0, 0.35);
    color: rgba(255, 255, 255, 0.92);
    font-weight: 900;
    cursor: pointer;
  }
}
</style>
