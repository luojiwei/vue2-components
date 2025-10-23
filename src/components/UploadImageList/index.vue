<template>
  <div class="upload-image-list" :class="{'drag': drag}">
    <ImageList v-if="!drag" :file-list.sync="imageList" />
    <el-upload
      :action="actionUrl"
      :show-file-list="false"
      :accept="accept"
      :limit="limit"
      :drag="drag"
      multiple
      :on-success="handleSuccess"
      :on-progress="handleProgress"
      :on-error="handleError"
      :on-change="handleChange"
      :before-upload="beforeUpload"
    >
      <template slot="trigger">
        <div v-if="drag" class="upload-drag-trigger">
          <i class="el-icon-upload" />
          <div class="upload-drag-text">
            点击上传或拖拽文件到此处
          </div>
        </div>
        <div v-else class="upload-trigger">
          <i class="el-icon-plus" />
        </div>
      </template>
    </el-upload>
    <ImageList v-if="drag" :file-list.sync="imageList" />
  </div>
</template>

<script>
import ImageList from './components/ImageList.vue'

const baseUrl = process.env.VUE_APP_BASE_API
// const cdnUrl = process.env.VUE_APP_CDN_URL

export default {
  name: 'UploadImageList',
  components: {
    ImageList
  },
  props: {
    actionUrl: {
      type: String,
      default: baseUrl + 'uploadImgByCms?type=1'
    },
    fileList: {
      type: Array,
      default: () => []
    },
    urls: {
      type: Array,
      default: () => []
    },
    drag: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 99
    },
    maxSize: {
      type: Number,
      default: 2
    },
    accept: {
      type: String,
      default: 'image/jpeg, image/png'
    },
    isUpload: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    imageList: {
      get () {
        return this.fileList
      },
      set (val) {
        this.$emit('update:fileList', val)
        this.$emit('update:urls', val.map(i => i.url))
      }
    },
    uploading: {
      get () {
        return this.isUpload
      },
      set (val) {
        this.$emit('update:isUpload', val)
      }
    }
  },
  methods: {
    beforeUpload (file) {
      const isAccept = this.accept.includes(file.type)
      const isLt2M = file.size / 1024 / 1024 < this.maxSize

      if (!isAccept) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error(`上传图片大小不能超过 ${this.maxSize}MB!`)
      }
      const ok = isAccept && isLt2M
      if (ok) {
        // 兜底：确保每个文件在开始上传前有一个占位
        const exists = this.imageList.some(i => i.uid === file.uid)
        if (!exists) {
          const next = this.imageList.slice()
          next.push({
            uid: file.uid,
            name: file.name,
            status: 'uploading',
            progress: 0
          })
          this.imageList = next
        }
        // 标记进入上传中
        this.uploading = true
      }
      return ok
    },
    handleChange (file) {
      // 当批量选择时，可能在进度回调前就触发 change，这里保证每个文件都生成占位
      const exists = this.imageList.some(i => i.uid === file.uid)
      if (!exists) {
        const next = this.imageList.slice()
        next.push({
          uid: file.uid,
          name: file.name,
          status: file.status === 'success' ? 'success' : 'uploading',
          progress: file.percentage || 0
        })
        this.imageList = next
      }
    },
    handleProgress (event, file) {
      const idx = this.imageList.findIndex(i => i.uid === file.uid)
      if (idx !== -1) {
        const item = { ...this.imageList[idx], progress: Math.round(event.percent || 0) }
        const next = this.imageList.slice()
        next.splice(idx, 1, item)
        this.imageList = next
      } else {
        // 若未创建占位（极少数并发时序），则补建一条再写进度
        const next = this.imageList.slice()
        next.push({
          uid: file.uid,
          name: file.name,
          status: 'uploading',
          progress: Math.round(event.percent || 0)
        })
        this.imageList = next
      }
      // 保持上传中标记
      this.uploading = event.percent < 100
    },
    handleSuccess (res, file) {
      if (res.code !== 200) {
        this.handleError(res, file)
        return
      }
      const idx = this.imageList.findIndex(i => i.uid === file.uid)
      const next = this.imageList.slice()
      if (idx !== -1) {
        const item = {
          ...this.imageList[idx],
          url: res.data.img,
          status: 'success',
          progress: 100
        }
        next.splice(idx, 1, item)
      } else {
        next.push({
          url: res.data.img,
          uid: file.uid,
          name: file.name,
          status: 'success',
          progress: 100
        })
      }
      // 若不存在上传中的项，标记为非上传中
      if (!next.some(i => i.status === 'uploading')) {
        this.uploading = false
      }
      this.imageList = next
    },
    handleError (err, file) {
      console.error(err)
      const idx = this.imageList.findIndex(i => i.uid === file.uid)
      const next = this.imageList.slice()
      if (idx !== -1) {
        next.splice(idx, 1)
        this.imageList = next
      }
      // 若不存在上传中的项，标记为非上传中
      if (!next.some(i => i.status === 'uploading')) {
        this.uploading = false
      }
      this.$message.error('图片上传失败，请重试')
    }
  }
}
</script>

<style scoped lang="scss">
.upload-image-list {
  display: flex;
  gap: 10px;
  &.drag {
    flex-direction: column;
  }
}

::v-deep .el-upload {
  .el-upload-dragger {
    width: 300px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    i {
      font-size: 50px;
      margin: 0;
      transition: all 0.3s;
    }
    .upload-drag-text {
      font-size: 12px;
      color: #999;
    }
    &:hover {
      i {
        color: #999;
      }
    }
  }
}

.upload-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  i {
    font-size: 50px;
    color: #ddd;
    transition: all 0.3s;
  }
  &:hover {
    border-color: #409eff;
    i {
      color: #999;
    }
  }
}
</style>
