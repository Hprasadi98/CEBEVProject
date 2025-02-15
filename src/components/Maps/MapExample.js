import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet-fullscreen";

function MapExample() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const locations = [
    { lat: 6.9271, lng: 79.8612, name: "Charging Station 1", status: "available" },
    { lat: 6.9290, lng: 79.8580, name: "Charging Station 2", status: "occupied" },
    { lat: 6.9255, lng: 79.8600, name: "Charging Station 3", status: "unplugged" },
    { lat: 6.9280, lng: 79.8630, name: "Charging Station 4", status: "available" },
    { lat: 6.9305, lng: 79.8550, name: "Charging Station 5", status: "occupied" },
    { lat: 6.9315, lng: 79.8590, name: "Charging Station 6", status: "unplugged" },
    { lat: 6.9265, lng: 79.8575, name: "Charging Station 7", status: "available" },
    { lat: 6.9235, lng: 79.8595, name: "Charging Station 8", status: "unplugged" },
    { lat: 6.9330, lng: 79.8625, name: "Charging Station 9", status: "available" },
    { lat: 6.9445, lng: 79.8640, name: "Charging Station 10", status: "occupied" },
  ];

  useEffect(() => {
    if (!mapRef.current || map) return;

    const initialLat = 6.9271;
    const initialLng = 79.8612;

    const newMap = L.map(mapRef.current, {
      fullscreenControl: true,
      fullscreenControlOptions: { position: "topright" },
    }).setView([initialLat, initialLng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(newMap);

    setMap(newMap);

    const iconStatus = {
      available: new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
      occupied: new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
      unplugged: new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    };

    locations.forEach((location) => {
      const icon = iconStatus[location.status] || iconStatus.available;
      L.marker([location.lat, location.lng], { icon })
        .addTo(newMap)
        .bindPopup(`<b>${location.name}</b><br>Status: ${location.status}`);
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const carIcon = new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -35],
    });

    let userMarker = null;
    let userCircle = null;
    let firstUpdate = true;

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          setUserLocation([userLat, userLng]);

          if (userMarker) {
            userMarker.setLatLng([userLat, userLng]);
            userCircle.setLatLng([userLat, userLng]).setRadius(accuracy);
          } else {
            userMarker = L.marker([userLat, userLng], { icon: carIcon })
              .addTo(map)
              .bindPopup(`<b>Your Car</b>`)
              .openPopup();

            userCircle = L.circle([userLat, userLng], {
              color: "blue",
              fillColor: "#30f",
              fillOpacity: 0.3,
              radius: accuracy,
            }).addTo(map);
          }

          // Center the map **only the first time**
          if (firstUpdate) {
            map.setView([userLat, userLng], 14);
            firstUpdate = false;
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
    }
  }, [map]);

  return (
    <div className="relative w-full h-[600px] rounded">
      <div className="rounded h-full" ref={mapRef} style={{ height: "600px" }} />
    </div>
  );
}

export default MapExample;
