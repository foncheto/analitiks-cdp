"use client";

import React, { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Client, useGetClientsQuery } from "@/state/api"; // Assume this fetches clients
import { useAppSelector } from "../redux";
import Header from "@/components/Header";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

// Default data for charts
const defaultLineData = {
  labels: ["January", "February", "March", "April", "May"],
  datasets: [
    {
      label: "Sales 2024",
      data: [300, 400, 500, 200, 700],
      borderColor: "rgba(75, 192, 192, 1)",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      fill: true,
    },
  ],
};

const defaultDoughnutData = {
  labels: ["MINERA", "ALIMENTOS", "AGUAS"],
  datasets: [
    {
      label: "VENTAS POR INDUSTRIA",
      data: [300, 150, 100],
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
      ],
      hoverBackgroundColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
      ],
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Sales Chart",
    },
  },
};

// Segments View Component
const Segments = () => {
  const { data: clients, isLoading, isError } = useGetClientsQuery(); // Fetch clients from API
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [selectedIndustry, setSelectedIndustry] = useState("ALL"); // Default to all industries
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    if (clients) {
      if (selectedIndustry === "ALL") {
        setFilteredClients(clients);
      } else {
        const filtered = clients.filter(
          (client) => client.industry === selectedIndustry,
        );
        setFilteredClients(filtered);
      }
    }
  }, [clients, selectedIndustry]);

  if (isLoading) return <div>Loading clients...</div>;
  if (isError || !clients) return <div>Error fetching clients</div>;

  // Create a list of unique industries for the filter dropdown
  const industries = Array.from(
    new Set(clients.map((client) => client.industry)),
  );

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Client Segments - Industry View" />

      {/* Filter Dropdown for Industry */}
      <div className="mb-6 flex">
        <label htmlFor="industryFilter" className="mr-4">
          Filter by Industry:
        </label>
        <select
          id="industryFilter"
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
        >
          <option value="ALL">All Industries</option>
          {industries.map((industry, idx) => (
            <option key={idx} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      {/* Dashboard for Selected Industry */}
      <div className="dashboard-grid">
        {/* Line Chart */}
        <div className="chart-card">
          <h3 className="chart-title">
            {selectedIndustry === "ALL"
              ? "Sales Data (All Industries)"
              : `Sales Data - ${selectedIndustry}`}
          </h3>
          <div className="chart-container">
            <Line data={defaultLineData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Sales Distribution by Industry</h3>
          <div className="chart-container">
            <Doughnut data={defaultDoughnutData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Segments;
