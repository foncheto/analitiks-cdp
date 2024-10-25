"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGetClientsQuery } from "@/state/api";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";

// Custom icon definition for map markers
const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", // External icon URL or one in the public directory
  iconSize: [25, 25], // Adjust the size as needed
  iconAnchor: [16, 32], // Adjust the anchor point
  popupAnchor: [0, -32], // Adjust the popup anchor point
});

const Locations = () => {
  const { data: clients, isLoading, isError } = useGetClientsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) return <div>Loading map...</div>;
  if (isError || !clients) return <div>Error fetching clients locations</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Client Locations" />
      <div style={{ height: "80vh", width: "100%" }}>
        <MapContainer
          center={[-33.4143239, -70.5925717]} // Default map center (adjust based on common location)
          zoom={6} // Zoom level
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {clients.map((client) => (
            <Marker
              key={client.id}
              position={client.position as [number, number]} // Ensure position is a tuple of [latitude, longitude]
              icon={customIcon}
            >
              <Popup>
                <strong>{client.companyName}</strong> <br />
                {client.address}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Locations;
