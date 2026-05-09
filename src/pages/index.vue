<script setup>
import { useRouter } from 'vue-router'
import landingImage from '~/images/landing.png'

const router = useRouter()

const enterGame = () => {
  router.push('/levels')
}
</script>

<template>
  <div class="w-full h-full cursor-pointer overflow-hidden" @click="enterGame">
    <div class="relative w-full h-full">
      <img :src="landingImage" alt="Bakery Pipeline Tale" class="w-full h-full object-cover">
      <p class="text-2xl text-white absolute top-[82%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-pulse">
        点击任意处开始游戏
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
