<template>
  <div class="use-map-lcs" id="use-map-lcs" style="width: 100%; height: 100vh">
    <div id="map" class="map" style="width: 100%; height: 100%"></div>
  </div>
</template>

<script setup lang="ts">
import UseMap from './map'

const props = defineProps({
  isDrawing: Boolean,
  mapPoints: Array,
})

const useMap = ref(null)

watch(
  () => props.isDrawing,
  (val) => {
    if (useMap.value) {
      useMap.value.updateDraw(val)
    }
  },
)

watch(
  () => props.mapPoints,
  (val) => {
    if (useMap.value) {
      useMap.value.updateMapPoints(val)
    }
  },
  { deep: true },
)

const init = () => {
  useMap.value = new UseMap()
  nextTick(() => {
    useMap.value.init({ nextTick })
  })
}

const clear = () => {
  useMap.value.clear?.()
}

const getPointCoordinates = () => {
  return useMap.value.getPointCoordinates() || null
}

const add = () => {
  useMap.value.add()
}
const modify = () => {
  useMap.value.modify()
}

onMounted(() => {
  init()
})

defineExpose({
  clear,
  getPointCoordinates,
  add,
  modify,
})
</script>

<style lang="scss" scoped></style>
