<template>
  <useMap ref="useMapRef" :isDrawing :mapPoints />
  <div class="buttons">
    <button @click="addFeature">新增</button>
    <button @click="modifyFeature">修改</button>
    <button @click="dispatchFeature">下发</button>
    <button @click="deleteFeature">删除</button>
  </div>
</template>

<script setup lang="ts">
import useMap from './useMap.vue'

const useMapRef = ref()
const isDrawing = ref(false)
const mapPoints = ref([])

const getRoadData = () => {}

const addFeature = () => {
  isDrawing.value = true
  useMapRef.value.add()
}

const modifyFeature = () => {
  isDrawing.value = true
  useMapRef.value.modify()
}

const dispatchFeature = () => {
  isDrawing.value = false
}

const deleteFeature = () => {
  isDrawing.value = false
  useMapRef.value.clear()
}

onMounted(() => {})
</script>

<style scoped>
#map {
  width: 100%;
  height: 100vh;
}

.buttons {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
}

button {
  margin: 5px;
}
</style>
