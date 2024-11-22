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

const lineData: ChartData<"line"> = {
  labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
  datasets: [
    {
      label: "Ventas 2024 (en millones CLP)",
      data: [120, 140, 180, 90, 200],
      borderColor: "rgba(75, 192, 192, 1)",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      fill: true,
    },
  ],
};

const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Ventas Mensuales (2024)",
    },
  },
};

const doughnutData1: ChartData<"doughnut"> = {
  labels: ["Minería", "Alimentos y Bebidas", "Tratamiento de Aguas"],
  datasets: [
    {
      label: "Ventas por Industria",
      data: [350, 220, 130],
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

const doughnutData2: ChartData<"doughnut"> = {
  labels: [
    "Región Metropolitana",
    "Región de Antofagasta",
    "Región de Valparaíso",
    "Región del Biobío",
    "Región de Los Lagos",
  ],
  datasets: [
    {
      label: "Ventas por Región",
      data: [500, 300, 200, 150, 100],
      backgroundColor: [
        "rgba(153, 102, 255, 0.6)",
        "rgba(255, 159, 64, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
      ],
      hoverBackgroundColor: [
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
      ],
    },
  ],
};

const doughnutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Distribución de Ventas por Región",
    },
  },
};

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-wrapper">
      <Header name="Analitiks SPA - Dashboard de Ventas Chile" />

      {/* Sección de valores importantes */}
      <div className="important-values">
        <div className="value-card">
          <h4 className="value-title">Ventas Mes Actual</h4>
          <p className="value-number">$20.000.000 CLP</p>
        </div>
        <div className="value-card">
          <h4 className="value-title">Ventas Año Actual</h4>
          <p className="value-number">$120.000.000 CLP</p>
        </div>
        <div className="value-card">
          <h4 className="value-title">Número de Clientes</h4>
          <p className="value-number">300</p>
        </div>
        <div className="value-card">
          <h4 className="value-title">Clientes Nuevos Año Actual</h4>
          <p className="value-number">45</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card chart-full-width">
          <h3 className="chart-title">Ventas mensuales Año Actual</h3>
          <div className="chart-container line-chart">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Distribución de Ventas por Industria</h3>
          <div className="chart-container doughnut-chart">
            <Doughnut data={doughnutData1} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Distribución de Ventas por Región</h3>
          <div className="chart-container doughnut-chart">
            <Doughnut data={doughnutData2} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-wrapper {
          padding: 20px;
          background-color: #f4f6f8;
          font-family: Arial, sans-serif;
          color: #333;
        }

        .important-values {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .value-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          text-align: center;
        }

        .value-title {
          font-size: 1em;
          color: #333;
          margin-bottom: 10px;
        }

        .value-number {
          font-size: 1.5em;
          color: #4caf50;
          font-weight: bold;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .chart-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          transition: transform 0.2s;
        }

        .chart-card:hover {
          transform: scale(1.02);
        }

        .chart-title {
          font-size: 1.2em;
          color: #333;
          text-align: center;
          margin-bottom: 10px;
        }

        .chart-container {
          position: relative;
          width: 100%;
          margin: 0 auto;
        }

        .line-chart {
          max-width: 800px;
          height: 400px;
        }

        .doughnut-chart {
          max-width: 350px;
          height: 300px;
        }

        /* Layout en tablet y desktop */
        @media (min-width: 768px) {
          .important-values {
            grid-template-columns: repeat(4, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr 1fr;
          }

          .chart-full-width {
            grid-column: span 2;
          }
        }

        /* Layout y ajuste de gráficos para dispositivos móviles */
        @media (max-width: 600px) {
          .line-chart {
            max-width: 100%;
            height: 250px;
          }

          .doughnut-chart {
            max-width: 100%;
            height: 200px;
          }

          .important-values {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
