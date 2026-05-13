<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createGameApp } from '~/game/app/createGameApp'
import { createLevel1Scene } from '~/game/scenes/level1/createLevel1Scene'
import Level1Overlay from './level1-overlay.vue'

const containerRef = ref(null)
const overlayApiRef = ref(null)
let app = null

onMounted(() => {
  if (!containerRef.value) return
  app = createGameApp(containerRef.value, createLevel1Scene)
  overlayApiRef.value = app.sceneCtl.api
  app.start()
})

onBeforeUnmount(() => {
  app?.dispose()
  app = null
})
</script>

<template>
  <div class="three-page">
    <div class="three-page__stage" ref="containerRef"></div>
    <Level1Overlay v-if="overlayApiRef" class="three-page__overlay" :api="overlayApiRef" />
  </div>
</template>

<style scoped lang="scss">
.three-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #0f172a;
  position: relative;

  .three-page__stage {
    width: 100%;
    height: 100%;
  }

  .three-page__overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
}
</style>
