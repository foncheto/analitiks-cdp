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
  const {
    name,
    email,
    phone,
    status,
    source,
    notes,
    clientId,
    assignedTo,
    company,
  } = req.body;

  try {
    const newLead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
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
    const response = await fetch("http://34.224.89.101/:9090/getleads");
    const newLeads = await response.json();
    // get the leads from the users object in the response
    const { users } = newLeads;

    // remove company field from the leads
    users.forEach((user: any) => {
      delete user.create;
      delete user.id;
    });

    // change user_number to phone
    users.forEach((user: any) => {
      user.phone = user.user_number;
      delete user.user_number;
    });

    // add status new and source chatbot to the leads
    users.forEach((user: any) => {
      user.status = "new";
      user.source = "chatbot";
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

export const getNewLeads2 = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Call the chatbot API to get the newest leads
    const response = await fetch("http://34.224.223.178:9090/getleads");
    const newLeads = await response.json();

    // Extract leads from the response
    const { users } = newLeads;

    // Normalize and prepare leads
    const preparedLeads = users.map((user: any) => ({
      name: user.name,
      company: user.company || null, // Ensure company is nullable
      phone: user.user_number,
      status: "new",
      source: "chatbot",
    }));

    // Retrieve existing leads from the database
    const existingLeads = await prisma.lead.findMany({
      select: {
        name: true,
        company: true,
        phone: true,
      },
    });

    // Create a Set of unique combinations for existing leads
    const existingLeadsSet = new Set(
      existingLeads.map((lead) => `${lead.name}-${lead.company}-${lead.phone}`)
    );

    // Filter out new leads that are already in the database
    const filteredLeads = preparedLeads.filter(
      (lead: { name: any; company: any; phone: any }) =>
        !existingLeadsSet.has(`${lead.name}-${lead.company}-${lead.phone}`)
    );

    // Load only the filtered new leads into the database
    if (filteredLeads.length > 0) {
      await prisma.lead.createMany({
        data: filteredLeads,
      });
    }

    res.json({
      message: `New leads loaded successfully. ${filteredLeads.length} new leads added.`,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error loading new leads: ${error.message}` });
  }
};

export const updateLeadStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { leadId } = req.params;
  const { status } = req.body;

  try {
    const updatedLead = await prisma.lead.update({
      where: { id: parseInt(leadId) },
      data: { status },
    });
    res.json(updatedLead);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating lead status: ${error.message}` });
  }
};
