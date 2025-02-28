import L from 'leaflet';

export class MapMarkers {
  private map: L.Map;
  private marker: L.Marker | null = null;
  private rectangle: L.Rectangle | null = null;

  constructor(map: L.Map) {
    this.map = map;
  }

  public clearMarkers() {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    if (this.rectangle) {
      this.rectangle.remove();
      this.rectangle = null;
    }
  }

  public destroy() {
    this.clearMarkers();
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
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(this.map);
  }
}
