import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet-fullscreen";
import "leaflet-routing-machine";

function MapExample() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);

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

    setMap(newMap);
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const carIcon = new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -35],
    });

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          L.marker([userLat, userLng], { icon: carIcon })
            .addTo(map)
            .bindPopup("<b>Your Car</b>")
            .openPopup();

          if (routingControl) {
            map.removeControl(routingControl);
          }

          const nearestStation = locations.find((station) => station.status === "available");
          if (!nearestStation) return;

          const newRoutingControl = L.Routing.control({
            waypoints: [L.latLng(userLat, userLng), L.latLng(nearestStation.lat, nearestStation.lng)],
            routeWhileDragging: false,
            createMarker: () => null, // removes markers for waypoints
            show: false, // hides turn-by-turn directions
            addWaypoints: false, // prevents additional waypoints
            fitSelectedRoutes: true, // ensures the route fits the map view
            lineOptions: {
              styles: [{ color: "blue", weight: 5 }],
            },
          }).addTo(map);

          setRoutingControl(newRoutingControl);
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

  return <div ref={mapRef} style={{ height: "600px", width: "100%" }} />;
}

export default MapExample;
