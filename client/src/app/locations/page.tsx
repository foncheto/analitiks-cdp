"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useGetClientsQuery } from "@/state/api";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";

// Importa dinámicamente react-leaflet para evitar problemas en el servidor
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Carga Leaflet dinámicamente solo en el cliente
let customIcon: any = null;
if (typeof window !== "undefined") {
  const L = require("leaflet");
  customIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
    iconSize: [25, 25],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

const Locations = () => {
  const { data: clients, isLoading, isError } = useGetClientsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) return <div>Loading map...</div>;
  if (isError || !clients) return <div>Error fetching client locations</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Client Locations" />
      <div style={{ height: "80vh", width: "100%" }}>
        <MapContainer
          className="map-container"
          center={[-33.4143239, -70.5925717]} // Default center
          zoom={8}
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
    </div>
  );
};

export default Locations;
