什么是 Vapor mode
Vapor mode 中文直译是 蒸汽模式
[图片]
尤雨溪在VueConf 2025中说到，Vapor Mode是一个为了极致性能而存在的全新的编译和渲染模式。
简单来说是在vue3的基础上做了减法，去掉了diff的过程，页面更新的内容直接渲染出来。也就是我们常说的，无虚拟DOM版本的vue。
一句话总结：把虚拟 DOM 编译掉，组件直接操作真实 DOM，包体更小、跑得更快。

为什么要使用Vapor Mode
虚拟DOM
优点

1. 打开函数式 UI 编程的大门，使得组件抽象化，使得代码更易维护
2. 跨平台，因为虚拟 DOM 本质上只是一个 Javascript 对象，作为抽象层还能提供给其他应用使用，比如小程序、IOS 应用、Android应用等。
3. 数据绑定，更新视图时，减少 DOM 操作：可以将多次 DOM 操作合并为一次操作，比如添加 100 个节点原来是一个一个添加，现在是一次性添加，减少浏览器回流
4. 用相对轻量级的 Javascript 操作进行 DOM diff，避免大量查询和复杂的真实 DOM 的存储（包含大量属性）
5. 虚拟 DOM 借助 DOM diff 可以把多余的操作省略掉，减少页面 reflow、repaint。
6. 缓存 DOM，更新 DOM 时保存节点状态。
   过程
   Template（模板）-->AST（抽象语法树）-->Render Function（渲染函数）-->VNode（虚拟节点）-->Patch（更新真实DOM）
   代价
7. 额外的计算开销：
   虚拟DOM需要进行Diff算法对比新旧虚拟DOM树，这会带来额外的计算成本，尤其是在组件树较大或更新频繁时。
8. 内存占用：
   虚拟DOM是对真实DOM的抽象表示，会占用额外的内存空间来存储虚拟节点树。
9. 复杂性增加：
   虚拟DOM的实现需要引入额外的逻辑（如Diff算法、VNode结构等），增加了框架的复杂性。
10. 延迟更新：
    虚拟DOM通过批量更新机制优化性能，但这可能导致更新的延迟，尤其是在需要即时反馈的场景中。
11. 不适合简单场景：
    对于简单的页面或静态内容，虚拟DOM的引入可能得不偿失，因为直接操作真实DOM可能更高效。
    Vapor Mode
    在Vapor Mode下，.vue文件的模板会在编译阶段被极度优化。
12. 静态分析：遍历模板，识别出所有的动态绑定（如{{ msg }}、：id="dynamicId"、v-if）
13. 生成指令式代码：为每一个动态绑定生成直接的、命令式的DOM操作代码，并将其包裹在响应式副作用（effect）中。
    最终产出的代码不再是创建VNode的渲染函数，而是类似这样的原生JavaScript：
    // 伪代码示例： <p>{{ msg }}</p>的编译产物
    import { renderEffect, ref } from 'vue'

// 1、创建并插入静态模板
const p_element = document.createElement('p')
const text_node = document.createTextNode('')
p_element.appendChild(text_node)
document.body.appendChild(p_element)

// 2、将响应式数据源（msg）与DOM操作直接绑定
const msg = ref('Hello')
renderEffect(() => {
// 当msg.value变化时，仅执行这一个操作
text_node.textContent = msg.value
})
摒弃虚拟DOM而提倡Vapor Mode的核心理由：

1. 消除了VNode创建和运行时Diff的开销，更新性能只与动态绑定的数量有关，与模板的整体大小无关。
2. 更低的内存占用：无需在内存中维护VNode树。
3. 更小的框架体积：由于大部分工作由编译器完成，最终打包的运行时代码可以非常轻量。
   虚拟DOM和Vapor Mode模式
   形象比喻：
   传统VNodeDom：像是一个建筑监理，每次接到变更通知，都需要拿出新旧两份完整的建筑蓝图（VNode），逐一比对，找出所有差异点，生成一份施工单（Patch）交给施工队（浏览器）
   Vapor mode：像是一个高级建筑师，在设计之初就分析好了整个建筑。他不会在每次变更时都重新比对蓝图，而是直接在初始设计时就生成了N份精准的“微型施工指令”。例如：“当天气数据变为‘下雨’时，就去关闭三楼走廊尽头的那扇窗户”。当状态变化时，直接执行对应的指令。
   对比
   对比纬度
   传统虚拟DOM模板
   Vapor Mode
   核心思想
   运行时比对（Runtime Diffing）
   编译时分析（Compile-time Analysis）
   性能模型
   更新成本与组件大小相关
   更新成本仅与动态绑定数量相关
   内存占用
   较高（真实DOM+VNode树）
   极低（仅真实DOM）
   运行时大小
   较大（包含Diff/Patch逻辑）
   极小（仅包含基础调度器）
   适用场景
   高度动态、结构覆盖的UI
   性能敏感、模板结构相对稳定的场景

如何使用

1. 安装最新版本的vue pre-release版本 pnpm install vue@3.6.0-alpha.1
2. 在项目中启用vapor mode

- 全局启用：如果想创建一个纯vapor的vue，在main.js中通过createVaporApp创建app，同时根组件App.vue中需要使用在script上加上vapor（这里有个bug，不知为何无法在这种情况下在main.js中开启router和pinia，会报错）
  // main.js
  import { createVaporApp } from 'vue'

const app = createVaporApp(App)
app.mount('#app')

// App.vue

<script setup vapor>
  ...
</script>

- 局部启用：在main.js中使用createApp创建app，且引入vaporInteropPlugin插件进行use注册，这样项目中的文件既可以是普通setup的vue文件，也可以是开启了vapor的vue文件
  // main.js
  import { createApp, vaporInteropPlugin } from 'vue'

const app = createApp(App)
app.use(vaporInteropPlugin)
app.mount('#app')

// 任意组件可开启vapor

<script setup vapor>
  ...
</script>

差异对比
对于同一段vue组件：

<script setup>
import { ref } from 'vue'

const count = ref(0)
const increase = () => {
  count.value++
}
</script>

<template>
  <button @click="increase">increase</button>
  <h1>count: {{ count }}</h1>
</template>

在编译之后，未开启vapor模式下，可以明显的看到使用了createElementVNode函数来创建了VNode，也就是虚拟DOM
[图片]
而在vapor模式下，没有创建虚拟DOM的过程
[图片]

适用场景
虚拟 DOM 更适合：

1. 复杂动态应用

- 需要频繁操作 DOM 结构（如动态表单、拖拽排序）

2. 兼容性要求高的项目

- 需要支持旧浏览器或第三方库（如基于虚拟 DOM 的组件库）。

3. 开发体验优先

- 虚拟 DOM 的声明式编程更易维护（"状态驱动 UI"）。
  Vapor 模式更适合：

1. 性能敏感型页面

- 高频更新场景（如实时图表、股票行情）。
- 内存受限环境（移动端、低配设备）。

2. 静态/简单交互页面

- 内容为主的页面（博客、文档站）。
- 交互简单的列表/表格（直接 DOM 操作更高效）。

3. 极致轻量化需求

- 追求首屏加载速度（如营销落地页）。
- 微前端子应用需减少运行时体积。
