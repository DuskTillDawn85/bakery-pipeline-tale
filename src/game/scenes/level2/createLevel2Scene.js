import { createMailroomScene } from '../mailroom/createMailroomScene'
import { createLevel2Config } from '../../levels/level2/config'

export function createLevel2Scene(ctx) {
  return createMailroomScene(ctx, createLevel2Config())
}
