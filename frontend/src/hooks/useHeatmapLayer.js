import { useEffect, useState, useRef } from 'react';
import HeatmapLayer from 'ol/layer/Heatmap';

/**
 * Custom hook to create and manage a heatmap layer
 * @param {Map} map - OpenLayers map instance
 * @param {VectorSource} vectorSource - Vector source with point features
 * @returns {Object} - { heatmapLayer, isHeatmapVisible, toggleHeatmap }
 */
export const useHeatmapLayer = (map, vectorSource) => {
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(false);
  const positiveHeatmapLayerRef = useRef(null);
  const negativeHeatmapLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !vectorSource) return;

    const commonHeatmapConfig = {
      source: vectorSource,
      blur: 50, // Larger blur for smoother blending
      radius: 40, // Bigger radius for stronger coverage
      visible: false, // Initially hidden
    };

    // Layer for marks >= 3 (existing behaviour)
    const positiveHeatmapLayer = new HeatmapLayer({
      ...commonHeatmapConfig,
      opacity: 0.55, // Slightly transparent for softer greens
      weight: function (feature) {
        const mark = feature.get('mark');
        if (mark === null || mark === undefined || Number.isNaN(mark) || mark < 3) {
          return 0;
        }
        // Map mark from [3, 5] to (0, 1]
        const normalizedWeight = (mark - 3) / 2; // [0, 1]
        return Math.min(Math.max(normalizedWeight, 0.05), 1);
      },
      gradient: [
        '#2166ac', // Deep blue (mark ~3)
        '#4393c3',
        '#92c5de',
        '#d1e5f0',
        '#d9ef8b', // Yellow (mark ~4)
        '#a6d96a',
        '#59F059', // Green (mark ~5)
      ],
    });

    // Layer for marks < 3 (new red heatmap)
    const negativeHeatmapLayer = new HeatmapLayer({
      ...commonHeatmapConfig,
      weight: function (feature) {
        const mark = feature.get('mark');
        if (mark === null || mark === undefined || Number.isNaN(mark)) {
          return 0;
        }
        if (mark >= 3) {
          return 0; // handled by positive layer
        }
        // Stronger weight for worse marks (0 → 1, 3 → 0)
        const clampedMark = Math.max(Math.min(mark, 3), 0);
        const normalizedWeight = (3 - clampedMark) / 3; // [0,1]
        return Math.min(Math.max(normalizedWeight, 0.05), 1);
      },
      // Shades of red/orange for low scores
      gradient: [
        '#800026',
        '#bd0026',
        '#e31a1c',
        '#fc4e2a',
        '#fd8d3c',
        '#feb24c',
        '#fed976',
      ],
    });

    negativeHeatmapLayerRef.current = negativeHeatmapLayer;
    positiveHeatmapLayerRef.current = positiveHeatmapLayer;

    // Add both layers so they visually merge into a single heatmap
    map.addLayer(negativeHeatmapLayer);
    map.addLayer(positiveHeatmapLayer);
    negativeHeatmapLayer.setZIndex(0);
    positiveHeatmapLayer.setZIndex(1);

    return () => {
      if (positiveHeatmapLayerRef.current) {
        map.removeLayer(positiveHeatmapLayerRef.current);
        positiveHeatmapLayerRef.current = null;
      }
      if (negativeHeatmapLayerRef.current) {
        map.removeLayer(negativeHeatmapLayerRef.current);
        negativeHeatmapLayerRef.current = null;
      }
    };
  }, [map, vectorSource]);

  // Function to toggle heatmap visibility
  const toggleHeatmap = () => {
    const newVisibility = !isHeatmapVisible;
    if (positiveHeatmapLayerRef.current) {
      positiveHeatmapLayerRef.current.setVisible(newVisibility);
    }
    if (negativeHeatmapLayerRef.current) {
      negativeHeatmapLayerRef.current.setVisible(newVisibility);
    }
    setIsHeatmapVisible(newVisibility);
  };

  return {
    heatmapLayer: positiveHeatmapLayerRef.current,
    negativeHeatmapLayer: negativeHeatmapLayerRef.current,
    isHeatmapVisible,
    toggleHeatmap,
  };
};
