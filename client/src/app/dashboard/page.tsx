"use client";

import React from "react";
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
  CoreChartOptions,
} from "chart.js";
import { _DeepPartialObject } from "chart.js/types/utils"; // Import for deep partial typing
import Header from "@/components/Header"; // Assuming you have a reusable Header component

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

// Line chart data and options
const lineData = {
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

const lineData1 = {
  labels: ["2019", "2020", "2021", "2022", "2023", "2024"],
  datasets: [
    {
      label: "Sales 2024",
      data: [300, 400, 500, 700, 800, 1100],
      borderColor: "rgba(75, 192, 192, 1)",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      fill: true,
    },
  ],
};

// Cast the options to the appropriate type for Line charts
const lineOptions: _DeepPartialObject<CoreChartOptions<"line">> = {
  responsive: true,
  maintainAspectRatio: false, // Ensures the chart adjusts to the container
  plugins: {
    legend: {
      position: "top", // Correctly typed position for legend
    },
    title: {
      display: true,
      text: "Sales Chart",
    },
  },
};

// Doughnut chart data and options
const doughnutData = {
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

const doughnutOptions: _DeepPartialObject<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const, // Use "top" with a specific type
    },
    title: {
      display: true,
      text: "Product Sales Distribution",
    },
  },
};

// SalesDashboard component
const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-wrapper">
      <Header name="Analitiks SPA - Business Sales Dashboard" />
      <div className="dashboard-grid">
        {/* Line Chart 1 */}
        <div className="chart-card">
          <h3 className="chart-title">Ventas mensuales Año actual</h3>
          <div className="chart-container">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Line Chart 2 */}
        <div className="chart-card">
          <h3 className="chart-title">Ventas anuales</h3>
          <div className="chart-container">
            <Line data={lineData1} options={lineOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Distribución de Ventas</h3>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
