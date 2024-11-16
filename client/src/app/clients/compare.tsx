"use client";

import { useGetClientsQuery, useGetProjectsByClientIdQuery } from "@/state/api";
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
  Link as MuiLink,
  Button,
} from "@mui/material";
import Link from "next/link";
import ModalNewProject from "../projects/ModalNewProject";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

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

  // State for project list modal, new project modal, selected client ID, and client name
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(
    null,
  );
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);

  // Fetch projects for the selected client
  const { data: projects, isLoading: projectsLoading } =
    useGetProjectsByClientIdQuery(selectedClientId as number, {
      skip: selectedClientId === null,
    });

  const handleRowClick = (params: GridRowParams) => {
    setSelectedClientId(params.row.id as number);
    setSelectedClientName(params.row.companyName as string);
    setProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setProjectModalOpen(false);
    setSelectedClientId(null);
    setSelectedClientName(null);
  };

  const handleOpenNewProjectModal = () => {
    setNewProjectModalOpen(true);
  };

  const handleCloseNewProjectModal = () => {
    setNewProjectModalOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !clients) return <div>Error fetching clients</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Clientes" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={clients || []}
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

      {/* Modal to create a new project */}
      <ModalNewProject
        isOpen={newProjectModalOpen}
        onClose={handleCloseNewProjectModal}
        clientId={selectedClientId} // Pass client ID to associate with the new project
      />

      {/* Modal to show projects */}
      <Dialog
        open={projectModalOpen}
        onClose={handleCloseProjectModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Projects for {selectedClientName}</DialogTitle>
        <DialogContent>
          {projectsLoading ? (
            <CircularProgress />
          ) : (
            <>
              <List>
                {projects?.map((project) => (
                  <ListItem key={project.id}>
                    <Link href={`/projects/${project.id}`} passHref>
                      <MuiLink underline="hover">
                        <ListItemText
                          primary={project.name}
                          secondary={project.description}
                        />
                      </MuiLink>
                    </Link>
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenNewProjectModal}
                style={{ marginTop: 16 }}
              >
                Create New Project
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
