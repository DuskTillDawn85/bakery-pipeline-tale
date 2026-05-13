import { OP } from '../../logic/ops'
import { createLevel1InboxItems } from './level1Items'

export function createLevel1Config() {
  return {
    inboxItems: createLevel1InboxItems(),
    availableOps: [
      { op: OP.INBOX, title: 'INBOX', desc: '取原料（从输入传送带拿一个）' },
      { op: OP.OUTBOX, title: 'OUTBOX', desc: '放成品（把手里的原料放到输出带）' },
    ],
    successMessage: '恭喜通关：所有原料都被搬运到输出传送带。',
  }
}

