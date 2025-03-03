// 修改点1: 新增函数判断是否可以绘制
const canDraw = (mapBrowserEvent) => {
  const startCoord = mapBrowserEvent.coordinate_

  let res = true

  // 遍历所有现有线
  vectorSource.forEachFeature(function(feature) {
    const geometry = feature.getGeometry();
    if (geometry instanceof LineString) {
      // 检查初始点是否在线上
      const closestPoint = geometry.getClosestPoint(startCoord); // 获取线上最近的点
      const distance = getDistance(startCoord, closestPoint); // 计算两点之间的距离
      console.log('distance', distance)

      // 检查初始点是否在点上
      const isPoint = vectorSource.getFeatures().some((feature) => {
        const coordinates = feature.getGeometry().getCoordinates()
        if (coordinates.some((coord) => coord.toString() === startCoord.toString())) {
          return true
        }
      })

      // 如果不在点上 且 距离小于一个阈值（例如 1 米），则认为初始点在线上
      if (!isPoint && distance < 1) {
        // 取消绘制
        res = false;
      }
    }
  });
  return res
}

// 修改点2: 修改Select
import { click } from 'ol/events/condition.js'
const selectInteraction = new Select({
  layers: [vectorLayer],
  hitTolerance: 10,
  condition: click,
})


// 修改点3: 修改Draw
const drawPoint = new Draw({
  source: vectorSource,
  type: 'Point',
  condition: (mapBrowserEvent) => {
    // 这里加了canDraw判断
    return canDraw(mapBrowserEvent)
  }
})

const drawLine = new Draw({
  source: vectorSource,
  type: 'LineString',
  condition: (mapBrowserEvent) => {
    const event = mapBrowserEvent.originalEvent
    const isLeftClick = event.button === 0
    const isTouch = event.type.startsWith('touch')
    const isMacRightClick = event.ctrlKey && event.button === 0

    // 这里加了canDraw判断
    return canDraw(mapBrowserEvent) && (isLeftClick || isTouch || isMacRightClick)
  },
})