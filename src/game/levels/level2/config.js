import { OP } from '../../gameplay/ops'
import { createLevel2InboxItems } from './level2Items'

export function createLevel2Config() {
  return {
    inboxItems: createLevel2InboxItems(),
    availableOps: [
      { op: OP.INBOX, title: 'INBOX', desc: '取原料（从输入传送带拿一个）' },
      { op: OP.OUTBOX, title: 'OUTBOX', desc: '放成品（把手里的原料放到输出带）' },
    ],
    successMessage: '恭喜通关：你成功处理了更繁忙的收发室。',
  }
}
