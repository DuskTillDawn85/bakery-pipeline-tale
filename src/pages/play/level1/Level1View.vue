<script setup>
import { computed } from 'vue'
import { OP, useLevel1Machine } from './useLevel1Machine'

const INBOX_ITEMS = [
  { id: 'bread-1', name: '面包坯' },
  { id: 'cream-1', name: '奶油' },
  { id: 'strawberry-1', name: '草莓' },
  { id: 'bread-2', name: '面包坯' },
  { id: 'cream-2', name: '奶油' },
  { id: 'strawberry-2', name: '草莓' },
]

const machine = useLevel1Machine({
  initialInbox: INBOX_ITEMS,
  stepDelayMs: 650,
})

const availableOps = [
  { op: OP.INBOX, title: 'INBOX', desc: '取原料（从输入传送带拿一个）' },
  { op: OP.OUTBOX, title: 'OUTBOX', desc: '放成品（把手里的原料放到输出带）' },
]

const outboxCount = computed(() => machine.outbox.value.length)
const playButtonText = computed(() => {
  if (machine.isFinished.value) return '已播放'
  if (machine.running.value) return '播放中'
  return '播放'
})

function onDragStartCard(e, op) {
  e.dataTransfer?.setData('text/plain', op)
  e.dataTransfer?.setData('application/x-bakery-op', op)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy'
}

function readDroppedOp(e) {
  const op =
    e.dataTransfer?.getData('application/x-bakery-op') ||
    e.dataTransfer?.getData('text/plain') ||
    ''
  return op?.toUpperCase?.() ?? ''
}

function onDropToProgram(e) {
  const op = readDroppedOp(e)
  if (op === OP.INBOX || op === OP.OUTBOX) {
    machine.addStep(op)
  }
}

function addByClick(op) {
  machine.addStep(op)
}

function startRun() {
  machine.run()
}

function formatStepLabel(op) {
  if (op === OP.INBOX) return 'INBOX（取原料）'
  if (op === OP.OUTBOX) return 'OUTBOX（放到出餐口）'
  return op
}
</script>

<template>
  <div class="level1">
    <div class="level1__game">
      <div class="game__room">
        <div class="room__ceiling">
          <div class="ceiling__lights">
            <div class="light"></div>
            <div class="light"></div>
            <div class="light"></div>
            <div class="light"></div>
          </div>
        </div>

        <div class="room__floor">
          <div class="belt belt--inbox">
            <div class="belt__badge">
              IN
            </div>
            <div class="belt__track">
              <div
                v-for="item in machine.inbox.value"
                :key="item.id"
                class="belt__item"
              >
                {{ item.name }}
              </div>
            </div>
            <div class="belt__label">
              输入
            </div>
          </div>

          <div class="room__center">
            <div class="chef">
              <div class="chef__head"></div>
              <div class="chef__body"></div>
              <div class="chef__eye chef__eye--left"></div>
              <div class="chef__eye chef__eye--right"></div>
            </div>

            <div class="hand">
              <div class="hand__title">
                手里
              </div>
              <div class="hand__slot" :class="{ 'is-empty': !machine.hand.value }">
                {{ machine.hand.value ? machine.hand.value.name : '空' }}
              </div>
            </div>
          </div>

          <div class="belt belt--outbox">
            <div class="belt__badge">
              OUT
            </div>
            <div class="belt__track">
              <div
                v-for="item in machine.outbox.value"
                :key="item.id"
                class="belt__item"
              >
                {{ item.name }}
              </div>
            </div>
            <div class="belt__label">
              输出（{{ outboxCount }}/6）
            </div>
          </div>
        </div>
      </div>

      <div class="game__panel">
        <div class="panel__header">
          收发室
        </div>
        <div class="panel__body">
          <div class="panel__tip">
            将命令拖动到此区域来编写程序。
          </div>
          <div class="panel__mission">
            你的程序要告诉你的工人：取出 INBOX 中的每件东西，然后放到 OUTBOX 中。
          </div>

          <div class="panel__palette">
            <div class="palette__title">
              指令卡片
            </div>
            <div class="palette__list">
              <button
                v-for="card in availableOps"
                :key="card.op"
                class="palette__item"
                type="button"
                draggable="true"
                :disabled="machine.running.value || machine.isFinished.value"
                @dragstart="(e) => onDragStartCard(e, card.op)"
                @click="addByClick(card.op)"
              >
                <div
                  class="cmd-card"
                  :class="{
                    'cmd-card--inbox': card.op === OP.INBOX,
                    'cmd-card--outbox': card.op === OP.OUTBOX,
                  }"
                >
                  {{ card.op.toLowerCase() }}
                </div>
                <div class="palette__desc">
                  {{ card.desc }}
                </div>
              </button>
            </div>
          </div>

          <div
            class="panel__program"
            @dragover.prevent
            @drop.prevent="onDropToProgram"
          >
            <div v-if="machine.steps.value.length === 0" class="program__empty">
              把 INBOX / OUTBOX 拖进来
            </div>

            <div v-else class="program__list">
              <div
                v-for="(step, index) in machine.steps.value"
                :key="step.id"
                class="program__row"
                :class="{
                  'is-active':
                    machine.running.value && machine.pointer.value === index,
                }"
              >
                <div class="row__no">
                  {{ String(index + 1).padStart(2, '0') }}
                </div>
                <div class="row__cmd">
                  <div
                    class="cmd-card"
                    :class="{
                      'cmd-card--inbox': step.op === OP.INBOX,
                      'cmd-card--outbox': step.op === OP.OUTBOX,
                    }"
                  >
                    {{ step.op.toLowerCase() }}
                  </div>
                </div>
                <button
                  class="row__remove"
                  type="button"
                  :disabled="machine.running.value || machine.isFinished.value"
                  @click="machine.removeStep(step.id)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="machine.isFinished.value"
            class="panel__result"
            :class="{
              'is-success': machine.result.value === 'success',
              'is-fail': machine.result.value === 'fail',
            }"
          >
            {{ machine.resultMessage.value }}
          </div>
        </div>
      </div>
    </div>

    <div class="level1__controls">
      <div class="controls__group">
        <button
          class="tool tool--play"
          type="button"
          :disabled="!machine.canRun.value"
          @click="startRun"
        >
          <span class="tool__triangle"></span>
          <span class="tool__title">{{ playButtonText }}</span>
        </button>
        <button
          class="tool tool--reset"
          type="button"
          :disabled="machine.running.value"
          @click="machine.reset"
        >
          重置
        </button>
        <button
          class="tool tool--clear"
          type="button"
          :disabled="machine.running.value || machine.isFinished.value"
          @click="machine.clearProgram"
        >
          清空
        </button>
      </div>

      <div class="controls__group controls__group--status">
        <div class="status">
          <div class="status__label">
            状态
          </div>
          <div class="status__value">
            {{ machine.isFinished.value ? '已播放' : machine.running.value ? '播放中' : '待机' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.level1 {
  width: 100%;
  height: 100%;
  background: linear-gradient(#ecd7b7, #d8b68f);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .level1__game {
    flex: 1;
    display: flex;
    overflow: hidden;

    .game__room {
      flex: 1;
      position: relative;
      background: linear-gradient(#caa680, #b48d63);
      border-right: 8px solid rgba(0, 0, 0, 0.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .room__ceiling {
        height: 22%;
        background: linear-gradient(#d9c1a0, #cdb38f);
        display: flex;
        align-items: center;
        justify-content: center;

        .ceiling__lights {
          width: 56%;
          height: 65%;
          border-radius: 12px;
          background-color: rgba(255, 255, 255, 0.18);
          border: 2px solid rgba(0, 0, 0, 0.12);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          padding: 0.6rem;

          .light {
            border-radius: 10px;
            background: radial-gradient(
              circle at 30% 30%,
              rgba(255, 255, 255, 0.95),
              rgba(255, 255, 255, 0.35)
            );
            border: 1px solid rgba(0, 0, 0, 0.12);
          }
        }
      }

      .room__floor {
        flex: 1;
        background: linear-gradient(#d8b68f, #cba77e);
        display: grid;
        grid-template-columns: 92px 1fr 92px;
        gap: 1.25rem;
        padding: 1.5rem 1.5rem 2rem;
        position: relative;
        overflow: hidden;

        .belt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;

          .belt__badge {
            width: 44px;
            height: 44px;
            border-radius: 8px;
            background-color: rgba(0, 0, 0, 0.22);
            color: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            letter-spacing: 0.06em;
          }

          .belt__track {
            width: 100%;
            flex: 1;
            border-radius: 10px;
            background-color: rgba(0, 0, 0, 0.35);
            border: 2px solid rgba(0, 0, 0, 0.22);
            padding: 0.6rem 0.4rem;
            overflow: auto;
            background-image: repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.08),
              rgba(255, 255, 255, 0.08) 16px,
              rgba(0, 0, 0, 0.12) 16px,
              rgba(0, 0, 0, 0.12) 32px
            );

            .belt__item {
              width: 100%;
              border-radius: 8px;
              background-color: rgba(255, 255, 255, 0.88);
              border: 1px solid rgba(0, 0, 0, 0.12);
              padding: 0.5rem 0.35rem;
              margin-bottom: 0.45rem;
              font-weight: 800;
              color: rgba(51, 28, 11, 0.9);
              text-align: center;
            }
          }

          .belt__label {
            font-weight: 800;
            color: rgba(40, 20, 8, 0.85);
            font-size: 0.95rem;
          }
        }

        .room__center {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.2rem;

          .chef {
            width: 120px;
            height: 150px;
            position: relative;

            .chef__head {
              width: 72px;
              height: 72px;
              border-radius: 50%;
              background-color: #ffe7c4;
              border: 4px solid rgba(0, 0, 0, 0.28);
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
            }

            .chef__body {
              width: 98px;
              height: 78px;
              border-radius: 18px;
              background-color: rgba(255, 255, 255, 0.95);
              border: 4px solid rgba(0, 0, 0, 0.28);
              position: absolute;
              top: 62px;
              left: 50%;
              transform: translateX(-50%);
            }

            .chef__eye {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background-color: rgba(0, 0, 0, 0.75);
              position: absolute;
              top: 26px;

              &.chef__eye--left {
                left: 46px;
              }

              &.chef__eye--right {
                left: 64px;
              }
            }
          }

          .hand {
            width: 160px;
            border-radius: 14px;
            background-color: rgba(255, 255, 255, 0.35);
            border: 2px solid rgba(0, 0, 0, 0.18);
            padding: 0.85rem;
            display: flex;
            flex-direction: column;
            gap: 0.6rem;

            .hand__title {
              font-weight: 900;
              color: rgba(40, 20, 8, 0.85);
            }

            .hand__slot {
              height: 46px;
              border-radius: 12px;
              background-color: rgba(255, 255, 255, 0.9);
              border: 1px solid rgba(0, 0, 0, 0.12);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              color: rgba(51, 28, 11, 0.9);

              &.is-empty {
                background-color: rgba(0, 0, 0, 0.08);
                color: rgba(0, 0, 0, 0.55);
                font-weight: 800;
              }
            }
          }
        }
      }
    }

    .game__panel {
      width: 360px;
      background-color: rgba(242, 235, 220, 0.96);
      border-left: 1px solid rgba(0, 0, 0, 0.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .panel__header {
        padding: 1.1rem 1rem;
        background-color: rgba(0, 0, 0, 0.18);
        border-bottom: 1px solid rgba(0, 0, 0, 0.16);
        font-weight: 900;
        color: rgba(40, 20, 8, 0.9);
        letter-spacing: 0.08em;
        font-size: 1.1rem;
      }

      .panel__body {
        flex: 1;
        padding: 1rem;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;

        .panel__tip {
          background-color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          padding: 0.75rem 0.85rem;
          color: rgba(40, 20, 8, 0.78);
          font-weight: 700;
          line-height: 1.35;
        }

        .panel__mission {
          background-color: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          padding: 0.75rem 0.85rem;
          color: rgba(40, 20, 8, 0.82);
          font-weight: 800;
          line-height: 1.35;
        }

        .panel__palette {
          background-color: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          padding: 0.75rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;

          .palette__title {
            font-weight: 900;
            color: rgba(40, 20, 8, 0.85);
            letter-spacing: 0.04em;
          }

          .palette__list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.6rem;

            .palette__item {
              text-align: left;
              border: 1px solid rgba(0, 0, 0, 0.14);
              background-color: rgba(255, 255, 255, 0.72);
              border-radius: 12px;
              padding: 0.6rem;
              cursor: grab;
              display: flex;
              flex-direction: column;
              gap: 0.45rem;

              &:active {
                cursor: grabbing;
              }

              &:disabled {
                cursor: not-allowed;
                opacity: 0.55;
              }

              .palette__desc {
                color: rgba(40, 20, 8, 0.65);
                font-weight: 800;
                font-size: 0.85rem;
                line-height: 1.25;
              }
            }
          }
        }

        .panel__program {
          flex: 1;
          border-radius: 14px;
          background-color: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(0, 0, 0, 0.16);
          overflow: auto;
          padding: 0.75rem 0.6rem;

          .program__empty {
            height: 100%;
            min-height: 160px;
            border-radius: 12px;
            border: 2px dashed rgba(0, 0, 0, 0.18);
            color: rgba(40, 20, 8, 0.6);
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1rem;
            line-height: 1.35;
          }

          .program__list {
            display: flex;
            flex-direction: column;
            gap: 0.55rem;

            .program__row {
              display: grid;
              grid-template-columns: 44px 1fr 28px;
              gap: 0.55rem;
              align-items: center;

              &.is-active {
                .cmd-card {
                  box-shadow: 0 0 0 2px rgba(50, 205, 50, 0.35);
                }
              }

              .row__no {
                color: rgba(40, 20, 8, 0.65);
                font-weight: 900;
                text-align: right;
                font-variant-numeric: tabular-nums;
              }

              .row__cmd {
                .cmd-card {
                  height: 34px;
                  border-radius: 6px;
                  background-color: rgba(145, 215, 93, 0.9);
                  border: 1px solid rgba(0, 0, 0, 0.22);
                  display: flex;
                  align-items: center;
                  padding: 0 0.7rem;
                  font-weight: 900;
                  color: rgba(0, 0, 0, 0.75);
                  text-transform: lowercase;
                  position: relative;

                  &::after {
                    content: '';
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 0;
                    height: 0;
                    border-top: 6px solid transparent;
                    border-bottom: 6px solid transparent;
                    border-left: 9px solid rgba(0, 0, 0, 0.55);
                  }

                  &.cmd-card--outbox {
                    &::after {
                      border-left: 0;
                      border-right: 9px solid rgba(0, 0, 0, 0.55);
                    }
                  }
                }
              }

              .row__remove {
                height: 26px;
                border-radius: 6px;
                border: 1px solid rgba(0, 0, 0, 0.14);
                background-color: rgba(255, 255, 255, 0.6);
                color: rgba(0, 0, 0, 0.6);
                cursor: pointer;

                &:disabled {
                  cursor: not-allowed;
                  opacity: 0.45;
                }
              }
            }
          }
        }

        .panel__result {
          border-radius: 12px;
          padding: 0.75rem 0.85rem;
          font-weight: 900;
          line-height: 1.35;

          &.is-success {
            background-color: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.35);
            color: #065f46;
          }

          &.is-fail {
            background-color: rgba(255, 72, 72, 0.1);
            border: 1px solid rgba(255, 72, 72, 0.35);
            color: #b42318;
          }
        }
      }
    }
  }

  .level1__controls {
    height: 76px;
    background-color: rgba(0, 0, 0, 0.55);
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;

    .controls__group {
      display: flex;
      align-items: center;
      gap: 0.65rem;

      &.controls__group--status {
        justify-content: flex-end;
      }

      .tool {
        height: 44px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background-color: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.92);
        font-weight: 900;
        cursor: pointer;
        padding: 0 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;

        &:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        &.tool--play {
          background-color: rgba(145, 215, 93, 0.85);
          border-color: rgba(0, 0, 0, 0.18);
          color: rgba(0, 0, 0, 0.75);

          .tool__triangle {
            width: 0;
            height: 0;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-left: 12px solid rgba(0, 0, 0, 0.65);
            margin-left: 2px;
          }

          .tool__title {
            letter-spacing: 0.02em;
          }
        }
      }

      .status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.2rem;

        .status__label {
          font-weight: 800;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .status__value {
          font-weight: 900;
          color: rgba(255, 255, 255, 0.92);
        }
      }
    }
  }
}
</style>
