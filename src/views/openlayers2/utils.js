import Map from 'ol/Map.js'
import View from 'ol/View.js'
import Draw from 'ol/interaction/Draw.js'
import Modify from 'ol/interaction/Modify.js'
import Snap from 'ol/interaction/Snap.js'
import TileLayer from 'ol/layer/Tile.js'
import VectorLayer from 'ol/layer/Vector.js'
import { get } from 'ol/proj.js'
import OSM from 'ol/source/OSM.js'
import VectorSource from 'ol/source/Vector.js'

const init = () => {
  const raster = new TileLayer({
    source: new OSM(),
  })

  const source = new VectorSource()
  const vector = new VectorLayer({
    source: source,
    style: {
      'fill-color': 'rgba(255, 255, 255, 0.2)',
      'stroke-color': '#ffcc33',
      'stroke-width': 2,
      'circle-radius': 7,
      'circle-fill-color': '#ffcc33',
    },
  })

  // Limit multi-world panning to one world east and west of the real world.
  // Geometry coordinates have to be within that range.
  const extent = get('EPSG:3857').getExtent().slice()
  extent[0] += extent[0]
  extent[2] += extent[2]
  const map = new Map({
    layers: [raster, vector],
    target: 'map',
    view: new View({
      center: [-11000000, 4600000],
      zoom: 4,
      extent,
    }),
  })

  const modify = new Modify({ source: source })
  map.addInteraction(modify)

  let draw, snap, draw2 // global so we can remove them later
  const typeSelect = document.getElementById('type')

  function addInteractions() {
    draw = new Draw({
      source: source,
      type: 'LineString'
    })
    draw2 = new Draw({
      source: source,
      type: 'Point'
    })
    map.addInteraction(draw)
    map.addInteraction(draw2)
    snap = new Snap({ source: source })
    map.addInteraction(snap)
  }

  /**
   * Handle change event.
   */
  // typeSelect?.onchange = function () {
  //   map.removeInteraction(draw)
  //   map.removeInteraction(snap)
  //   addInteractions()
  // }

  addInteractions()
}

export default init