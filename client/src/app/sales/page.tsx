"use client";

import React, { useState } from "react";
import { useGetSalesQuery, useCreateSaleMutation } from "@/state/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const SalesPage = () => {
  const { data: sales = [], isLoading, isError, refetch } = useGetSalesQuery();
  const [createSale] = useCreateSaleMutation();

  // State for modal
  const [modalOpen, setModalOpen] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    amount: 0,
    date: new Date().toISOString().split("T")[0], // Default to today
    description: "",
    clientId: 0,
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "amount" || name === "clientId" ? parseFloat(value) : value,
    }));
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    setFormData({
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      clientId: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSale(formData).unwrap();
      handleModalClose();
      refetch(); // Refresh sales after a new sale is added
    } catch (error) {
      console.error("Error creating sale:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadError("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales/upload-csv`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Error uploading CSV: ${response.statusText}`);
      }

      const result = await response.json();
      alert("Sales uploaded successfully!");
      console.log("Uploaded sales:", result.sales);
      setFile(null);
      setUploadError("");
      refetch(); // Refresh sales after CSV upload
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload CSV",
      );
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Sales View</h1>

      {/* Actions */}
      <div className="mb-4 flex items-center gap-4">
        <Button variant="contained" color="primary" onClick={handleModalOpen}>
          Register New Sale
        </Button>
        <Button
          onClick={refetch}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Refresh Sales
        </Button>
      </div>

      {/* CSV Upload */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Upload Sales CSV</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4"
        />
        <Button
          onClick={handleFileUpload}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Upload CSV
        </Button>
        {uploadError && <p className="mt-2 text-red-500">{uploadError}</p>}
      </div>

      {/* Sales Table */}
      <h2 className="mb-4 text-xl font-semibold">All Sales</h2>
      {isLoading ? (
        <p>Loading sales...</p>
      ) : isError ? (
        <p>Error fetching sales.</p>
      ) : (
        <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Amount
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Date
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Client ID
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="even:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {sale.amount.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {sale.description || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {sale.clientId}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center">
                    No sales registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Register New Sale Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Register New Sale</DialogTitle>
        <DialogContent>
          <form className="flex flex-col gap-4">
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              label="Client ID"
              name="clientId"
              type="number"
              value={formData.clientId}
              onChange={handleChange}
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save Sale
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SalesPage;
