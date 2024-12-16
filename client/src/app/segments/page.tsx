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
import { useGetSalesQuery, useGetClientsQuery } from "@/state/api";

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

const Segments: React.FC = () => {
  const { data: sales = [], isLoading: isSalesLoading } = useGetSalesQuery();
  const { data: clients = [], isLoading: isClientsLoading } =
    useGetClientsQuery();

  // Calculate metrics
  const totalSales = sales.reduce((acc, sale) => acc + sale.amount, 0);

  const regions: { [key: string]: number } = {};
  const industries: { [key: string]: number } = {};

  sales.forEach((sale) => {
    const client = clients.find((client) => client.id === sale.clientId);
    if (client) {
      const { region, industry } = client;
      if (region) {
        regions[region] = (regions[region] || 0) + sale.amount;
      }
      if (industry) {
        industries[industry] = (industries[industry] || 0) + sale.amount;
      }
    }
  });

  const regionLabels = Object.keys(regions);
  const regionData = Object.values(regions);

  const industryLabels = Object.keys(industries);
  const industryData = Object.values(industries);

  const doughnutData1: ChartData<"doughnut"> = {
    labels: regionLabels,
    datasets: [
      {
        label: "Ventas por Región",
        data: regionData,
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

  const doughnutData2: ChartData<"doughnut"> = {
    labels: industryLabels,
    datasets: [
      {
        label: "Ventas por Industria",
        data: industryData,
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

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Distribución de Ventas",
      },
    },
  };

  if (isSalesLoading || isClientsLoading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-wrapper">
      <Header name="Analitiks SPA - Dashboard de Segmentos" />

      {/* Key Metrics */}
      <div className="important-values">
        <div className="value-card">
          <h4 className="value-title">Ventas Año Actual</h4>
          <p className="value-number">${totalSales.toFixed(2)} CLP</p>
        </div>
        <div className="value-card">
          <h4 className="value-title">Número de Regiones</h4>
          <p className="value-number">{regionLabels.length}</p>
        </div>
        <div className="value-card">
          <h4 className="value-title">Número de Industrias</h4>
          <p className="value-number">{industryLabels.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-grid">
        <div className="chart-card">
          <h3 className="chart-title">Distribución de Ventas por Región</h3>
          <div className="chart-container doughnut-chart">
            <Doughnut data={doughnutData1} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Distribución de Ventas por Industria</h3>
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
          grid-template-columns: repeat(3, 1fr);
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
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .chart-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
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

        .doughnut-chart {
          max-width: 350px;
          height: 300px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .important-values {
            grid-template-columns: 1fr;
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Segments;
