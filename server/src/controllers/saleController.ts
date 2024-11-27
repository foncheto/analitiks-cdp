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
      // Define column indices explicitly
      const columnIndices = {
        dealName: 0,
        amount: 1,
        account: 2,
        expectedCloseDate: 4,
        description: 15, // Assuming Description is at index 15 based on your CSV structure
      };

      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(
            csvParser({
              headers: false, // Use false since headers are not being parsed correctly
              skipLines: 1, // Skip header row
            })
          )
          .on("data", (row) => {
            try {
              // Clean and extract fields using explicit indices
              const amount = parseFloat(
                row[columnIndices.amount].replace(/,/g, "")
              );

              // Parse date
              const rawDate = row[columnIndices.expectedCloseDate];
              const [day, month, year] = rawDate.split("-");
              const date = new Date(`${year}-${month}-${day}`);

              const description = row[columnIndices.description] || null;
              const clientReference = row[columnIndices.account] || null;

              const clientId = extractClientId(clientReference);

              if (clientId === null) {
                console.error(
                  `No client ID found for reference: ${clientReference}`
                );
                return; // Skip this row
              }

              // Validate mandatory fields
              if (isNaN(amount) || isNaN(date.getTime())) {
                throw new Error("Invalid data format in CSV row");
              }

              // Push valid sales data
              salesData.push({
                amount,
                date,
                description,
                clientId,
              });
            } catch (error) {
              console.error(`Error parsing row: ${JSON.stringify(row)}`, error);
            }
          })
          .on("end", () => {
            console.log(`Parsed ${salesData.length} valid sales entries`);
            resolve();
          })
          .on("error", reject);
      });

      if (salesData.length === 0) {
        throw new Error("No valid sales data found in the CSV");
      }

      // Batch create sales
      const insertedSales = await prisma.sale.createMany({
        data: salesData,
        skipDuplicates: true, // Optional: skip duplicate entries
      });

      // Clean up the temporary file
      fs.unlinkSync(filePath);

      res.status(201).json({
        message: "CSV file processed successfully",
        salesCount: insertedSales.count, // Number of sales created
      });
    } catch (error: any) {
      // Clean up the temporary file in case of errors
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      console.error("Error processing CSV:", error);
      res
        .status(500)
        .json({ message: `Error processing CSV: ${error.message}` });
    }
  });
};

function extractClientId(clientReference: string): number | null {
  if (!clientReference) return null;

  // Updated regex to handle more variations
  const clientMatch = clientReference.match(
    /^Accounts::::(.*?)(?:\s*\(.*?\))?$/
  );

  if (clientMatch) {
    const clientName = clientMatch[1].trim();

    const clientIdMap: { [key: string]: number } = {
      "Celulosa Arauco y Constitución S.A.": 1,
      "Sierra Gorda SCM": 2,
      "SQM Salar SA": 3,
      "Minera Centinela": 4,
      "SQM Nitratos SA": 5,
      "Anglo American Sur": 6,
      "Colbún SA": 7,
      "ENAP Refinerías SA": 8,
      "Compañía Minera Teck Quebrada Blanca S.A.": 9,
      "Coexca SA": 10,
      "Orafti Chile SA": 11,
      "Voens SPA": 12,
      "Dacsi LTDA": 13,
      "AES Gener Ventanas": 14,
      "Vigaflow SA": 15,
      "ABControl LTDA": 16,
      "Patagoniafresh SA Planta Molina": 17,
      "Wellser SRL": 18,
      "Patagoniafresh SA Planta San Fernando": 19,
      "CMPC Pulp s.a": 20,
      "Emeltec spa": 21,
      "compañia minera teck quebrada blanca s.a": 22,
      "Aguas CCU-NESTLE": 23,
      "Instruvalve Ltda.": 24,
      "Compañia papelera del pacífico": 25,
      Soltex: 26,
      Quiborax: 27,
      "Compañía Minera Zaldívar": 28,
      "New Tech Copper": 29,
      "Comafri s.a": 30,
      "Wellser SRL (duplicate)": 31,
      Tecnasic: 32,
      "Cervecera CCU Chile": 33,
      "Curtiembre Rufino Melero": 34,
      "Difem s.a": 35,
      "cerveceria chile s.a": 36,
      "Miq Ltda": 37,
      Novofish: 38,
      "RWL Water Perú": 39,
      Hidroservi: 40,
      "Cementos Bío bío s.a.": 41,
      "Biodiversa s.a": 42,
      "Galdames spa": 43,
      "Termodinamica ltda.": 44,
      "Albemarle ltda.": 45,
    };

    return clientIdMap[clientName] || null;
  }
  return null;
}
