import request from '@/utils/request'
import axios from 'axios'
import type { SingerDetailReq } from '@/types/api/singer'
import type { LyricResp, SongUrlReq, SongUrlResp } from '@/types/api/song'
import type { Song } from '@/types/api/recommend'

interface LyricMap {
  [key: string]: string;
}

export default class SongServer {
  static getSongUrl (params: SongUrlReq): Promise<SongUrlResp> {
    return request.request({
      url: '/getSongsUrl',
      method: 'get',
      params
    })
  }

  static getLyric (params: SingerDetailReq): Promise<LyricResp> {
    return request.request({
      url: '/getLyric',
      method: 'get',
      params
    })
  }

  static async getNetEaseSongUrl (mid: string) {
    // console.log("开始获取网易云音乐歌曲播放链接.....")
    const url = '/api/getSongNetEase'

    const res = await axios.get(url, {
      params: {
        id: mid
      }
    })
    console.log('song data==>', res.data.data)
    const songurl = res.data.data[0].url

    return songurl
  }

  static getNetEaseLyric (mid: string): Promise<string> {
    // console.log("getLyric执行了");

    return new Promise((resolve, reject) => {
      // console.log("getLyric进入了ajax分支");
      const url = '/api/getNetEaseLyric' // 注意这里url之前一定要const关键字，否则ajax请求不会发起，因为axios在url为undefined时不会发起请求
      axios.get(url, { params: { id: mid } }).then(
        ({
          data: {
            lrc: { lyric },
            code
          }
        }) => {
          // console.log("data==>", data)
          // const {
          //   lrc: { lyrics },
          //   code,
          // } = data;
          if (code === 200) {
            resolve(lyric)
          } else {
            resolve('[00:00:00]该歌曲暂时无法获取歌词')
          }
        }
      )
    })
  }
}

/**
 * 批量获取歌曲地址
 * @param songs
 */
export function processSongs (songs: Song[]): Promise<Song[]> {
  if (!songs.length) return Promise.resolve(songs)
  return SongServer.getSongUrl({ mid: songs.map((song) => song.mid) }).then(
    ({ map }) => {
      return songs
        .map((song) => {
          song.url = map[song.mid]
          return song
        })
        .filter((song) => song.url?.indexOf('vkey') >= 0)
    }
  )
}

// 构造歌曲song对象
export function createSong (song: any) {
  const newSong = {
    id: song.id,
    mid: song.id,
    type: 1,
    singer: song.artists[0].name,
    name: song.name,
    album: song.album.name,
    duration: Math.floor(song.duration / 1000),
    pic: require('@/assets/images/disc.png'),
    url: ''
  }
  return newSong
}

export function createSongs (songs: []) {
  const resultSongs = []
  for (const song of songs) {
    const songItem = createSong(song)
    resultSongs.push(songItem)
  }
  return resultSongs
}

// 缓存歌词
const lyricMap: LyricMap = {}

/**
 * 处理歌词
 * @param song
 */
export function processLyric (song: Song): Promise<string> {
  if (song.lyric) return Promise.resolve(song.lyric)
  const mid = song.mid
  const lyric = lyricMap[mid]
  if (lyric) return Promise.resolve(lyric)

  if (song.type) {
    return SongServer.getNetEaseLyric(mid).then((res) => {
      const lyric = res
      lyricMap[mid] = lyric
      return lyric
    })
  }

  return SongServer.getLyric({ mid }).then((res) => {
    const lyric = res ? res.lyric : '[00:00:00]该歌曲暂时无法获取歌词'
    lyricMap[mid] = lyric
    return lyric
  })
}
