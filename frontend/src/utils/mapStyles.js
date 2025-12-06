import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';

// Cache styles for better performance
const styleCache = {};
const pointStyleCache = {};

/**
 * WebGL Points Layer style for high-performance rendering
 * Uses flat style format for WebGLPointsLayer
 * Color is based on the 'mark' attribute (1-5 scale)
 */
export const webglPointStyle = {
  'circle-radius': 8,
  // Derive color from mark directly in the shader with a simple expression
  'circle-fill-color': [
    'case',
    ['all', ['has', 'mark'], ['>', ['get', 'mark'], 0]],
    [
      'interpolate',
      ['linear'],
      ['get', 'mark'],
      1, '#FF0000',
      2, '#FF6600',
      3, '#FFD700',
      4, '#90EE90',
      5, '#00FF00'
    ],
    '#808080'
  ],
  'circle-stroke-color': '#ffffff',
  'circle-stroke-width': 2,
  'circle-opacity': 0.9,
};

/**
 * Получить цвет точки в зависимости от оценки (mark)
 * @param {number} mark - Оценка от 1 до 5
 * @returns {string} - HEX цвет
 */
export const getPointColor = (mark) => {
  // Если mark = null или undefined, используем серый цвет
  if (mark === null || mark === undefined) {
    return '#808080'; // Серый для точек без оценки
  }
  
  // Преобразуем mark в число, если это строка
  const numMark = typeof mark === 'string' ? parseFloat(mark) : Number(mark);
  
  // Если mark = 0 или NaN, используем серый цвет
  if (isNaN(numMark) || numMark === 0) {
    return '#808080'; // Серый для точек без оценки
  }
  
  // Нормализуем mark к диапазону 1-5
  const normalizedMark = Math.max(1, Math.min(5, numMark));
  
  // Цветовая шкала от красного (1) через желтый (3) к зеленому (5)
  const colors = {
    1: '#FF0000', // Красный
    2: '#FF6600', // Оранжево-красный
    3: '#FFD700', // Желтый
    4: '#90EE90', // Светло-зеленый
    5: '#00FF00', // Зеленый
  };
  
  // Если mark не целое число, интерполируем между цветами
  if (normalizedMark === Math.floor(normalizedMark)) {
    return colors[normalizedMark];
  }
  
  // Интерполяция между соседними цветами
  const floor = Math.floor(normalizedMark);
  const ceil = Math.ceil(normalizedMark);
  const fraction = normalizedMark - floor;
  
  const color1 = colors[floor];
  const color2 = colors[ceil];
  
  // Простая интерполяция RGB
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  const r = Math.round(r1 + (r2 - r1) * fraction);
  const g = Math.round(g1 + (g2 - g1) * fraction);
  const b = Math.round(b1 + (b2 - b1) * fraction);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Получить стиль для отдельной точки на основе оценки
 * @param {number} mark - Оценка точки
 * @returns {Style} - Стиль точки
 */
export const getPointStyle = (mark) => {
  const color = getPointColor(mark);
  const cacheKey = `point_${mark}`;
  
  if (!pointStyleCache[cacheKey]) {
    pointStyleCache[cacheKey] = new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color }),
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
      }),
    });
  }
  
  return pointStyleCache[cacheKey];
};

export const clusterStyle = (feature) => {
  // Check if it's a cluster feature or a raw feature
  const features = feature.get('features');
  const size = features ? features.length : 1;

  if (size > 1) {
    // Cluster style - используем кэш для кластеров
    let style = styleCache[size];
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10 + Math.min(size, 20), // Dynamic size
          stroke: new Stroke({
            color: '#fff',
          }),
          fill: new Fill({
            color: '#3399CC',
          }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff',
          }),
          scale: 1.2,
        }),
      });
      styleCache[size] = style;
    }
    return style;
  } else {
    // Single point style - цвет зависит от оценки
    // Если это кластер с одной точкой, берем mark из первой точки
    let mark = null;
    let pointName = null;
    
    if (features && features.length === 1) {
      // Это кластер с одной точкой - берем данные из вложенной feature
      const innerFeature = features[0];
      mark = innerFeature.get('mark');
      pointName = innerFeature.get('name');
    } else {
      // Это обычная точка
      mark = feature.get('mark');
      pointName = feature.get('name');
    }
    
    // Reuse cached point styles by mark to avoid re-creating Style objects
    return getPointStyle(mark);
  }
};
