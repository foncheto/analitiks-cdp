import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all clients
export const getClients = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving clients: ${error.message}` });
  }
};

// Fetch a single client by ID
export const getClient = async (req: Request, res: Response): Promise<void> => {
  const { clientId } = req.params;

  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) },
    });

    if (!client) {
      res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving client: ${error.message}` });
  }
};

// Create a new client
export const postClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { companyName, industry, email, phone, address } = req.body;

  try {
    const newClient = await prisma.client.create({
      data: {
        companyName,
        industry,
        email,
        phone,
        address,
      },
    });
    res.status(201).json(newClient);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "Email already exists" });
    }
    res
      .status(500)
      .json({ message: `Error creating client: ${error.message}` });
  }
};
