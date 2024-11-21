"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Client } from "@/state/api"; // Adjust the import path as needed
import { useAppSelector } from "../redux";
import Header from "@/components/Header";

// Dynamically import React Leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Custom icon for map markers
const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
  iconSize: [25, 25],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Locations = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode); // Example for using dark mode, if needed

  // Set isClient to true once the component mounts (client-side)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch client data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/clients");
        const data: Client[] = await res.json();
        setClients(data);
        setIsLoading(false); // Mark loading as complete
      } catch (err) {
        console.error("Error fetching client data:", err);
        setIsLoading(false); // Also mark loading as complete in case of error
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading map...</div>; // Show loading indicator while data is fetching

  // Debug: Log client data to check if it's being fetched correctly
  console.log("Fetched Clients Data: ", clients);

  // Check if positions are being parsed correctly
  clients.forEach(client => {
    console.log(`Client ID: ${client.id}, Position: ${client.position}`);
  });

  // Calculate the center of the map based on client locations
  const defaultCenter: [number, number] = [-33.4143239, -70.5925717]; // Fallback center
  const center: [number, number] = clients.length
    ? [
        clients.reduce((acc, client) => acc + (client.position ? client.position[0] : 0), 0) / clients.length,
        clients.reduce((acc, client) => acc + (client.position ? client.position[1] : 0), 0) / clients.length,
      ]
    : defaultCenter;

  // Zoom level for map; adjust this based on the number of clients
  const zoomLevel = clients.length > 5 ? 10 : 8;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Client Locations" />
      {isClient && (
        <div style={{ height: "80vh", width: "100%" }}>
          <MapContainer
            center={center} // Use the dynamically calculated center
            zoom={zoomLevel} // Adjust zoom level
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {clients.map((client) => (
              client.position && (
                <Marker key={client.id} position={client.position.slice(0, 2) as [number, number]} icon={customIcon}>
                  <Popup>
                    <strong>{client.companyName}</strong> <br />
                    Location: {client.position ? `Lat: ${client.position[0]}, Lon: ${client.position[1]}` : "No location data"}
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default Locations;
