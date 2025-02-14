/*
 * @Author: zhangjiewen 474350393@qq.com
 * @Date: 2024-12-28 23:41:09
 * @LastEditors: zhangjiewen 474350393@qq.com
 * @LastEditTime: 2025-02-14 19:46:02
 * @FilePath: /vue3-demo/plugins/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import AutoImport from './AutoImport'

const autoImportInstance = AutoImport()
export default [autoImportInstance.AutoImport, autoImportInstance.Components]
