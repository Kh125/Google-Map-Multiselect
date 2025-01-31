import React, { useEffect, useState, useRef } from "react";
import japanGeoJson from "./testterra.json";

const App = () => {
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [map, setMap] = useState(null);
  const [hoverArea, setHoveredArea] = useState(null);
  const selectedAreasRef = useRef(selectedAreas);

  useEffect(() => {
    selectedAreasRef.current = selectedAreas;
  }, [selectedAreas]);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const existingScript = document.getElementById("googleMaps");

      console.log("df", import.meta.env);

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAP_API
        }`;
        script.id = "googleMaps";
        document.body.appendChild(script);

        script.onload = () => {
          initMap();
        };
      } else {
        if (typeof google !== "undefined") {
          initMap();
        }
      }
    };

    const initMap = () => {
      if (!document.getElementById("map")) return;

      const mapInstance = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 35.749, lng: 139.587 },
        zoom: 12,
      });

      setMap(mapInstance);

      mapInstance.data.addGeoJson(japanGeoJson);

      mapInstance.data.addListener("click", (event) => {
        const feature = event.feature;
        const fg = feature["Fg"];
        const stateName = fg["points"].join(", ");
        const stateId = fg["geocode"];

        setSelectedAreas((prev) => {
          if (prev.some((state) => state.id == stateId)) {
            return prev.filter((state) => state.id !== stateId);
          } else {
            return [...prev, { id: stateId, name: stateName }];
          }
        });
      });

      const handleMouseOver = (event) => {
        const feature = event.feature;
        const fg = feature["Fg"];
        const stateName = fg["points"].join(", ");
        const stateId = fg["geocode"];

        setHoveredArea({
          name: stateName,
          id: stateId,
        });

        const isSelected = selectedAreasRef.current.some(
          (state) => state.id == stateId
        );

        if (!isSelected) {
          mapInstance.data.overrideStyle(event.feature, {
            fillColor: "lightgreen",
            fillOpacity: 0.4,
          });
        }
      };

      mapInstance.data.addListener("mouseover", handleMouseOver);

      mapInstance.data.addListener("mouseout", (event) => {
        mapInstance.data.revertStyle();
      });

      google.maps.event.addListenerOnce(mapInstance.data, "addfeature", () => {
        console.log("GeoJSON data loaded");
      });
    };

    loadGoogleMapsScript();

    return () => {};
  }, []);

  useEffect(() => {
    if (map) {
      map.data.setStyle((feature) => {
        const stateId = feature["Fg"]["geocode"];

        const isSelected = selectedAreas.some((area) => area.id == stateId);
        return {
          fillColor: isSelected ? "orange" : "lightblue",
          strokeColor: "cyan",
          strokeWeight: 1,
          fillOpacity: isSelected ? 0.5 : 0.2,
        };
      });
    }
  }, [selectedAreas, map]);

  return (
    <div>
      {/* Map container */}
      <div id="map" style={{ width: "100vw", height: "100vh" }}></div>

      {hoverArea && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          <h4>{hoverArea.name}</h4>
          <p>ID: {hoverArea.id}</p>
        </div>
      )}

      {/* Display selected area data by chome - geocode and name */}
      {selectedAreas.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 80,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h3>Selected Areas</h3>
          <ul>
            {selectedAreas.map((state) => (
              <div key={state.id}>
                <p>{state.id}</p>
                <p>{state.name}</p>
                {/* // Display each selected Geocode ID and Name*/}
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
