import React, { useEffect, useRef } from "react";

function MapExample() {
  const mapRef = useRef(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!window.google) {
        console.error("google maps script not loaded");
        return;
      }

      const lat = 40.748817;
      const lng = -73.985428;
      const myLatlng = new window.google.maps.LatLng(lat, lng);

      const mapOptions = {
        zoom: 12,
        center: myLatlng,
        scrollwheel: false,
        zoomControl: true,
        styles: [
          {
            featureType: "administrative",
            elementType: "labels.text.fill",
            stylers: [{ color: "#444444" }],
          },
          {
            featureType: "landscape",
            elementType: "all",
            stylers: [{ color: "#f2f2f2" }],
          },
          {
            featureType: "water",
            elementType: "all",
            stylers: [{ color: "#4299e1" }, { visibility: "on" }],
          },
        ],
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);

      const marker = new window.google.maps.Marker({
        position: myLatlng,
        map: map,
        animation: window.google.maps.Animation.DROP,
        title: "notus react!",
      });

      const infowindow = new window.google.maps.InfoWindow({
        content: `<div class="info-window-content">
            <h2>Notus React</h2>
            <p>A free admin for tailwind css, react, and react hooks.</p>
          </div>`,
      });

      marker.addListener("click", () => {
        infowindow.open(map, marker);
      });
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=your_google_maps_api_key`;
      script.async = true;
      script.defer = true;
      script.onload = loadGoogleMaps;
      document.body.appendChild(script);
    } else {
      loadGoogleMaps();
    }
  }, []);

  return (
    <div className="relative w-full rounded h-600-px">
      <div className="rounded h-full" ref={mapRef} style={{ height: "600px" }} />
    </div>
  );
}

export default MapExample;
