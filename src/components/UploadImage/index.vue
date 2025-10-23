<template>
  <el-upload
    class="upload-image"
    :action="actionUrl"
    :accept="accept"
    :show-file-list="false"
    :on-success="handleSuccess"
    :before-upload="beforeUpload"
    multiple
  >
    <el-image v-if="imgUrl" :src="imgUrl" fit="contain" />
    <i v-else class="el-icon-plus" />
  </el-upload>
</template>

<script>
const baseUrl = process.env.VUE_APP_BASE_API
const cdnUrl = process.env.VUE_APP_CDN_URL

export default {
  name: 'UploadImage',
  props: {
    url: {
      type: String,
      default: ''
    },
    actionUrl: {
      type: String,
      default: baseUrl + 'uploadImgByCms?type=1'
    },
    maxSize: {
      type: Number,
      default: 2
    },
    accept: {
      type: String,
      default: 'image/jpeg, image/png'
    }
  },
  computed: {
    imgUrl: {
      get () {
        if (!this.url) return ''
        if (this.url.includes('http')) {
          return this.url
        }
        return cdnUrl + this.url
      },
      set (val) {
        this.$emit('update:url', val)
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
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isAccept && isLt2M
    },
    handleSuccess (response) {
      this.imgUrl = response.data.img
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    border-color: #409EFF;
    i {
      color: #999;
    }
  }
  i {
    font-size: 50px;
    color: #ddd;
    transition: all 0.3s;
  }
}

.el-image {
  width: 100%;
  height: 100%;
}
</style>
