import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tasks: ${error.message}` });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;

  // Basic validation
  if (!title || !projectId) {
    res.status(400).json({ message: "Title and projectId are required" });
    return;
  }

  // Verify project exists
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
    });

    if (!project) {
      res.status(400).json({ message: "Project not found" });
      return;
    }

    // Verify users exist if provided
    if (authorUserId) {
      const author = await prisma.user.findUnique({
        where: { userId: Number(authorUserId) },
      });
      if (!author) {
        res.status(400).json({ message: "Author user not found" });
        return;
      }
    }

    if (assignedUserId) {
      const assignee = await prisma.user.findUnique({
        where: { userId: Number(assignedUserId) },
      });
      if (!assignee) {
        res.status(400).json({ message: "Assigned user not found" });
        return;
      }
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        points: points ? Number(points) : undefined,
        projectId: Number(projectId),
        ...(authorUserId && { authorUserId: Number(authorUserId) }),
        ...(assignedUserId && { assignedUserId: Number(assignedUserId) }),
      },
    });

    res.status(201).json(newTask);
  } catch (error: any) {
    console.error("Full error details:", error);
    res.status(500).json({
      message: `Error creating a task: ${error.message}`,
      details: error.stack,
    });
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};

export const getComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: {
        taskId: Number(taskId),
      },
      include: {
        user: true,
      },
    });
    res.json(comments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving comments: ${error.message}` });
  }
};

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { userId, text } = req.body;
  try {
    const newComment = await prisma.comment.create({
      data: {
        text,
        taskId: Number(taskId),
        userId: Number(userId),
      },
      include: {
        user: true,
      },
    });
    res.status(201).json(newComment);
  } catch (error: any) {
    console.log("Error creating comment:", error);
    res
      .status(500)
      .json({ message: `Error creating comment: ${error.message}` });
  }
};
