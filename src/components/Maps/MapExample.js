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
  const [locations, setLocations] = useState([]);

  // Fetch charging stations from backend
  useEffect(() => {
    fetch("http://localhost:8081/charging-stations")
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => {
        console.error("Error fetching charging stations:", error);
        alert("Failed to load charging stations. Please try again later.");
      });
  }, []);

  // Initialize map and markers
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

    // Icon status for charging stations
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

    // Only add markers if locations are available
    locations.forEach((location) => {
      const icon = iconStatus[location.status] || iconStatus.available;
      L.marker([location.latitude, location.longitude], { icon })
        .addTo(newMap)
        .bindPopup(`<b>${location.name}</b><br>Status: ${location.status}`);
    });

    setMap(newMap);
  }, [locations, map]);

  // Track user location and create routing to nearest available station
  useEffect(() => {
    if (!map || !locations.length) return;

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
            map.removeControl(routingControl); // Remove previous routing control
          }

          const nearestStation = locations.find((station) => station.status === "available");
          if (!nearestStation) return;

          const newRoutingControl = L.Routing.control({
            waypoints: [L.latLng(userLat, userLng), L.latLng(nearestStation.latitude, nearestStation.longitude)],
            routeWhileDragging: false,
            createMarker: () => null,
            show: false,
            addWaypoints: false,
            fitSelectedRoutes: true,
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
  }, [map, locations, routingControl]);

  return <div ref={mapRef} style={{ height: "600px", width: "100%" }} />;
}

export default MapExample;
