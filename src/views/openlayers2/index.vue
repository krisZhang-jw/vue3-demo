<template>
  <div id="map" class="map" style="width: 100vw;height: 100vh;"></div>
</template>

<script setup lang="ts">
import init from './utils.js'


onMounted(() => {
  init()
})
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

#moveTooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px;
  display: block;
  white-space: nowrap;
}
</style>
