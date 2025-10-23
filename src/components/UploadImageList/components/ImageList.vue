<template>
  <div ref="imageList" class="image-list">
    <div v-for="(item, index) in imageList" :key="item.uid" class="image-wrapper">
      <div v-if="item.status === 'success'" class="image-item">
        <div class="image-action">
          <div class="action-top">
            <i class="el-icon-rank" />
          </div>
          <div class="action-middle">
            <i class="el-icon-view" @click="handleView(index)" />
            <i class="el-icon-delete" @click="handleDelete(index)" />
          </div>
          <div class="action-bottom" />
        </div>
        <el-image :src="getUrl(item.url)" fit="contain" />
      </div>
      <div v-else class="uploading-item">
        <div class="uploading-content">
          <el-progress type="circle" :width="80" :stroke-width="4" :percentage="item.progress || 0" />
          <div class="uploading-name">上传中...</div>
        </div>
      </div>
    </div>
    <el-image
      v-if="imageList.filter(item => item.status === 'success').length > 0"
      ref="imagePreview"
      class="image-preview"
      :src="getUrl(imageList.filter(item => item.status === 'success')[0].url)"
      :preview-src-list="imageList.filter(item => item.status === 'success').map(item => getUrl(item.url))"
      :initial-index="initialIndex"
    />
  </div>
</template>

<script>
import SortableJs from 'sortablejs'

const cdnUrl = process.env.VUE_APP_CDN_URL

export default {
  name: 'ImageList',
  props: {
    fileList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      sortable: null,
      initialIndex: 0
    }
  },
  computed: {
    imageList: {
      get () {
        return this.fileList
      },
      set (val) {
        this.$emit('update:fileList', val)
      }
    }
  },
  watch: {
    imageList: {
      handler (newVal) {
        const successCount = newVal.filter(i => i.status === 'success').length
        if (this.sortable) {
          this.sortable.option('disabled', successCount <= 1)
        }
      },
      deep: true
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initSortable()
    })
  },
  methods: {
    initSortable () {
      this.sortable = SortableJs.create(this.$refs.imageList, {
        handle: '.el-icon-rank',
        draggable: '.image-wrapper',
        sort: true,
        animation: 150,
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt
          const [movedFile] = this.imageList.splice(oldIndex, 1)
          this.imageList.splice(newIndex, 0, movedFile)
          this.$emit('update:fileList', this.imageList)
        }
      })
    },
    getUrl (url) {
      if (!url) return ''
      if (url.includes('http')) {
        return url
      }
      return cdnUrl + url
    },
    handleView (index) {
      this.initialIndex = index
      this.$refs.imagePreview.$el.querySelector('img').click()
    },
    handleDelete (index) {
      this.imageList.splice(index, 1)
      this.$emit('update:fileList', this.imageList)
    }
  }
}
</script>

<style scoped lang="scss">
.image-list {
  display: flex;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 4px;
  overflow: hidden;
  &:hover {
    .image-action {
      opacity: 1;
      z-index: 2;
      &::after {
        opacity: 1;
      }
    }
  }
  .el-image {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: #f1f1f1;
  }
  .image-action {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: -1;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    color: #fff;
    i {
      cursor: pointer;
    }
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: all 0.3s;
      z-index: -1;
    }
    .action-top {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 30px;
      padding: 0 5px;
      i {
        cursor: move;
      }
    }
    .action-middle {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
    .action-bottom {
      height: 30px;
    }
  }
}

.uploading-item {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f1f1;
  border-radius: 4px;
  .uploading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .uploading-name {
    font-size: 12px;
    color: #999;
  }
}

.image-preview {
  display: none;
}
</style>
