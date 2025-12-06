import { useEffect } from 'react';
import { boundingExtent } from 'ol/extent';

export const useMapClick = (map, popupRef, setPopupData) => {
  useEffect(() => {
    if (!map || !popupRef.current) return;

    const handleMapClick = (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      
      // Find the overlay instance associated with the popupRef
      const overlays = map.getOverlays();
      let overlay;
      overlays.forEach(o => {
          if (o.getElement() === popupRef.current) {
              overlay = o;
          }
      });

      if (overlay) {
          overlay.setPosition(undefined); // Close by default
          if (setPopupData) setPopupData(null);
      }

      if (feature && overlay) {
        const clusterMembers = feature.get('features');
        
        if (clusterMembers && clusterMembers.length > 1) {
            // It is a cluster with multiple points, zoom in
            const extent = boundingExtent(
                clusterMembers.map((r) => r.getGeometry().getCoordinates())
            );
            map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
        } else {
            // Single point (or cluster of size 1)
            // If it's a cluster of 1, get the original feature from 'features' array
            const actualFeature = clusterMembers ? clusterMembers[0] : feature;
            
            const coordinates = actualFeature.getGeometry().getCoordinates();
            const properties = actualFeature.getProperties();
            
            overlay.setPosition(coordinates);
            
            if (setPopupData) {
                setPopupData({
                    coordinates,
                    name: properties.name || 'Неизвестная точка',
                    id: properties.id,
                    industry_id: properties.industry_id,
                    sub_industry_id: properties.sub_industry_id,
                    mark: properties.mark || 0,
                });
            }
        }
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.un('click', handleMapClick);
    };
  }, [map, popupRef, setPopupData]);
};
