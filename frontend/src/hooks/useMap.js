import { useEffect, useState, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';

export const useMap = (containerRef) => {
  const [map, setMap] = useState(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialMap = new Map({
        target: containerRef.current,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
              attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }),
          }),
        ],
        view: new View({
          center: fromLonLat([37.617348, 54.193122]),
          zoom: 15,
        }),
      });
      
      mapInstanceRef.current = initialMap;
      setMap(initialMap);
    } else {
        mapInstanceRef.current.setTarget(containerRef.current);
    }

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setTarget(null);
        }
    };
  }, []);

  return map;
};
