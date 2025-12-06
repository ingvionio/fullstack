import { useEffect } from 'react';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';

export const useMapInteractions = (map, vectorSource, mode) => {
  useEffect(() => {
    if (!map || !vectorSource) return;

    // Define interactions
    let drawInteraction;
    let modifyInteraction;
    let snapInteraction;

    // 'add' mode is now handled via right-click context menu, 
    // but keeping the logic if 'add' mode is ever passed again, 
    // though we expect 'view' or 'edit'.
    if (mode === 'add') {
      drawInteraction = new Draw({
        source: vectorSource,
        type: 'Point',
      });
      map.addInteraction(drawInteraction);
    } else if (mode === 'edit') {
      modifyInteraction = new Modify({ source: vectorSource });
      snapInteraction = new Snap({ source: vectorSource });
      
      map.addInteraction(modifyInteraction);
      map.addInteraction(snapInteraction);
    }

    // Cleanup function to remove interactions when mode changes or component unmounts
    return () => {
      if (drawInteraction) map.removeInteraction(drawInteraction);
      if (modifyInteraction) map.removeInteraction(modifyInteraction);
      if (snapInteraction) map.removeInteraction(snapInteraction);
    };
  }, [map, vectorSource, mode]);
};
