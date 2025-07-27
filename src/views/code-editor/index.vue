<template>
  <div>
    <b-code-editor
    v-model="code"
    language="json"
    :options="{ lineNumbers: true }"
  />
  </div>
  
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue'
import BCodeEditor from 'bin-code-editor'

const code = ref(`{"title":"测试json数据"}`)

// defineComponent({
//   components: {
//     BCodeEditor
//   }
// })
</script>