import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import custom location icon
const locationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png", // custom location pin
  iconSize: [32, 32], // adjust size
  iconAnchor: [16, 32], // positioning of the icon
  popupAnchor: [0, -32], // popup position
});

// component to handle location picking
const LocationPicker = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      console.log("clicked location:", e.latlng); // log the location
      setLocation([e.latlng.lat, e.latlng.lng]); // set latitude and longitude
    },
  });
  return null;
};

const Tabs = () => {
  const [stationName, setStationName] = useState("");
  const [stationStatus, setStationStatus] = useState("Available"); // default status
  const [location, setLocation] = useState([6.9271, 79.8612]); // default location (colombo)

  const handleSubmit = async (e) => {
    e.preventDefault();

    const stationData = {
      name: stationName,
      status: stationStatus,
      latitude: location[0], // ensure correct field names
      longitude: location[1],
    };

    try {
      // post request to the spring boot backend using fetch
      const response = await fetch("http://localhost:8081/api/charging-stations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(stationData),
      });

      if (!response.ok) {
        throw new Error("failed to register the charging station");
      }

      const data = await response.json();
      console.log("charging station registered:", data);
      
      // show success message
      toast.success("charging station registered successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // reset form
      setStationName("");
      setStationStatus("Available");
      setLocation([6.9271, 79.8612]); // reset to default location

    } catch (error) {
      console.error("error registering charging station:", error);
      
      // show error message
      toast.error("failed to register charging station!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-4xl px-4">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded p-1">
          <div className="flex justify-between items-center mb-4 mt-4 relative w-full px-6">
            <div className="relative flex-1 flex flex-col ">
              <span className="text-xxl mt-2 font-bold">charging station registration</span>
            </div>
          </div>

          <div className="ml-0 p-5 bg-blueGray-100">
            <div className="p-5 mr-4 rounded bg-gray-100">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* charging station name input */}
                <div>
                  <label className="block text-m font-medium text-gray-700">charging station name</label>
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  />
                </div>

                {/* status dropdown */}
                <div>
                  <label className="block text-m font-medium text-gray-700">charging station status</label>
                  <select
                    value={stationStatus}
                    onChange={(e) => setStationStatus(e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md bg-white"
                  >
                    <option value="Available">available</option>
                    <option value="Occupied">occupied</option>
                    <option value="Unplugged">unplugged</option>
                  </select>
                </div>

                {/* map for location selection */}
                <div>
                  <label className="mt-4 mb-1 block text-m font-medium text-gray-700">select location</label>
                  <div className="h-80 w-full border rounded-md overflow-hidden">
                    <MapContainer 
                      center={location} 
                      zoom={13} 
                      className="h-full w-full"
                      style={{ height: "320px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker setLocation={setLocation} />
                      {location && <Marker position={location} icon={locationIcon} />} {/* custom marker */}
                    </MapContainer>
                  </div>
                  {location && (
                    <p className="mt-2 text-sm text-gray-600">
                      selected: {location[0].toFixed(6)}, {location[1].toFixed(6)}
                    </p>
                  )}
                </div>

                {/* submit button */}
                <button 
                  type="submit" 
                  className={`mt-4 px-4 py-2 rounded-lg ${
                    location ? "bg-lightBlue-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed "
                  }`} 
                  disabled={!location}
                >
                  register
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default Tabs;
