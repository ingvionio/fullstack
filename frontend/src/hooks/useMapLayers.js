import { useEffect, useState, useRef, useCallback } from 'react';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import VectorLayer from 'ol/layer/Vector';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import { clusterStyle, webglPointStyle } from '../utils/mapStyles';

export const useMapLayers = (map, mode) => {
  // Persist the actual data source across re-renders
  const [vectorSource] = useState(() => new VectorSource());
  const [arePointsVisible, setArePointsVisible] = useState(true);
  const vectorLayerRef = useRef(null);
  const clusterSourceRef = useRef(null);
  const webglLayerRef = useRef(null);
  const pointsVisibleRef = useRef(true);

  // Switch to WebGL rendering at higher zoom to avoid canvas overload
  const HIGH_ZOOM_THRESHOLD = 14;

  useEffect(() => {
    if (!map) return;

    // Create a Cluster source that wraps the vector source
    // This dramatically improves performance by grouping nearby points
    // distance: pixels between features that are clustered together
    const clusterSource = new Cluster({
      distance: 40, // Cluster points within 40 pixels of each other
      minDistance: 20, // Minimum distance between clusters
      source: vectorSource,
    });
    
    clusterSourceRef.current = clusterSource;

    // Use VectorLayer with clustering for efficient rendering of many points
    // Clustering reduces the number of rendered features at lower zoom levels
    const vectorLayer = new VectorLayer({
      source: clusterSource,
      style: clusterStyle,
      renderMode: 'image',
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      declutter: true,
    });

    // WebGL layer uses raw features (no clustering) for high zoom levels
    const webglLayer = new WebGLPointsLayer({
      source: vectorSource,
      style: webglPointStyle,
      visible: false, // toggled on at high zoom
    });

    vectorLayerRef.current = vectorLayer;
    webglLayerRef.current = webglLayer;
    map.addLayer(vectorLayer);
    map.addLayer(webglLayer);

    // Toggle between clustered canvas layer and WebGL layer based on zoom and visibility flag
    const updateLayerVisibility = () => {
      const zoom = map.getView().getZoom() || 0;
      const showPoints = pointsVisibleRef.current;

      if (!showPoints) {
        vectorLayer.setVisible(false);
        webglLayer.setVisible(false);
        map.renderSync?.();
        return;
      }

      const useWebGL = zoom >= HIGH_ZOOM_THRESHOLD;
      vectorLayer.setVisible(!useWebGL);
      webglLayer.setVisible(useWebGL);
      map.renderSync?.();
    };

    map.getView().on('change:resolution', updateLayerVisibility);
    
    // Initial update
    updateLayerVisibility();

    return () => {
      map.getView().un('change:resolution', updateLayerVisibility);
      map.removeLayer(vectorLayer);
      map.removeLayer(webglLayer);
      vectorLayerRef.current = null;
      webglLayerRef.current = null;
      clusterSourceRef.current = null;
    };
  }, [map, vectorSource, mode]);

  // Function to toggle points visibility
  const togglePointsVisibility = useCallback(() => {
    const newVisibility = !arePointsVisible;
    setArePointsVisible(newVisibility);
    pointsVisibleRef.current = newVisibility;

    const vectorLayer = vectorLayerRef.current;
    const webglLayer = webglLayerRef.current;
    if (vectorLayer && webglLayer && map) {
      const zoom = map.getView()?.getZoom() || 0;
      const useWebGL = zoom >= HIGH_ZOOM_THRESHOLD;
      if (!newVisibility) {
        vectorLayer.setVisible(false);
        webglLayer.setVisible(false);
      } else {
        vectorLayer.setVisible(!useWebGL);
        webglLayer.setVisible(useWebGL);
      }
      map.renderSync?.();
    }
  }, [arePointsVisible, map]);

  return { vectorSource, arePointsVisible, togglePointsVisibility };
};
