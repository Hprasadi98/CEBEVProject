import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapExample() {
  const mapRef = useRef(null);

  // sample locations with lat, lng, and name for each location
  const locations = [
    { lat: 6.9271, lng: 79.8612, name: "Station 1" },
    { lat: 6.9275, lng: 79.8605, name: "Station 2" },
    { lat: 6.9280, lng: 79.8610, name: "Station 3" },
    { lat: 6.9285, lng: 79.8600, name: "Station 4" },
    { lat: 6.9290, lng: 79.8595, name: "Station 5" },
    { lat: 6.9300, lng: 79.8585, name: "Station 6" },
    { lat: 6.9310, lng: 79.8575, name: "Station 7" },
    { lat: 6.9320, lng: 79.8565, name: "Station 8" },
    { lat: 6.9330, lng: 79.8555, name: "Station 9" },
    { lat: 6.9340, lng: 79.8545, name: "Station 10" }
  ];

  useEffect(() => {
    if (mapRef.current) {
      const lat = 6.9271; // colombo latitude
      const lng = 79.8612; // colombo longitude

      const map = L.map(mapRef.current).setView([lat, lng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const customIcon = L.icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // loop through locations and add markers
      locations.forEach((location) => {
        L.marker([location.lat, location.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b>${location.name}</b>`); // show location name on popup
      });
    }
  }, []);

  return (
    <div className="relative w-full rounded h-600-px">
      <div className="rounded h-full" ref={mapRef} style={{ height: "600px" }} />
    </div>
  );
}

export default MapExample;
