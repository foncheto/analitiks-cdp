"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGetClientsQuery } from "@/state/api";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";

// Custom icon definition for map markers
const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
  iconSize: [25, 25],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Locations = () => {
  const { data: clients, isLoading, isError } = useGetClientsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [isClient, setIsClient] = useState(false);

  // Only set `isClient` to true once the component mounts on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isLoading) return <div>Loading map...</div>;
  if (isError || !clients) return <div>Error fetching client locations</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Client Locations" />
      {isClient && (
        <div style={{ height: "80vh", width: "100%" }}>
          <MapContainer
            center={[-33.4143239, -70.5925717]} // Default map center
            zoom={8}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {clients.map((client) => (
              <Marker
                key={client.id}
                position={client.position as [number, number]}
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
      )}
    </div>
  );
};

export default Locations;
