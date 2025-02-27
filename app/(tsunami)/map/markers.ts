import L from 'leaflet';

export class MapMarkers {
  private map: L.Map;
  private marker: L.Marker | null = null;
  private rectangle: L.Rectangle | null = null;

  constructor(map: L.Map) {
    this.map = map;
    L.Icon.Default.mergeOptions({
      iconUrl: '/markers/marker-icon.png',
      iconRetinaUrl: '/markers/marker-icon-2x.png',
      shadowUrl: '/markers/marker-shadow.png',
    });
  }

  public updateMarkers(lat: number, lng: number) {
    this.clearMarkers();

    this.marker = L.marker([lat, lng]).addTo(this.map);
    const bounds = L.latLngBounds(
      [lat - 0.5, lng - 0.5],
      [lat + 0.5, lng + 0.5],
    );

    this.rectangle = L.rectangle(bounds, {
      color: '#2563eb',
      weight: 2,
      fillOpacity: 0.1,
    }).addTo(this.map);
  }

  private clearMarkers() {
    this.marker?.remove();
    this.rectangle?.remove();
    this.marker = null;
    this.rectangle = null;
  }

  public destroy() {
    this.clearMarkers();
  }
}
