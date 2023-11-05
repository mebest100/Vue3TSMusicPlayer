// import store from '@/store'
import { useStore } from 'vuex'
import { PLAY_KEY } from '@/utils/constants'
import { saveStorage } from '@/utils/cache'
import * as types from '@/store/mutationTypes'
import { Song } from '@/types/api/recommend'
import { save, deleteFromArray } from '@/utils/array-store'

interface UsePlayHistory {
  savePlay: (song: Song) => void;
  delSongFromPlayHistory: (song: Song) => void;
  clearPlayHistory: () => void;
}

export function usePlayHistory (): UsePlayHistory {
  const maxLen = 200
  const store = useStore()

  function savePlay (song: Song): void {
    const songs = save(song, PLAY_KEY, (item) => item.id === song.id, maxLen)
    store.commit(types.SET_PLAY_HISTORY, songs)
  }

  function delSongFromPlayHistory (song: Song): void {
    console.log('store ==>', store)
    const playHistory = store.state.playHistory.slice()
    console.log('playHistory ===>', playHistory)

    deleteFromArray(playHistory, (item: Song) => item.mid === song.mid)
    store.commit(types.SET_PLAY_HISTORY, playHistory)
  }

  function clearPlayHistory (): void {
    saveStorage(PLAY_KEY, [])
    store.commit(types.SET_PLAY_HISTORY, [])
    store.commit(types.SET_PLAY_LIST, [])
    store.commit(types.SET_PLAYING, false)
  }

  return {
    savePlay,
    delSongFromPlayHistory,
    clearPlayHistory
  }
}
