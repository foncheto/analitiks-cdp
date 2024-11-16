import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Function to get projects, optionally filtered by clientId
export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clientId } = req.query; // Extract clientId from query parameters

  try {
    const projects = await prisma.project.findMany({
      where: clientId ? { clientId: Number(clientId) } : undefined, // Filter by clientId if provided
    });
    res.json(projects);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving projects: ${error.message}` });
  }
};

// Function to create a new project
export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, startDate, endDate, clientId } = req.body;
  console.log("Creating project with:", req.body); // Log the request body to verify data

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate,
        endDate,
        ...(clientId && { clientId: Number(clientId) }),
      },
    });
    res.status(201).json(newProject);
  } catch (error: any) {
    console.error("Error creating project:", error); // Log error for debugging
    res
      .status(500)
      .json({ message: `Error creating a project: ${error.message}` });
  }
};
