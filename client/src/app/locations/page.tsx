"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Client } from "@/state/api"; // Adjust the import path as needed

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

const Locations = () => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/clients");
        const data: Client[] = await res.json();
        setClients(data);
      } catch (err) {
        console.error("Error fetching client data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <MapContainer center={[-33.45, -70.6667]} zoom={8} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {clients.map((client) => (
          client.position && (
            <Marker key={client.id} position={client.position.slice(0, 2) as [number, number]}>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default Locations;