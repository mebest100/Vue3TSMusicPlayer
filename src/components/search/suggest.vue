<template>
  <div
    ref="rootRef"
    class="suggest"
    v-loading:[loadingText]="loading"
    v-no-result:[noResultText]="noResult"
  >
    <ul class="suggest-list">
      <!-- <li
        class="suggest-item"
        v-if="singer"
        @click="selectSinger(singer)"
      >
        <div class="icon">
          <i class="icon-mine"></i>
        </div>
        <div class="name">
          <p class="text">{{ singer.name }}</p>
        </div>
      </li> -->
      <li
        class="suggest-item"
        v-for="item in songs"
        :key="item.id"
        @click="selectSong(item)"
      >
        <div class="icon">
          <i class="icon-music"></i>
        </div>
        <div class="name">
          <p class="text">
            {{ item.singer }}-{{ item.name }}
          </p>
        </div>
      </li>
      <li
        class="suggest-item"
        v-loading:[loadingText]="pullUpLoading"
      ></li>
    </ul>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, reactive, toRefs, watch } from 'vue'
import { createSongs } from '@/api/song'
import SearchServer from '@/api/search'
import { usePullUpLoad } from './use-pull-up-load'
import type { Singer } from '@/types/api/singer'
import type { Song } from '@/types/api/recommend'

interface State {
  /** 歌曲列表 */
  songs: Song[];
  /** 是否有下一页 */
  hasMore: boolean;
  /** 每页条数 */
  pageSize: number
  /** 当前页码 */
  page: number;
  /** 加载文案 */
  loadingText: string;
  /** 空数据文案 */
  noResultText: string;
  /** 手动加载 */
  manualLoading: boolean;
}

export default defineComponent({
  name: 'Suggest',
  props: {
    /** 搜素参数 */
    query: {
      type: String,
      default: ''
    },
    /** 显示歌手 */
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  emits: ['select-song', 'select-singer'],
  setup (props, { emit }) {
    const state = reactive<State>({
      pageSize: 30,
      page: 1,
      songs: [],
      hasMore: true,
      loadingText: '',
      noResultText: '抱歉，暂无搜索结果',
      manualLoading: false
    })

    const loading = computed(() => !state.songs.length)
    const noResult = computed(() => !state.songs.length && !state.hasMore)
    const pullUpLoading = computed(() => isPullUpLoad.value && state.hasMore)
    const preventPullUpLoad = computed(() => loading.value || state.manualLoading)

    // hooks
    const { isPullUpLoad, rootRef, scroll } = usePullUpLoad({ fetchData: searchMore, preventPullUpLoad })

    /** 首次搜索 */
    async function searchFirst (): Promise<void> {
      if (!props.query) return
      state.page = 1
      state.songs = []
      state.hasMore = true

      const { result, code } = await SearchServer.search({
        keywords: props.query,
        limit: state.pageSize,
        offset: (state.page - 1) * state.pageSize
      })
      if (code === 200) {
        state.songs = await createSongs(result.songs)
        state.hasMore = checkMore(result)
        await nextTick()
        await makeItScrollable()
      }
    }

    /** 搜索更多  */
    async function searchMore (): Promise<void> {
      if (!state.hasMore || !props.query) return
      state.page++
      const { result, code } = await SearchServer.search({
        keywords: props.query,
        limit: state.pageSize,
        offset: (state.page - 1) * state.pageSize
      })
      if (code === 200) {
        state.songs = state.songs.concat(await createSongs(result.songs))
        state.hasMore = checkMore(result)
        await nextTick()
        await makeItScrollable()
      }
    }

    /** 手动控制加载 */
    async function makeItScrollable (): Promise<void> {
      if (scroll.value && scroll.value.maxScrollY >= -1) {
        state.manualLoading = true
        await searchMore()
        state.manualLoading = false
      }
    }

    /** 选择歌手 */
    function selectSinger (singer: Singer): void {
      emit('select-singer', singer)
    }

    /** 选择歌曲 */
    function selectSong (song: Song): void {
      emit('select-song', song)
    }

    function checkMore (data:any): boolean {
      console.log('checkmore收到数据==》', data)
      // let songs = data.songs;
      if (
        // data.songCount == 0
        state.songs.length >= data.songCount
        // (this.page - 1) * this.perpage + songs.length > data.songCount
      ) {
        state.hasMore = false
      }
      return state.hasMore
    }

    watch(
      () => props.query,
      async (newQuery) => {
        if (!newQuery) return
        await searchFirst()
      }
    )

    return {
      ...toRefs(state),
      loading,
      noResult,
      pullUpLoading,
      preventPullUpLoad,
      isPullUpLoad,
      rootRef,
      scroll,

      selectSinger,
      selectSong
    }
  }
})
</script>

<style scoped lang="less">
.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;

      .icon {
        flex: 0 0 30px;
        width: 30px;

        [class^="icon-"] {
          color: @color-text-d;
          font-size: 14px;
        }
      }

      .name {
        flex: 1;
        overflow: hidden;
        color: @color-text-d;
        font-size: @font-size-medium;

        .text {
          .text-overflow-hidden();
        }
      }
    }
  }
}
</style>
