<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const levelId = route.params.id;

const goBack = () => {
  router.push('/levels')
}
</script>

<template>
  <div class="play-page">
    <div class="header">
      <button class="back-btn" @click="goBack">
        返回关卡选择
      </button>
      <h2 class="level-title">
        当前关卡：{{ levelId }}
      </h2>
    </div>
    
    <div class="room-container">
      <div class="wall">
        <div class="window"></div>
        <div class="clock"></div>
      </div>
      
      <div class="floor">
        <div class="conveyor-belt left-belt">
          <div class="belt-track">
            <div class="belt-item item-1"></div>
            <div class="belt-item item-2"></div>
            <div class="belt-item item-3"></div>
          </div>
          <div class="belt-label">输入传送带</div>
        </div>
        
        <div class="work-area">
          <div class="table">
            <div class="tools"></div>
          </div>
          <div class="work-label">加工台</div>
        </div>
        
        <div class="conveyor-belt right-belt">
          <div class="belt-track">
          </div>
          <div class="belt-label">输出传送带</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.play-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5e6d3;
  overflow: hidden;

  .header {
    height: 60px;
    background-color: #8b5a2b;
    display: flex;
    align-items: center;
    padding: 0 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 10;

    .back-btn {
      padding: 0.5rem 1rem;
      background-color: #ffb347;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;

      &:hover {
        background-color: #ff9900;
      }
    }

    .level-title {
      flex: 1;
      text-align: center;
      color: #fff;
      margin: 0;
      font-size: 1.5rem;
    }
  }

  .room-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;

    .wall {
      height: 40%;
      background-color: #e8d0a9;
      border-bottom: 8px solid #c4a47c;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      .window {
        width: 300px;
        height: 150px;
        background-color: #aeeeee;
        border: 10px solid #8b5a2b;
        border-radius: 8px;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          width: 8px;
          height: 100%;
          background-color: #8b5a2b;
          transform: translateX(-50%);
        }

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 8px;
          background-color: #8b5a2b;
          transform: translateY(-50%);
        }
      }

      .clock {
        position: absolute;
        top: 30px;
        right: 100px;
        width: 60px;
        height: 60px;
        background-color: #fff;
        border: 6px solid #8b5a2b;
        border-radius: 50%;

        &::after {
          content: '';
          position: absolute;
          top: 25px;
          left: 25px;
          width: 20px;
          height: 4px;
          background-color: #333;
          transform-origin: left center;
          transform: rotate(-45deg);
        }
      }
    }

    .floor {
      height: 60%;
      background-color: #dcb388;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 5%;
      padding-bottom: 5%;

      .conveyor-belt {
        width: 25%;
        height: 60%;
        background-color: #7a8b99;
        border: 4px solid #4a5a6a;
        border-radius: 8px;
        position: relative;
        display: flex;
        justify-content: center;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);

        .belt-track {
          width: 80%;
          height: 100%;
          background-color: #2c3e50;
          position: relative;
          overflow: hidden;
          background-image: repeating-linear-gradient(
            0deg,
            #2c3e50,
            #2c3e50 20px,
            #34495e 20px,
            #34495e 40px
          );

          .belt-item {
            width: 60px;
            height: 60px;
            background-color: #f39c12;
            border-radius: 50%;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.2);

            &.item-1 {
              top: 10%;
            }

            &.item-2 {
              top: 40%;
            }

            &.item-3 {
              top: 70%;
            }
          }
        }

        .belt-label {
          position: absolute;
          bottom: -40px;
          background-color: #8b5a2b;
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: bold;
        }
      }

      .left-belt {
        .belt-track {
          animation: belt-move-down 2s linear infinite;
        }
      }

      .right-belt {
        .belt-track {
          animation: belt-move-up 2s linear infinite;
        }
      }

      .work-area {
        width: 40%;
        height: 50%;
        position: relative;
        display: flex;
        justify-content: center;

        .table {
          width: 80%;
          height: 100%;
          background-color: #a0522d;
          border-radius: 8px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: -20px;
            left: -5%;
            width: 110%;
            height: 40px;
            background-color: #cd853f;
            border-radius: 8px;
          }

          .tools {
            position: absolute;
            top: -10px;
            left: 20%;
            width: 40px;
            height: 20px;
            background-color: #bdc3c7;
            border-radius: 4px;
          }
        }

        .work-label {
          position: absolute;
          bottom: -40px;
          background-color: #8b5a2b;
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: bold;
        }
      }
    }
  }
}

@keyframes belt-move-down {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 40px;
  }
}

@keyframes belt-move-up {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 -40px;
  }
}
</style>
