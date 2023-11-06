import store from '@/store'
import { load } from '@/utils/array-store'
import { FAVORITE_KEY, PLAY_KEY } from '@/utils/constants'
import * as types from '@/store/mutationTypes'
import type { Song } from '@/types/api/recommend'

/**
 * 处理缓存歌曲链接
 * */
export function setupSongs (): void {
  const favoriteSongs = load<Song>(FAVORITE_KEY)
  if (favoriteSongs.length > 0) {
    store.commit(types.SET_FAVORITE_LIST, favoriteSongs)
  }

  const historySongs = load<Song>(PLAY_KEY)
  if (historySongs.length > 0) {
    store.commit(types.SET_PLAY_HISTORY, historySongs)
  }
}
