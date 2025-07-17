<script setup vapor>
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

