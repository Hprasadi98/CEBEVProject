import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet-fullscreen";
import "leaflet-routing-machine";

function MapExample() {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [locations, setLocations] = useState([]);
  const routeControlRef = useRef(null);
  let userMarker = null; // Store reference to user's marker

  // Fetch charging stations from backend
  useEffect(() => {
    fetch("http://localhost:8081/api/charging-stations")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Locations:", data);
        setLocations(data);
      })
      .catch((error) => {
        console.error("Error fetching charging stations:", error);
        alert("Failed to load charging stations.");
      });
  }, []);

  // Icons for charging stations
  const iconStatus = {
    available: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }),
    occupied: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }),
    unplugged: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    }),
  };

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initialLat = 6.9271;
    const initialLng = 79.8612;

    const newMap = L.map(mapRef.current, {
      fullscreenControl: true,
      fullscreenControlOptions: { position: "topright" },
    }).setView([initialLat, initialLng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(newMap);

    setMap(newMap);
  }, [map]);

  // Add markers for charging stations
  useEffect(() => {
    if (!map || locations.length === 0) return;

    // Clear existing markers to prevent duplication
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    locations.forEach((location) => {
      const icon = iconStatus[location.status?.toLowerCase()] || iconStatus.available;

      L.marker([location.latitude, location.longitude], { icon })
        .addTo(map)
        .bindPopup(
          `<b>${location.name}</b><br>Status: ${location.status}<br>Charge: ${location.chargeLevel || 0}%`
        );
    });

    // Add Legend
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.innerHTML += "<h4>Station Status</h4>";
      div.innerHTML += '<div><span style="display:inline-block; width:12px; height:12px; background:green; margin-right:5px;"></span> Available</div>';
      div.innerHTML += '<div><span style="display:inline-block; width:12px; height:12px; background:blue; margin-right:5px;"></span> Occupied</div>';
      div.innerHTML += '<div><span style="display:inline-block; width:12px; height:12px; background:red; margin-right:5px;"></span> Unplugged</div>';
      div.style.background = "white";
      div.style.padding = "10px";
      div.style.borderRadius = "5px";
      div.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";
      return div;
    };
    
    legend.addTo(map);
  }, [map, locations]);

  // Track user location and route to the nearest available station
  useEffect(() => {
    if (!map || locations.length === 0) return;

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

          // Remove previous user marker if it exists
          if (userMarker) {
            map.removeLayer(userMarker);
          }

          // Add new user marker
          userMarker = L.marker([userLat, userLng], { icon: carIcon })
            .addTo(map)
            .bindPopup("<b>Your Car</b>")
            .openPopup();

          // Find the nearest available charging station
          const availableStations = locations.filter(
            (station) => station.status?.toLowerCase() === "available"
          );

          if (availableStations.length === 0) return;

          const nearestStation = availableStations.reduce((prev, curr) => {
            const prevDist = Math.hypot(userLat - prev.latitude, userLng - prev.longitude);
            const currDist = Math.hypot(userLat - curr.latitude, userLng - curr.longitude);
            return prevDist < currDist ? prev : curr;
          });

          // Remove existing route before adding a new one
          if (routeControlRef.current) {
            map.removeControl(routeControlRef.current);
          }

          // Add routing to the nearest station
          routeControlRef.current = L.Routing.control({
            waypoints: [
              L.latLng(userLat, userLng),
              L.latLng(nearestStation.latitude, nearestStation.longitude),
            ],
            routeWhileDragging: true,
            createMarker: () => null,
            show: true,
            addWaypoints: false,
            fitSelectedRoutes: true,
            lineOptions: {
              styles: [{ color: "blue", weight: 5 }],
            },
          }).addTo(map);
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
  }, [map, locations]);

  return <div ref={mapRef} style={{ height: "600px", width: "100%" }} />;
}

export default MapExample;
