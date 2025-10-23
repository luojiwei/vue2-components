// 自动全局注册 src/components 目录下的所有 .vue 组件
// 使用方式：在 main.js 中 `import GlobalComponents from './components/global'; Vue.use(GlobalComponents)`

const requireComponent = require.context('.', true, /\.vue$/)

function getComponentName (filePath, component) {
  // 优先使用组件的 name
  if (component && component.name) return component.name
  // 其次使用文件/目录名
  // e.g. ./UploadImage/index.vue -> UploadImage
  // e.g. ./HeaderSearch/index.vue -> HeaderSearch
  const cleaned = filePath
    .replace(/^\.\//, '')
    .replace(/\/index\.(vue|js)$/, '')
    .replace(/\.(vue|js)$/, '')
  const parts = cleaned.split('/')
  return parts[parts.length - 1]
}

export default {
  install (Vue) {
    requireComponent.keys().forEach(fileName => {
      const componentConfig = requireComponent(fileName)
      const component = componentConfig.default || componentConfig
      const componentName = getComponentName(fileName, component)
      if (componentName) {
        Vue.component(componentName, component)
      }
    })
  }
}
