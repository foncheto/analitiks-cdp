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
export const uploadSalesData = async (
  req: Request,
  res: Response
): Promise<void> => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "File upload error" });
    }

    const filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const results: any[] = [];

      // Parse the uploaded CSV file
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          results.push(row);
        })
        .on("end", async () => {
          // Fetch all clients for cross-referencing
          const clients = await prisma.client.findMany({
            select: { id: true, companyName: true },
          });

          // Map CSV rows to Prisma Sale model
          const mappedSales = results.map((row) => {
            const client = clients.find(
              (client) => client.companyName === row.Account
            );

            return {
              amount: parseFloat(row.Amount),
              date: new Date(row["Expected Close Date"]),
              description: row.Description || null,
              clientId: client ? client.id : null, // Set clientId if a match is found, otherwise null
            };
          });

          console.log("Mapped sales:", mappedSales);

          // Insert into the database (only valid sales with non-null clientId)
          const validSales = mappedSales.filter(
            (
              sale
            ): sale is {
              amount: number;
              date: Date;
              description: any;
              clientId: number;
            } => sale.clientId !== null
          );
          await prisma.sale.createMany({ data: validSales });

          // Delete the temporary file
          fs.unlinkSync(filePath);

          res.status(201).json({ message: "Sales data uploaded successfully" });
        });
    } catch (error: any) {
      console.error("Error processing CSV:", error.message);
      res
        .status(500)
        .json({ message: `Error uploading sales data: ${error.message}` });
    }
  });
};
