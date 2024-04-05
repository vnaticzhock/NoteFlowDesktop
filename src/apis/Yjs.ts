import * as Y from 'yjs'
import { YArrayTypeMapper } from '../types/flow/yjs'

const configureYmap = <K extends keyof YArrayTypeMapper>(
  ymap: Y.Map<Y.Array<YArrayTypeMapper[K]>>,
  name: K,
  ls: YArrayTypeMapper[K][]
): Y.Array<YArrayTypeMapper[K]> => {
  const array = new Y.Array<YArrayTypeMapper[K]>()

  for (let i = 0; i < ls.length; i++) {
    array.insert(i, [ls[i]])
  }

  ymap.set(name, array)

  return array
}

export { configureYmap }
