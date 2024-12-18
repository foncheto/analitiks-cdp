import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export interface Project {
  id: number;

  name: string;

  description?: string;

  startDate?: string;

  endDate?: string;

  clientId: number | null;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export interface User {
  userId?: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  cognitoId?: string;
  teamId?: number;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

// New interfaces for Client, Sale, Contact, and Interaction
export interface Client {
  id: number;
  companyName: string;
  industry?: string;
  email: string;
  phone?: string;
  address?: string;
  position?: [number, number];
  region?: string;
}

export interface Sale {
  id: number;
  amount: number;
  date: string;
  description?: string;
  clientId: number;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  clientId: number;
}

export interface Interaction {
  id: number;
  type: string;
  date: string;
  notes?: string;
  clientId?: number;
  contactId?: number;
  email?: string;
  phoneNumber?: string;
}

export interface Comment {
  id: number;
  text: string;
  taskId: number;
  authorUserId: number;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  source?: string;
  notes?: string;
  clientId?: number;
  assignedTo?: number;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { accessToken } = session.tokens ?? {};
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "Projects",
    "Tasks",
    "Users",
    "Teams",
    "Clients",
    "Sales",
    "Contacts",
    "Interactions",
    "Comments",
    "Leads",
  ],
  endpoints: (build) => ({
    getAuthUser: build.query({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const user = await getCurrentUser();
          const session = await fetchAuthSession();
          if (!session) throw new Error("No session found");
          const { userSub } = session;
          const { accessToken } = session.tokens ?? {};

          const userDetailsResponse = await fetchWithBQ(`users/${userSub}`);
          const userDetails = userDetailsResponse.data as User;

          return { data: { user, userSub, userDetails } };
        } catch (error: any) {
          return { error: error.message || "Could not fetch user data" };
        }
      },
    }),
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: ["Projects"],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
    }),
    // New endpoints for Client, Sale, Contact, and Interaction
    getClients: build.query<Client[], void>({
      query: () => "clients",
      providesTags: ["Clients"],
    }),
    getClient: build.query<Client, number>({
      query: (clientId) => `clients/${clientId}`,
      providesTags: (result, error, clientId) => [
        { type: "Clients", id: clientId },
      ],
    }),
    createClient: build.mutation<Client, Partial<Client>>({
      query: (client) => ({
        url: "clients",
        method: "POST",
        body: client,
      }),
      invalidatesTags: ["Clients"],
    }),

    getSales: build.query<Sale[], void>({
      query: () => "sales",
      providesTags: ["Sales"],
    }),
    getSale: build.query<Sale, number>({
      query: (saleId) => `sales/${saleId}`,
      providesTags: (result, error, saleId) => [{ type: "Sales", id: saleId }],
    }),
    createSale: build.mutation<Sale, Partial<Sale>>({
      query: (sale) => ({
        url: "sales",
        method: "POST",
        body: sale,
      }),
      invalidatesTags: ["Sales"],
    }),

    getContacts: build.query<Contact[], void>({
      query: () => "contacts",
      providesTags: ["Contacts"],
    }),
    getContact: build.query<Contact, number>({
      query: (contactId) => `contacts/${contactId}`,
      providesTags: (result, error, contactId) => [
        { type: "Contacts", id: contactId },
      ],
    }),
    createContact: build.mutation<Contact, Partial<Contact>>({
      query: (contact) => ({
        url: "contacts",
        method: "POST",
        body: contact,
      }),
      invalidatesTags: ["Contacts"],
    }),

    getInteractions: build.query<Interaction[], void>({
      query: () => "interactions",
      providesTags: ["Interactions"],
    }),
    getInteraction: build.query<Interaction, number>({
      query: (interactionId) => `interactions/${interactionId}`,
      providesTags: (result, error, interactionId) => [
        { type: "Interactions", id: interactionId },
      ],
    }),
    createInteraction: build.mutation<Interaction, Partial<Interaction>>({
      query: (interaction) => ({
        url: "interactions",
        method: "POST",
        body: interaction,
      }),
      invalidatesTags: ["Interactions"],
    }),
    getProjectsByClientId: build.query<Project[], number>({
      query: (clientId) => `projects?clientId=${clientId}`, // Fetch projects by clientId
      providesTags: (result, error, clientId) => [
        { type: "Projects", id: clientId },
      ],
    }),
    getComments: build.query<Comment[], { taskId: number }>({
      query: ({ taskId }) => `tasks/${taskId}/comments`,
      providesTags: (result, error, { taskId }) => [
        { type: "Comments", id: taskId },
      ],
    }),
    addComment: build.mutation<Comment, { taskId: number; text: string }>({
      query: ({ taskId, text }) => ({
        url: `tasks/${taskId}/comments`,
        method: "POST",
        body: { text, taskId, userId: 1 }, // Hardcoded userId for now
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Comments", id: taskId },
      ],
    }),

    // Leads Endpoints
    getLeads: build.query<Lead[], void>({
      query: () => "leads",
      providesTags: ["Leads"],
    }),
    getLead: build.query<Lead, number>({
      query: (leadId) => `leads/${leadId}`,
      providesTags: (result, error, leadId) => [{ type: "Leads", id: leadId }],
    }),
    createLead: build.mutation<Lead, Partial<Lead>>({
      query: (lead) => ({
        url: "leads",
        method: "POST",
        body: lead,
      }),
      invalidatesTags: ["Leads"],
    }),
    updateLeadStatus: build.mutation<Lead, { leadId: number; status: string }>({
      query: ({ leadId, status }) => ({
        url: `leads/${leadId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { leadId }) => [
        { type: "Leads", id: leadId },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
  // New hooks for Client, Sale, Contact, and Interaction
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useGetSalesQuery,
  useGetSaleQuery,
  useCreateSaleMutation,
  useGetContactsQuery,
  useGetContactQuery,
  useCreateContactMutation,
  useGetInteractionsQuery,
  useGetInteractionQuery,
  useCreateInteractionMutation,
  useGetProjectsByClientIdQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadStatusMutation,
} = api;
