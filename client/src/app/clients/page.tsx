"use client";

import { useGetClientsQuery } from "@/state/api";
import React from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

// Define the columns based on your schema
const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "companyName", headerName: "Company Name", width: 200 },
  { field: "industry", headerName: "Industry", width: 150 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "phone", headerName: "Phone", width: 150 },
  { field: "address", headerName: "Address", width: 250 },
];

const Clients = () => {
  const { data: clients, isLoading, isError } = useGetClientsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !clients) return <div>Error fetching clients</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Clientes" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={clients || []}
          columns={columns}
          getRowId={(row) => row.id} // Using the "id" field as the unique identifier
          pagination
          slots={{
            toolbar: CustomToolbar,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>
    </div>
  );
};

export default Clients;
