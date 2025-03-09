import Map from 'ol/Map'
import View from 'ol/View'
import { defaults as interDefaults, Draw, Modify, Snap, Select, Interaction } from 'ol/interaction'
import { defaults as defaultsControls } from 'ol/control'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { Feature, Overlay } from 'ol'
import { LineString, Point } from 'ol/geom'
import { click } from 'ol/events/condition.js'
import { getDistance } from 'ol/sphere'

export default class {
  constructor(opt) {
    // this.sdk = opt.sdk
    // this.$event = opt.sdk.$event
    // this.registor = opt.sdk.registor
    // this.code = opt.sdk.data.app.code
    this.vueDomain = null
    this.oMap = null
    this.isDrawing = false
    this.isDrawingLine = false
    this.isCanDrawPoint = false
  }

  init(domain) {
    this.vueDomain = domain
    this.initOmap()
  }

  initOmap() {
    const _this = this
    this.vueDomain.nextTick(() => {
      _this.oMap = new Map({
        controls: defaultsControls({
          zoom: false,
          rotate: false,
        }),
        interactions: interDefaults({
          doubleClickZoom: true,
          mouseWheelZoom: true,
        }),
        target: 'map',
        view: new View({
          // 随便写的
          center: [0, 0],
          zoom: 2,
        }),
      })
      _this.initRoadLayers(_this.oMap)
    })
  }

  initRoadLayers(map) {
    const vectorSource = new VectorSource()
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#ffcc33',
          width: 5,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33',
          }),
        }),
      }),
    })
    map.addLayer(vectorLayer)

    const drawPoint = new Draw({
      source: vectorSource,
      type: 'Point',
      condition: (mapBrowserEvent) => {
        // 判断当前画的点在不在线上
        if (mapBrowserEvent.originalEvent.button === 2) {
          this.isCanDrawPoint = this.isDrawingLine
        } else if (mapBrowserEvent.originalEvent.button === 0) {
          console.log('drawPoint condition canDraw(mapBrowserEvent)', canDraw(mapBrowserEvent))
          this.isCanDrawPoint = canDraw(mapBrowserEvent)
        }
        return this.isCanDrawPoint
      },
    })
    const drawLine = new Draw({
      source: vectorSource,
      type: 'LineString',
      condition: (mapBrowserEvent) => {
        const event = mapBrowserEvent.originalEvent
        // 检查是否为鼠标左键或触控
        const isLeftClick = event.button === 0
        // 检查是否为触控设备
        const isTouch = event.type.startsWith('touch')
        // 在 Mac 上，ctrl + 左键会被视为右键
        const isMacRightClick = event.ctrlKey && event.button === 0
        return canDraw(mapBrowserEvent, drawPoint) && (isLeftClick || isTouch || isMacRightClick)
      },
    })
    const modifyInteraction = new Modify({
      source: vectorSource,
      insertVertex: false,
      insertVertexCondition: (event) => {
        return false
      },
    })
    const snapInteraction = new Snap({ source: vectorSource })
    const selectInteraction = new Select({
      layers: [vectorLayer],
      hitTolerance: 10,
      condition: click,
    })

    snapInteraction.on('snap', (e) => {
      // console.log('snap', e)
    })

    this.interactions = [modifyInteraction, selectInteraction, drawLine, drawPoint, snapInteraction]
    this.vectorSource = vectorSource
    this.vectorLayer = vectorLayer
    this.drawPoint = drawPoint
    this.drawLine = drawLine
    this.modifyInteraction = modifyInteraction
    this.snapInteraction = snapInteraction
    this.selectInteraction = selectInteraction

    const canDraw = (mapBrowserEvent) => {
      const startCoord = mapBrowserEvent.coordinate_

      let res = true

      // 遍历所有现有线
      vectorSource.forEachFeature(function (feature) {
        const geometry = feature.getGeometry()
        if (geometry instanceof LineString) {
          // 检查初始点是否在线上
          const closestPoint = geometry.getClosestPoint(startCoord) // 获取线上最近的点
          const distance = getDistance(startCoord, closestPoint) // 计算两点之间的距离
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
            res = false
          }
        }
      })
      return res
    }

    drawPoint.on('drawstart', (e) => {
      console.log('drawPoint drawstart', e)
    })
    drawPoint.on('drawend', (e) => {
      console.log('drawPoint drawend', e)
      const id =
        vectorSource.getFeatures().filter((feature) => feature.getGeometry().getType() === 'Point')
          .length + 1
      e.feature.setId(id)
    })
    drawLine.on('drawstart', (e) => {
      console.log('drawLine drawstart', e)
      this.isDrawingLine = true
    })
    drawLine.on('drawend', (e) => {
      this.isDrawingLine = false
    })
    drawLine.on('drawabort', (e) => {
      console.log('drawLine drawabort', e)
      this.isDrawingLine = false
      // drawLine.removeLastPoint()
      const coordinates = e.feature.getGeometry().getCoordinates()
      const segments = coordinates.map((coordinate, index, array) => {
        if (index > 0 && JSON.stringify(coordinate) !== JSON.stringify(array[index - 1])) {
          return new LineString([array[index - 1], coordinate])
        }
        return null
      })
      segments.forEach((segment) => {
        if (segment) {
          const newFeature = new Feature(segment)
          vectorSource.addFeature(newFeature)
        }
      })
    })

    selectInteraction.on('select', (e) => {
      console.log('selectInteraction select', e)
      const selectedFeatures = e.selected[0]
      if (selectedFeatures) {
        // this.vueDomain
        //   .$confirm('是否删除选中的要素', {
        //     confirmButtonText: '确定',
        //     cancelButtonText: '取消',
        //     type: 'warning',
        //   })
        //   .then(() => {
        const lineFeatures = selectedFeatures.getGeometry().getType() === 'LineString'
        if (lineFeatures) {
          // 在鼠标坐标处显示按钮
          this.overlayInstance.setPosition(e.mapBrowserEvent.coordinate)
        } else {
          // 若非线要素，就隐藏按钮
          this.overlayInstance.setPosition(undefined)
        }

        this.deleteMethod = () => {
          if (lineFeatures) {
            const firstCoordinate = selectedFeatures.getGeometry().getFirstCoordinate() // 左端点坐标
            const firstFeature = this.vectorSource.getClosestFeatureToCoordinate(
              // 左端点对象
              firstCoordinate,
              (feature) => feature.getGeometry().getType() === 'Point',
            )
            const firstId = firstFeature.getId() // 左端点id
            const lastCoordinate = selectedFeatures.getGeometry().getLastCoordinate() // 右端点坐标
            const lastFeature = this.vectorSource.getClosestFeatureToCoordinate(
              // 右端点对象
              lastCoordinate,
              (feature) => feature.getGeometry().getType() === 'Point',
            )
            const lastId = lastFeature.getId() // 右端点id

            // 判读某个线段的某个端点，是否包含除了另一端点之外的其他点，包含则不允许删除，不包含则允许删除
            const checkNodeHasOtherNodes = (node1Id, node2Id) => {
              const linkNode = this.mapPoints.find((point) => point.id === node1Id)?.linkNode // [2]
              return !!linkNode.filter((nodeId) => nodeId !== node2Id).length
            }

            const deleteNodeById = (nodeId, stringOtherNodeId) => {
              // 将mapPoints中删除nodeId点
              this.mapPoints = this.mapPoints.filter((point) => point.id !== nodeId)
              // 其他点的linkNode中删除关联点是nodeId
              this.mapPoints.forEach((point) => {
                if (point.linkNode.includes(nodeId)) {
                  point.linkNode = point.linkNode.filter((linkId) => linkId !== nodeId)
                }
              })
              // 删除当前点要素
              const nodeFeature = this.vectorSource.getFeatureById(nodeId)
              this.vectorSource.removeFeature(nodeFeature)
            }

            if (!checkNodeHasOtherNodes(firstId, lastId)) {
              // 删除firstId
              deleteNodeById(firstId, lastId)
            }
            if (!checkNodeHasOtherNodes(lastId, firstId)) {
              // 删除lastId
              deleteNodeById(lastId, firstId)
            }

            this.mapPoints.forEach((point) => {
              if (point.id === firstId) {
                point.linkNode = point.linkNode.filter((linkId) => linkId !== lastId)
              }
              if (point.id === lastId) {
                point.linkNode = point.linkNode.filter((linkId) => linkId !== firstId)
              }
            })

            this.vectorSource.removeFeature(selectedFeatures)

            // const firstCoordinateLinkNode = this.mapPoints
            //   .find(
            //     (point) =>
            //       JSON.stringify([point.xCoord, point.yCoord]) === JSON.stringify(firstCoordinate),
            //   ) // [{id:1,xxxx}]
            //   .map((point) => point.linkNode)?.linkNode // {linkNode: [2]} => [2]
            // if (firstCoordinateLinkNode?.length <= 1) {
            //   // ?

            //   // 将mapPoints中删除点
            //   this.mapPoints = this.mapPoints.filter(
            //     (point) =>
            //       JSON.stringify([point.xCoord, point.yCoord]) !== JSON.stringify(firstCoordinate),
            //   )
            //   // 其他点的linkNode中删除关联点
            //   this.mapPoints.forEach((point) => {
            //     const id = firstFeature.getId()
            //     if (point.linkNode.includes(id)) {
            //       point.linkNode = point.linkNode.filter((linkId) => linkId !== id)
            //     }
            //   })
            //   this.vectorSource.removeFeature(firstFeature)
            // }

            // // 以下是last
            // const lastCoordinateLinkNode = this.mapPoints
            //   .find(
            //     (point) =>
            //       JSON.stringify([point.xCoord, point.yCoord]) === JSON.stringify(lastCoordinate),
            //   )
            //   .map((point) => point.linkNode)?.linkNode
            // if (lastCoordinateLinkNode?.length <= 1) {
            //   const lastFeature = this.vectorSource.getClosestFeatureToCoordinate(
            //     lastCoordinate,
            //     (feature) => feature.getGeometry().getType() === 'Point',
            //   )
            //   this.mapPoints = this.mapPoints.filter(
            //     (point) =>
            //       JSON.stringify([point.xCoord, point.yCoord]) !== JSON.stringify(lastCoordinate),
            //   )
            //   this.mapPoints.forEach((point) => {
            //     const id = lastFeature.getId()
            //     if (point.linkNode.includes(id)) {
            //       point.linkNode = point.linkNode.filter((linkId) => linkId !== id)
            //     }
            //   })
            //   this.vectorSource.removeFeature(lastFeature)
            // }

            // this.vectorSource.removeFeature(selectedFeatures)
          }
        }
        // })
        // .catch(() => {
        //   console.log('取消删除')
        // })
      }
    })

    const addContextMenu = (map) => {
      if (this.overlayInstance) {
        return
      }
      const deleteButton = document.createElement('button')
      deleteButton.innerText = '删除此线'
      deleteButton.style.display = 'inline-block'
      deleteButton.onclick = () => {
        // 删除要素
        this.deleteMethod?.()
        // 隐藏按钮
        this.overlayInstance.setPosition(undefined)
      }
      const overlay = new Overlay({
        element: deleteButton,
        stopEvent: true,
      })
      this.overlayInstance = overlay
      map.addOverlay(overlay)
    }

    addContextMenu(this.oMap)

    map.on('click', (e) => {
      // console.log('map click', e)
    })
    map.on('contextmenu', (e) => {
      e.preventDefault()
      // drawPoint.finishDrawing()
      drawLine.abortDrawing()
      setTimeout(() => {
        this.getPointCoordinates()
      }, 2000)
    })
    map.on('change', (e) => {
      // console.log('map change', e)
    })
    map.on('pointerdrag', (e) => {
      // console.log('map pointerdrag', e)
    })

    const addMoveTooltip = (map) => {
      if (this.moveOverlayInstance) {
        return
      }
      // const toolTip = document.createElement('div')
      // toolTip.innerText = '这里放一点提示语'
      // toolTip.style.position = 'absolute';
      // toolTip.style.display = 'block'
      // toolTip.style.whiteSpace = 'nowrap'
      const toolTip = document.getElementById('moveTooltip')
      const overlay = new Overlay({
        element: toolTip,
        stopEvent: true,
      })
      this.moveOverlayInstance = overlay
      this.moveTooltip = toolTip
      map.addOverlay(overlay)
    }

    addMoveTooltip(this.oMap)

    map.on('pointermove', (e) => {
      console.log('pointermove 能画吗', e, drawPoint.condition_(e))
      const pixel = e.pixel
      const coordinate = e.coordinate
      const overlayCoordinate = map.getCoordinateFromPixel([pixel[0] + 10, pixel[1] + 10])
      this.moveOverlayInstance.setPosition(overlayCoordinate)
    })
  }

  getPointCoordinates() {
    const vectorSource = this.vectorSource
    const features = vectorSource.getFeatures()
    const pointFeatures = features.filter((feature) => feature.getGeometry().getType() === 'Point')
    // 找到pointFeatures中坐标点一样的点
    const uniquePointFeature = pointFeatures.reduce((arr, cur) => {
      const coordinates = cur.getGeometry().getCoordinates()
      const id = cur.getId()
      const index = arr.findIndex(
        (item) =>
          JSON.stringify(item.getGeometry().getCoordinates()) === JSON.stringify(coordinates),
      )
      if (index === -1) {
        arr.push(cur)
      }
      return arr
    }, [])
    const uniqueId = uniquePointFeature.map((feature) => feature.getId())
    pointFeatures.forEach((feature) => {
      if (!uniqueId.includes(feature.getId())) {
        this.vectorSource.removeFeature(feature)
      }
    })
    this.pointCoordinates = uniquePointFeature.map((feature, index) => {
      // 某个点坐标
      const coordinates = feature.getGeometry().getCoordinates()
      // 点关联的线
      const lineStringNodes = vectorSource
        .getFeaturesAtCoordinate(coordinates)
        .filter((feature1) => feature1.getGeometry().getType() === 'LineString')
      // 点关联点
      let linkNode = lineStringNodes.map((feature4) => {
        // 线的端点
        return JSON.stringify(feature4.getGeometry().getFirstCoordinate()) !==
          JSON.stringify(coordinates)
          ? vectorSource
              .getClosestFeatureToCoordinate(
                feature4.getGeometry().getFirstCoordinate(),
                (feature) => feature.getGeometry().getType() === 'Point',
              )
              .getId()
          : vectorSource
              .getClosestFeatureToCoordinate(
                feature4.getGeometry().getLastCoordinate(),
                (feature) => feature.getGeometry().getType() === 'Point',
              )
              .getId()
      })
      linkNode = [...new Set(linkNode)]
      return {
        id: feature.getId(),
        xCoord: coordinates[0],
        yCoord: coordinates[1],
        linkNode,
      }
    })
    this.mapPoints = this.pointCoordinates
    return this.pointCoordinates
  }
  clear() {
    this.vectorSource?.clear()
  }
  add() {
    // this.drawPoint.setActive(true)
    // this.drawLine.setActive(true)
    // this.modifyInteraction.setActive(false)
    // this.selectInteraction.setActive(false)
  }
  modify() {
    // this.drawPoint.setActive(false)
    // this.drawLine.setActive(false)
    // this.modifyInteraction.setActive(true)
    // this.selectInteraction.setActive(true)
  }
  updateMapPoints(mapPoints) {
    this.mapPoints = mapPoints
    this.clear()
    mapPoints.forEach((point) => {
      const { xCoord, yCoord, id } = point
      const pointFeature = new Feature(new Point([xCoord, yCoord]))
      pointFeature.setId(id)
      this.vectorSource.addFeature(pointFeature)
    })
    mapPoints.forEach((point) => {
      const { xCoord, yCoord, linkNode } = point
      if (linkNode?.length) {
        linkNode.forEach((id) => {
          const lineFeature = new Feature(
            new LineString([
              [xCoord, yCoord],
              this.vectorSource.getFeatureById(id).getGeometry().getCoordinates(),
            ]),
          )
          this.vectorSource.addFeature(lineFeature)
        })
      }
    })
  }

  updateDraw(isDrawing) {
    if (isDrawing) {
      this.addInteractionRoad(this.oMap)
    } else {
      this.removeInteractionRoad(this.oMap)
    }
  }

  addInteractionRoad(map) {
    this.interactions.forEach((interaction) => {
      map.addInteraction(interaction)
    })
  }
  removeInteractionRoad(map) {
    this.interactions.forEach((interaction) => {
      map.removeInteraction(interaction)
    })
  }
}
