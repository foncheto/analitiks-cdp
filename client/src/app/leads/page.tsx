"use client";

import { useGetLeadsQuery } from "@/state/api";
import React, { useState } from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridRowParams,
} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "name", headerName: "Name", width: 200 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "phone", headerName: "Phone", width: 150 },
  { field: "company", headerName: "Company", width: 200 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "source", headerName: "Source", width: 200 },
  { field: "notes", headerName: "Notes", width: 250 },
];

const Leads = () => {
  const { data: leads, isLoading, isError } = useGetLeadsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // State for selected lead details modal
  const [selectedLead, setSelectedLead] = useState<{
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    source: string;
    notes: string;
  } | null>(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const handleRowClick = (params: GridRowParams) => {
    setSelectedLead(params.row);
    setLeadModalOpen(true);
  };

  const handleCloseLeadModal = () => {
    setLeadModalOpen(false);
    setSelectedLead(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !leads) return <div>Error fetching leads</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Leads" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={leads || []}
          columns={columns}
          getRowId={(row) => row.id}
          pagination
          onRowClick={handleRowClick}
          slots={{
            toolbar: CustomToolbar,
          }}
          className={dataGridClassNames} // Add your CSS class here if needed
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>

      {/* Modal to show lead details */}
      <Dialog
        open={leadModalOpen}
        onClose={handleCloseLeadModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Lead Details</DialogTitle>
        <DialogContent>
          {selectedLead ? (
            <List>
              <ListItem>
                <ListItemText primary="Name" secondary={selectedLead.name} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={selectedLead.email} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Phone" secondary={selectedLead.phone} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Company"
                  secondary={selectedLead.company}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={selectedLead.status}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Source"
                  secondary={selectedLead.source}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Notes" secondary={selectedLead.notes} />
              </ListItem>
            </List>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
