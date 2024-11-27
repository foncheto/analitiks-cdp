import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const scrapeVtigerSales = require("../scraper/scraper");
import multer from "multer";
import csvParser from "csv-parser";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

// Set up multer storage
const upload = multer({
  dest: path.join(__dirname, "../temp"), // Temporary file storage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB size limit
}).single("file");

// Fetch all sales
export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const sales = await prisma.sale.findMany();
    res.json(sales);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving sales: ${error.message}` });
  }
};

// Fetch a single sale by ID
export const getSale = async (req: Request, res: Response): Promise<void> => {
  const { saleId } = req.params;

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: Number(saleId) },
    });

    if (!sale) {
      res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving sale: ${error.message}` });
  }
};

// Create a new sale
export const postSale = async (req: Request, res: Response): Promise<void> => {
  const { clientId, date, amount, description } = req.body;

  try {
    const newSale = await prisma.sale.create({
      data: {
        clientId,
        date: new Date(date), // Ensuring the date is formatted correctly
        amount,
        description,
      },
    });

    res.status(201).json({
      message: "Sale created successfully",
      sale: newSale,
    });
  } catch (error: any) {
    if (error.code === "P2003") {
      // Handle foreign key constraint error if clientId does not exist
      res.status(400).json({ message: "Invalid clientId" });
    }
    res.status(500).json({ message: `Error creating sale: ${error.message}` });
  }
};

export const getSalesData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sales = await scrapeVtigerSales();
    res.status(200).json({ sales: sales });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving sales: ${error.message}` });
  }
};

// Upload and process CSV file
export const uploadSalesCSV = async (
  req: Request,
  res: Response
): Promise<void> => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: `File upload error: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const salesData: Array<{
      amount: number;
      date: Date;
      description?: string;
      clientId: number;
    }> = [];

    try {
      // Parse the CSV file
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser({ headers: true, skipLines: 1 })) // Ensure headers are parsed correctly
          .on("data", (row) => {
            console.log("Row:", row);
            try {
              // Clean and extract fields
              const amount = parseFloat(row["Amount"].replace(/,/g, "")); // Remove commas
              const rawDate = row["Expected Close Date"];
              const date = new Date(
                rawDate.includes("-")
                  ? rawDate.split("-").reverse().join("-")
                  : rawDate
              ); // Handle DD-MM-YYYY
              const description = row["Description"] || null;
              const clientReference = row["Account"] || null;

              console.log("Sales data:", {
                amount,
                date,
                description,
                clientId: 1,
              });

              // Validate mandatory fields
              if (isNaN(amount) || isNaN(date.getTime()) || !clientReference) {
                throw new Error("Invalid data format in CSV row");
              }

              console.log("Sales data:", {
                amount,
                date,
                description,
                clientId: 1,
              });

              // Push valid sales data
              salesData.push({ amount, date, description, clientId: 1 });
            } catch (error) {
              console.error(`Error parsing row: ${JSON.stringify(row)}`, error);
            }
          })
          .on("end", resolve)
          .on("error", reject);
      });

      if (salesData.length === 0) {
        throw new Error("No valid sales data found in the CSV");
      }

      // Insert sales data into the database
      const insertedSales = await Promise.all(
        salesData.map(async (sale) => {
          return prisma.sale.create({
            data: {
              amount: sale.amount,
              date: sale.date,
              description: sale.description,
              clientId: sale.clientId,
            },
          });
        })
      );

      // Clean up the temporary file
      fs.unlinkSync(filePath);

      res.status(201).json({
        message: "CSV file processed successfully",
        sales: insertedSales,
      });
    } catch (error: any) {
      // Clean up the temporary file in case of errors
      fs.unlinkSync(filePath);

      console.error("Error processing CSV:", error);
      res
        .status(500)
        .json({ message: `Error processing CSV: ${error.message}` });
    }
  });
};

// Helper function to map client references to IDs
function extractClientId(clientReference: string): number | null {
  // Example: Parse "Accounts::::Celulosa Arauco y Constitucion S.A. (Nueva Aldea)"
  const clientMatch = clientReference.match(/^Accounts::::(.+?)\s*\(.*?\)$/);
  if (clientMatch) {
    const clientName = clientMatch[1].trim();
    // Lookup logic: Fetch the client ID from the database based on the name
    // For simplicity, return a hardcoded ID here
    const clientIdMap: { [key: string]: number } = {
      "Celulosa Arauco y Constitucion S.A.": 1,
      "Comercial Boreal SpA": 2,
    };
    return clientIdMap[clientName] || null;
  }
  return null;
}
