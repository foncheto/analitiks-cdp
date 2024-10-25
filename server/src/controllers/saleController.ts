import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
