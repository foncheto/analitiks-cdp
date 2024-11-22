import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all leads
export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const leads = await prisma.lead.findMany();
    res.json(leads);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving leads: ${error.message}` });
  }
};

// Fetch a single lead by ID
export const getLead = async (req: Request, res: Response): Promise<void> => {
  const { leadId } = req.params;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(leadId) },
    });

    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
    } else {
      res.json(lead);
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving lead: ${error.message}` });
  }
};

// Create a new lead
export const postLead = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, status, source, notes, clientId, assignedTo } =
    req.body;

  try {
    const newLead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        status,
        source,
        notes,
        clientId,
        assignedTo,
      },
    });
    res.status(201).json(newLead);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "Email already exists" });
    } else {
      res
        .status(500)
        .json({ message: `Error creating lead: ${error.message}` });
    }
  }
};

// Get the newest leads from the chatbot api and load them to the system
export const getNewLeads = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Call the chatbot API to get the newest leads
    const response = await fetch("http://34.224.223.178:9090/getleads");
    const newLeads = await response.json();
    // get the leads from the users object in the response
    const { users } = newLeads;

    // remove company field from the leads
    users.forEach((user: any) => {
      delete user.company;
      delete user.create;
      delete user.id;
    });

    // change user_number to phone
    users.forEach((user: any) => {
      user.phone = user.user_number;
      delete user.user_number;
    });

    // Load the new leads into the database
    await prisma.lead.createMany({
      data: users,
    });

    res.json({ message: "New leads loaded successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error loading new leads: ${error.message}` });
  }
};
