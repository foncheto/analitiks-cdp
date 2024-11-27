"use client";

import {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadStatusMutation,
} from "@/state/api";
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
  Button,
  TextField,
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
  const [createLead] = useCreateLeadMutation();
  const [updateLeadStatus] = useUpdateLeadStatusMutation();
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

  // State for creating a new lead
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  const statusOrder = ["new", "contacted", "qualified", "converted", "lost"];

  const handleRowClick = (params: GridRowParams) => {
    setSelectedLead(params.row);
    setLeadModalOpen(true);
  };

  const handleCloseLeadModal = () => {
    setLeadModalOpen(false);
    setSelectedLead(null);
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setNewLead({
      name: "",
      email: "",
      phone: "",
      company: "",
      notes: "",
    });
  };

  const handleNewLeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateLead = async () => {
    try {
      await createLead({
        ...newLead,
        status: "new",
        source: "manual",
      }).unwrap();
      handleCloseCreateModal();
    } catch (error) {
      console.error("Error creating lead:", error);
    }
  };

  const handleUpgradeStatus = async () => {
    if (!selectedLead) return;
    const currentIndex = statusOrder.indexOf(selectedLead.status.toLowerCase());
    if (currentIndex < statusOrder.length - 1) {
      const newStatus = statusOrder[currentIndex + 1];
      try {
        await updateLeadStatus({
          leadId: selectedLead.id,
          status: newStatus,
        }).unwrap();
        setSelectedLead((prev) =>
          prev ? { ...prev, status: newStatus } : prev,
        );
      } catch (error) {
        console.error("Error upgrading status:", error);
      }
    }
  };

  const handleDowngradeStatus = async () => {
    if (!selectedLead) return;
    const currentIndex = statusOrder.indexOf(selectedLead.status.toLowerCase());
    if (currentIndex > 0) {
      const newStatus = statusOrder[currentIndex - 1];
      try {
        await updateLeadStatus({
          leadId: selectedLead.id,
          status: newStatus,
        }).unwrap();
        setSelectedLead((prev) =>
          prev ? { ...prev, status: newStatus } : prev,
        );
      } catch (error) {
        console.error("Error downgrading status:", error);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !leads) return <div>Error fetching leads</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Leads" />
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCreateModal}
        >
          Add New Lead
        </Button>
      </div>
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
            <>
              <List>
                <ListItem>
                  <ListItemText primary="Name" secondary={selectedLead.name} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={selectedLead.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Phone"
                    secondary={selectedLead.phone}
                  />
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
                  <ListItemText
                    primary="Notes"
                    secondary={selectedLead.notes}
                  />
                </ListItem>
              </List>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpgradeStatus}
                >
                  Upgrade Status
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDowngradeStatus}
                >
                  Downgrade Status
                </Button>
              </div>
            </>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal to create a new lead */}
      <Dialog
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Lead</DialogTitle>
        <DialogContent>
          <form className="flex flex-col gap-4">
            <TextField
              label="Name"
              name="name"
              value={newLead.name}
              onChange={handleNewLeadChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              value={newLead.email}
              onChange={handleNewLeadChange}
              required
            />
            <TextField
              label="Phone"
              name="phone"
              value={newLead.phone}
              onChange={handleNewLeadChange}
              required
            />
            <TextField
              label="Company"
              name="company"
              value={newLead.company}
              onChange={handleNewLeadChange}
            />
            <TextField
              label="Notes"
              name="notes"
              value={newLead.notes}
              onChange={handleNewLeadChange}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateLead}
            >
              Save Lead
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
