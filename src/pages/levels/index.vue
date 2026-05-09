<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const levels = ref([
  { id: 1, name: '第一关：新手上路' },
  { id: 2, name: '第二关：小试牛刀' },
  { id: 3, name: '第三关：渐入佳境' },
  { id: 4, name: '第四关：得心应手' },
  { id: 5, name: '第五关：烘焙大师' },
])

const maxUnlockedLevel = ref(1)

onMounted(() => {
  const saved = localStorage.getItem('bakery-max-level')
  if (saved) {
    maxUnlockedLevel.value = parseInt(saved, 10)
  }
})

const selectLevel = (levelId) => {
  if (levelId <= maxUnlockedLevel.value) {
    router.push(`/play/${levelId}`)
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="levels-page">
    <div class="header">
      <button class="back-btn" @click="goBack">
        返回
      </button>
      <h1 class="title">
        选择关卡
      </h1>
    </div>
    <div class="level-list">
      <div
        v-for="level in levels"
        :key="level.id"
        class="level-item"
        :class="{ locked: level.id > maxUnlockedLevel }"
        @click="selectLevel(level.id)"
      >
        <div class="level-number">
          {{ level.id }}
        </div>
        <div class="level-name">
          {{ level.name }}
        </div>
        <div v-if="level.id > maxUnlockedLevel" class="lock-icon">
          🔒
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.levels-page {
  width: 100%;
  height: 100%;
  background-color: #fff9e6;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
  overflow: hidden;

  .header {
    width: 100%;
    max-width: 600px;
    display: flex;
    align-items: center;
    margin-bottom: 3rem;
    position: relative;

    .back-btn {
      position: absolute;
      left: 0;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      background-color: #ffb347;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #ff9900;
      }
    }

    .title {
      flex: 1;
      text-align: center;
      font-size: 2.5rem;
      color: #8b5a2b;
      margin: 0;
    }
  }

  .level-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 600px;
    flex: 1;
    overflow-y: auto;
    padding-bottom: 2rem;

    .level-item {
      display: flex;
      align-items: center;
      background-color: #fff;
      padding: 1.5rem 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
      }

      &.locked {
        background-color: #f0f0f0;
        cursor: not-allowed;
        opacity: 0.7;

        &:hover {
          transform: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .level-number {
          background-color: #ccc;
        }

        .level-name {
          color: #999;
        }
      }

      .level-number {
        width: 40px;
        height: 40px;
        background-color: #ffb347;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 1.2rem;
        font-weight: bold;
        margin-right: 1.5rem;
      }

      .level-name {
        flex: 1;
        font-size: 1.5rem;
        color: #553311;
        font-weight: 500;
      }

      .lock-icon {
        font-size: 1.5rem;
      }
    }
  }
}
</style>
