import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  // Reverse the order for deletion to avoid foreign key constraints
  for (const modelName of modelNames.reverse()) {
    const model: any = prisma[modelName as keyof typeof prisma];
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  // Update the order here to respect dependencies
  const orderedFileNames = [
    "team.json", // Seed teams first as users reference team IDs
    "user.json", // Seed users next, as they might be referenced by tasks and contacts
    "client.json", // Seed clients before projects and sales reference them
    "project.json", // Seed projects, which reference clients
    "projectTeam.json", // Seed project-team relationships after teams and projects
    "contact.json", // Seed contacts after users and clients
    "interaction.json", // Seed interactions after users, clients, and contacts
    "sale.json", // Seed sales that reference clients
    "task.json", // Seed tasks after projects and users are seeded
    "taskAssignment.json", // Seed task assignments after tasks and users
    "attachment.json", // Seed attachments that reference tasks
    "comment.json", // Seed comments that reference tasks and users
  ];

  // Clear all data before seeding
  await deleteAllData(orderedFileNames);

  // Seed data in the specified order
  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    try {
      for (const data of jsonData) {
        await model.create({ data });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${modelName}:`, error);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
