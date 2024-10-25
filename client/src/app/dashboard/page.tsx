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
  ChartData,
  ChartOptions,
} from "chart.js";
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

// Line chart data with proper typing
const lineData: ChartData<"line"> = {
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

const lineData1: ChartData<"line"> = {
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

// Line chart options with proper typing
const lineOptions: ChartOptions<"line"> = {
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

// Doughnut chart data with proper typing
const doughnutData: ChartData<"doughnut"> = {
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

// Doughnut chart options with proper typing
const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Product Sales Distribution",
    },
  },
};

// Dashboard component
const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-wrapper">
      <Header name="Analitiks SPA - Business Sales Dashboard" />
      <div className="dashboard-grid">
        <div className="chart-card">
          <h3 className="chart-title">Ventas mensuales Año actual</h3>
          <div className="chart-container">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Ventas anuales</h3>
          <div className="chart-container">
            <Line data={lineData1} options={lineOptions} />
          </div>
        </div>

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
