import { createMailroomScene } from '../mailroom/createMailroomScene'
import { createLevel1Config } from '../../levels/level1/config'

export function createLevel1Scene(ctx) {
  return createMailroomScene(ctx, createLevel1Config())
}
