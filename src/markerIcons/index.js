import leaflet from "leaflet";
import currentMarkerIconUrl from "./current-marker-icon-2x.png";
import markerShadowUrl from "./marker-shadow.png";

export const currentMarkerIcon = leaflet.icon({
  iconUrl: currentMarkerIconUrl,
  iconAnchor: [12, 41],
  iconSize: [25, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl: markerShadowUrl,
  tooltipAnchor: [16, -28],
});
