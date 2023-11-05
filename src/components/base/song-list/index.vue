<template>
  <ul class="song-list">
    <span class="clear" @click="showConfirm" v-if="showDeleteIcon">
      <i class="icon-clear"></i>
    </span>
    <!-- 清除浮动 -->
    <div class="clear-float"></div>

    <li
      class="item"
      v-for="(item, index) in songs"
      :key="item.id"
      @click="selectItem(item, index)"
    >
      <div class="rank" v-if="rank">
        <span :class="getRankCls(index)">{{ getRankText(index) }}</span>
      </div>
      <div class="content">
        <h2 class="name">{{ item.name }}</h2>
        <p class="desc">{{ getDesc(item) }}</p>
      </div>
      <span
        v-if="showDeleteIcon"
        class="delete"
        @click.stop="delSongFromPlayHistory(item)"
      >
        <i class="icon-delete"></i>
      </span>
    </li>
  </ul>
  <confirm
    ref="confirmRef1"
    @confirm="clearPlayHistory"
    text="是否清空所有播放历史"
    confirm-btn-text="清空"
  ></confirm>

  <confirm
    ref="confirmRef2"
    @confirm="
      () => {
        return;
      }
    "
    text="播放历史为空，无法清空歌曲"
    confirm-btn-text="确定"
  ></confirm>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent, PropType, Ref, ref } from 'vue'
import type { Song } from '@/types/api/recommend'
import { usePlayHistory } from '@/components/player/use-play-history'
import Confirm from '@/components/base/confirm/index.vue'

interface State {
  confirmRef1: Ref | null;
  confirmRef2: Ref | null;
  // Ref<HTMLDivElement>
}

export default defineComponent({
  name: 'SongList',
  components: {
    Confirm
  },
  props: {
    /** 歌曲列表 */
    songs: {
      type: Array as PropType<Song[]>,
      default: () => []
    },
    /** 是否排行榜 */
    rank: {
      type: Boolean,
      default: false
    },
    showDeleteIcon: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select'],
  setup (props, { emit }) {
    const state = reactive<State>({
      confirmRef1: ref<HTMLElement | null>(null),
      confirmRef2: ref<HTMLElement | null>(null)
      // ref<HTMLDivElement>(document.createElement('div'))
    })
    const { delSongFromPlayHistory, clearPlayHistory } = usePlayHistory()
    /** 详情描述 */
    function getDesc (item: Song): string {
      return `${item.singer}-${item.album}`
    }

    /** 排行图标 */
    function getRankCls (index: number): string {
      if (index <= 2) {
        return `icon icon${index}`
      } else {
        return 'text'
      }
    }

    /** 排行文案 */
    function getRankText (index: number): number | undefined {
      if (index > 2) return index + 1
    }

    /** 选择歌曲 */
    function selectItem (song: Song, index: number): void {
      emit('select', { song, index })
    }
    function showConfirm (): void {
      if (props.songs.length > 0) {
        state.confirmRef1.show()
        return
      }
      state.confirmRef2.show()
    }

    return {
      // toRefs解构出来的变量不需要再通过value取值，切记！！！
      ...toRefs(state), // 这句是关键，否则会报错xxx in not a function
      getDesc,
      getRankCls,
      getRankText,
      selectItem,
      delSongFromPlayHistory,
      showConfirm,
      clearPlayHistory
    }
  }
})
</script>

<style scoped lang="less">
.song-list {
  .clear {
    float: right;

    .icon-clear {
      color: @color-text-d;
      font-size: @font-size-medium;
    }
  }

  .clear-float {
    clear: both;
  }

  .item {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 64px;
    font-size: @font-size-medium;

    .rank {
      flex: 0 0 25px;
      width: 25px;
      margin-right: 20px;
      text-align: center;

      .icon {
        display: inline-block;
        width: 25px;
        height: 24px;
        background-size: 25px 24px;

        &.icon0 {
          .bg-image("first");
        }

        &.icon1 {
          .bg-image("second");
        }

        &.icon2 {
          .bg-image("third");
        }
      }

      .text {
        color: @color-theme;
        font-size: @font-size-large;
      }
    }

    .content {
      flex: 1;
      overflow: hidden;
      line-height: 20px;

      .name {
        color: @color-text;
        .text-overflow-hidden();
      }

      .desc {
        margin-top: 4px;
        color: @color-text-d;
        .text-overflow-hidden();
      }
    }
  }

  .delete {
    color: @color-theme;
    font-size: @font-size-small;
  }
}
</style>
