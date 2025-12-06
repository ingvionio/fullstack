# OpenLayers React Map Implementation Plan

This plan outlines the steps to build a React application with an interactive OpenLayers map, featuring point addition and editing capabilities.

## 1. Project Setup & Structure

### Dependencies
Install the OpenLayers package:
```bash
npm install ol
```
(Optional) Install types if using TypeScript:
```bash
npm install --save-dev @types/ol
```

### Recommended Directory Structure
Organize map-related logic to keep components clean:
```
src/
  components/
    Map/
      MapComponent.jsx      # Main map container
      MapControls.jsx       # UI for toggling modes (Add/Edit)
  hooks/
    useMap.js               # Hook for initializing the map
    useMapInteractions.js   # Hook for handling interactions (Draw, Modify)
  utils/
    mapStyles.js           # Custom styles for markers/features
  App.jsx
```

## 2. Map Initialization

### `MapComponent.jsx`
The map needs a target DOM element. Use a `ref` to attach the map instance to a `div`.

**Key Steps:**
1.  Create a `ref` for the map container (`mapRef`).
2.  Use `useEffect` to initialize the map only once.
3.  Store the `map` instance in a `ref` or state to prevent re-initialization.
4.  Clean up the map on component unmount (`map.setTarget(null)`).

**Code Snippet (Map Initialization):**
```javascript
// src/hooks/useMap.js
import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

export const useMap = (containerRef) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!containerRef.current || map) return;

    const initialMap = new Map({
      target: containerRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]), // Default center
        zoom: 2,
      }),
    });

    setMap(initialMap);

    return () => initialMap.setTarget(null);
  }, [containerRef, map]);

  return map;
};
```

## 3. Managing Map State (Points)

Use a `VectorLayer` with a `VectorSource` to store markers.

-   **Vector Source**: Holds the features (points).
-   **Vector Layer**: Renders the source on the map.

This should be added to the map during initialization or in a separate `useEffect`.

## 4. Adding Points (Markers)

To add points by clicking, use the `Draw` interaction from `ol/interaction`.

**Logic:**
1.  Enable "Add Mode" in the UI.
2.  Add a `Draw` interaction configured for `type: 'Point'`.
3.  When a point is drawn, it is automatically added to the `VectorSource`.
4.  Listen to the `drawend` event if you need to capture coordinates immediately.

**Snippet:**
```javascript
import Draw from 'ol/interaction/Draw';

// In interaction hook
const addInteraction = new Draw({
  source: vectorSource,
  type: 'Point',
});
map.addInteraction(addInteraction);
```

## 5. Editing Points (Move/Update)

To edit existing points, use the `Modify` and `Snap` interactions.

**Logic:**
1.  Enable "Edit Mode".
2.  Add `Modify` interaction linked to the same `VectorSource`.
3.  Add `Snap` interaction to make clicking/dragging easier.
4.  The `Modify` interaction handles dragging automatically.
5.  Listen to `modifyend` to sync changes back to your React state (e.g., update a list of coordinates).

**Snippet:**
```javascript
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';

const modify = new Modify({ source: vectorSource });
map.addInteraction(modify);

const snap = new Snap({ source: vectorSource });
map.addInteraction(snap);

modify.on('modifyend', (event) => {
  // Loop through features to get updated geometry
  event.features.forEach(feature => {
    const coords = feature.getGeometry().getCoordinates();
    console.log('New coordinates:', coords);
  });
});
```

## 6. Organizing Map Logic (Architecture)

### Custom Hooks Approach
-   **`useMap`**: Handles the basic map setup (View, TileLayer). Returns the `map` instance.
-   **`useMapLayers`**: Accepts the `map` instance and adds the VectorLayer for markers. Returns the `VectorSource`.
-   **`useMapInteractions`**: Accepts `map` and `VectorSource`. Manages the active interaction (Draw vs. Modify) based on a `mode` prop ('view', 'add', 'edit').

### Component Logic (`MapComponent`)
```javascript
const MapComponent = () => {
  const mapElement = useRef();
  const map = useMap(mapElement);
  const vectorSource = useVectorLayer(map); // Custom hook to add vector layer
  
  const [mode, setMode] = useState('view'); // 'view', 'add', 'edit'
  
  useMapInteractions(map, vectorSource, mode);

  return (
    <div>
      <div ref={mapElement} style={{ width: '100%', height: '400px' }} />
      <button onClick={() => setMode('add')}>Add Point</button>
      <button onClick={() => setMode('edit')}>Edit Points</button>
    </div>
  );
};
```

## 7. Implementation Checklist

1.  [ ] **Initialize**: Create `MapWrapper` component and initialize `ol/Map`.
2.  [ ] **Layers**: Add `TileLayer` (OSM) and `VectorLayer` (for features).
3.  [ ] **Interactions**: Implement toggling between `Draw` (add) and `Modify` (edit) interactions.
4.  [ ] **State Sync**: Ensure React state tracks the features if you need to save them (e.g., to a backend).
5.  [ ] **Styling**: Import `ol/ol.css` in `main.jsx` or `App.css` to ensure map controls render correctly.

## 8. Styling Note
Don't forget to import the OpenLayers CSS!
```javascript
// main.jsx or App.jsx
import 'ol/ol.css';
```

