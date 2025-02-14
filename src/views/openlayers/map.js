import Map from 'ol/Map'
import View from 'ol/View'
import { defaults as interDefaults, Draw, Modify, Snap, Select, Interaction } from 'ol/interaction'
import { defaults as defaultsControls } from 'ol/control'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'

export default class {
  constructor(opt) {
    // this.sdk = opt.sdk
    // this.$event = opt.sdk.$event
    // this.registor = opt.sdk.registor
    // this.code = opt.sdk.data.app.code
    this.vueDomain = null
    this.oMap = null
    this.isDrawing = false
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
          width: 2,
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
    })
    const drawLine = new Draw({
      source: vectorSource,
      type: 'LineString',
    })
    const modifyInteraction = new Modify({ source: vectorSource })
    const snapInteraction = new Snap({ source: vectorSource })
    const selectInteraction = new Select({ layers: [vectorLayer] }) // 可以不要layers

    snapInteraction.on('snap', (e) => {
      console.log('snap', e)
    })

    this.interactions = [drawPoint, drawLine, modifyInteraction, snapInteraction, selectInteraction]
    this.vectorSource = vectorSource
    this.vectorLayer = vectorLayer
    this.drawPoint = drawPoint
    this.drawLine = drawLine
    this.modifyInteraction = modifyInteraction
    this.snapInteraction = snapInteraction
    this.selectInteraction = selectInteraction

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
    })
    drawLine.on('drawabort', (e) => {
      console.log('drawLine drawabort', e)
      drawLine.removeLastPoint()
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

    modifyInteraction.on('modifystart', (e) => {
      console.log('modifyInteraction modifystart', e)
    })
    modifyInteraction.on('modifyend', (e) => {
      console.log('modifyInteraction modifyend', e)
    })

    selectInteraction.on('select', (e) => {
      console.log('selectInteraction select', e)
      const selectedFeatures = e.selected[0]
      if (selectedFeatures) {
        this.vueDomain
          .$confirm('是否删除选中的要素', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
          .then(() => {
            const lineFeatures = selectedFeatures.getGeometry().getType() === 'LineString'
            if (lineFeatures) {
              const firstCoordinate = selectedFeatures.getGeometry().getFirstCoordinate()
              const firstCoordinateLinkNode = this.mapPoints
                .filter(
                  (point) =>
                    JSON.stringify([point.xCoord, point.yCoord]) ===
                    JSON.stringify(firstCoordinate),
                )
                .map((point) => point.linkNode)[0]
              if (firstCoordinateLinkNode?.length <= 1) {
                const firstFeature = this.vectorSource.getClosestFeatureToCoordinate(
                  firstCoordinate,
                  (feature) => feature.getGeometry().getType() === 'Point',
                )
                this.mapPoints = this.mapPoints.filter(
                  (point) =>
                    JSON.stringify([point.xCoord, point.yCoord]) !==
                    JSON.stringify(firstCoordinate),
                )
                this.mapPoints.forEach((point) => {
                  const id = firstFeature.getId()
                  if (point.linkNode.includes(id)) {
                    point.linkNode = point.linkNode.filter((linkId) => linkId !== id)
                  }
                })
                this.vectorSource.removeFeature(firstFeature)
              }

              // 以下是last
              const lastCoordinate = selectedFeatures.getGeometry().getLastCoordinate()
              const lastCoordinateLinkNode = this.mapPoints
                .filter(
                  (point) =>
                    JSON.stringify([point.xCoord, point.yCoord]) === JSON.stringify(lastCoordinate),
                )
                .map((point) => point.linkNode)[0]
              if (lastCoordinateLinkNode?.length <= 1) {
                const lastFeature = this.vectorSource.getClosestFeatureToCoordinate(
                  lastCoordinate,
                  (feature) => feature.getGeometry().getType() === 'Point',
                )
                this.mapPoints = this.mapPoints.filter(
                  (point) =>
                    JSON.stringify([point.xCoord, point.yCoord]) !== JSON.stringify(lastCoordinate),
                )
                this.mapPoints.forEach((point) => {
                  const id = lastFeature.getId()
                  if (point.linkNode.includes(id)) {
                    point.linkNode = point.linkNode.filter((linkId) => linkId !== id)
                  }
                })
                this.vectorSource.removeFeature(lastFeature)
              }
            }
            this.vectorSource.removeFeature(selectedFeatures)
          })
          .catch(() => {
            console.log('取消删除')
          })
      }
    })

    map.on('click', (e) => {
      console.log('map click', e)
    })
    map.on('contextmenu', (e) => {
      console.log('map contextmenu', e)
      e.preventDefault()
      drawPoint.finishDrawing()
      drawLine.finishDrawing()
      this.getPointCoordinates()
    })
    map.on('change', (e) => {
      console.log('map change', e)
    })
    map.on('pointerdrag', (e) => {
      console.log('map pointerdrag', e)
    })
    map.on('pointermove', (e) => {
      console.log('map pointermove', e)
    })
  }

  getPointCoordinates() {
    const vectorSource = this.vectorSource
    const features = vectorSource.getFeatures()
    const pointFeatures = features.filter((feature) => feature.getGeometry().getType() === 'Point')
    this.pointCoordinates = pointFeatures.map((feature, index) => {
      const coordinates = feature.getGeometry().getCoordinates()
      const lineStringNodes = vectorSource
        .getFeaturesAtCoordinate(coordinates)
        .filter((feature1) => feature1.getGeometry().getType() === 'LineString')
      let linkNode = lineStringNodes.map((feature4) =>
        JSON.stringify(feature4.getGeometry().getFirstCoordinate() !== JSON.stringify(coordinates))
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
              .getId(),
      )
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
    this.drawPoint.setActive(true)
    this.drawLine.setActive(true)
    this.modifyInteraction.setActive(false)
    this.selectInteraction.setActive(false)
  }
  modify() {
    this.drawPoint.setActive(false)
    this.drawLine.setActive(false)
    this.modifyInteraction.setActive(true)
    this.selectInteraction.setActive(true)
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
