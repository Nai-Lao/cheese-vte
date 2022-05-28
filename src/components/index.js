
import vte from '../components/vte.vue'

const components = [
    vte
]
 
const install = function (Vue) {
    // 全局注册所有组件
    components.forEach(item => {
        Vue.component(item.name, item)
    })
}
// 判断是否是以文件方式或者CDN方式，如果是，则不用调用 Vue.use()。在 CommonJS 中应始终使用 Vue.use()
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}
export default install