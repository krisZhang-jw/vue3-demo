/*
 * @Author: zhangjiewen 474350393@qq.com
 * @Date: 2024-12-28 23:26:04
 * @LastEditors: zhangjiewen 474350393@qq.com
 * @LastEditTime: 2024-12-29 15:11:05
 * @FilePath: /vue3-demo/plugins/AutoImport.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default () => {
  return {
    AutoImport: AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'types/auto-imports.d.ts', // 使用typescript，需要指定生成对应的d.ts文件或者设置为true,生成默认导入d.ts文件
      dirs: ['src/stores', 'src/composables', 'src/hooks'],
    }),
    Components: Components({
      resolvers: [ElementPlusResolver()],
    }),
  }
}
