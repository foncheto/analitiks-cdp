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
  ChartData,
  ChartOptions,
} from "chart.js";
import { Client, useGetClientsQuery } from "@/state/api";
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

// Define types for the chart data and options
const defaultLineData: ChartData<"line"> = {
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

const defaultDoughnutData: ChartData<"doughnut"> = {
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

const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Sales Chart",
    },
  },
};

const doughnutChartOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Sales Chart",
    },
  },
};

const Segments = () => {
  const { data: clients, isLoading, isError } = useGetClientsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [selectedIndustry, setSelectedIndustry] = useState("ALL");
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

  const industries = Array.from(
    new Set(clients.map((client) => client.industry)),
  );

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Client Segments - Industry View" />

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

      <div className="dashboard-grid">
        <div className="chart-card">
          <h3 className="chart-title">
            {selectedIndustry === "ALL"
              ? "Sales Data (All Industries)"
              : `Sales Data - ${selectedIndustry}`}
          </h3>
          <div className="chart-container">
            <Line data={defaultLineData} options={lineChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Sales Distribution by Industry</h3>
          <div className="chart-container">
            <Doughnut
              data={defaultDoughnutData}
              options={doughnutChartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Segments;
