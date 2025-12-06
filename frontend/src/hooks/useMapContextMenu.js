import { useEffect, useState } from 'react';

export const useMapContextMenu = (map) => {
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [clickCoordinates, setClickCoordinates] = useState(null);

  useEffect(() => {
    if (!map) return;

    const handleContextMenu = (evt) => {
      evt.preventDefault(); // Prevent default browser context menu
      
      const pixel = map.getEventPixel(evt);
      if (pixel) {
        setContextMenuPosition({ x: pixel[0], y: pixel[1] });
        setClickCoordinates(map.getCoordinateFromPixel(pixel));
      }
      return false;
    };

    const handleMapClick = (evt) => {
      const pixel = evt.pixel;
      const hit = map.hasFeatureAtPixel(pixel);

      if (hit) {
        // Clicked a feature - close context menu so Popup can show
        setContextMenuPosition(null);
      } else {
        // Detect interaction type
        // 'mouse' indicates a standard mouse click
        // 'touch' or 'pen' indicates mobile/tablet interaction
        const isMouse = evt.originalEvent && evt.originalEvent.pointerType === 'mouse';

        if (isMouse) {
            // Desktop behavior: Left click closes menu, does NOT open it.
            // Right click (contextmenu event) handles opening.
            setContextMenuPosition(null);
        } else {
            // Mobile behavior: Tap toggles the menu.
            setContextMenuPosition((prev) => {
                if (prev) {
                    // If open, close it
                    return null;
                } else {
                    // If closed, open it
                    setClickCoordinates(evt.coordinate);
                    return { x: pixel[0], y: pixel[1] };
                }
            });
        }
      }
    };

    const handleMoveStart = () => {
        setContextMenuPosition(null);
    };

    const viewport = map.getViewport();
    viewport.addEventListener('contextmenu', handleContextMenu);
    map.on('click', handleMapClick);
    map.on('movestart', handleMoveStart);

    return () => {
      viewport.removeEventListener('contextmenu', handleContextMenu);
      map.un('click', handleMapClick);
      map.un('movestart', handleMoveStart);
    };
  }, [map]);

  return {
    contextMenuPosition,
    clickCoordinates,
    closeContextMenu: () => setContextMenuPosition(null),
  };
};
