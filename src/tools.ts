import { z } from 'zod';
import { MauticClient } from './client.js';

export class MauticTools {
  private client: MauticClient;

  constructor(client: MauticClient) {
    this.client = client;
  }

  getToolDefinitions() {
    return [
      {
        name: "mautic_list_contacts",
        description: "List contacts from Mautic with filtering and pagination options",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of contacts to retrieve (1-100)",
              minimum: 1,
              maximum: 100,
              default: 10
            },
            search: {
              type: "string",
              description: "Search term for filtering contacts by email, name, etc."
            },
            orderBy: {
              type: "string",
              enum: ["id", "email", "date_added"],
              description: "Field to sort by"
            },
            orderByDir: {
              type: "string",
              enum: ["asc", "desc"],
              description: "Sort direction",
              default: "asc"
            },
            start: {
              type: "number",
              description: "Starting position for pagination",
              minimum: 0,
              default: 0
            }
          }
        }
      },
      {
        name: "mautic_create_contact",
        description: "Create a new contact in Mautic",
        inputSchema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Contact email address (required)"
            },
            firstname: {
              type: "string",
              description: "Contact first name"
            },
            lastname: {
              type: "string",
              description: "Contact last name"
            },
            company: {
              type: "string",
              description: "Contact company name"
            },
            phone: {
              type: "string",
              description: "Contact phone number"
            }
          },
          required: ["email"]
        }
      }
    ];
  }

  async executeTool(name: string, args: any) {
    try {
      switch (name) {
        case "mautic_list_contacts":
          return await this.listContacts(args);
        case "mautic_create_contact":
          return await this.createContact(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  private async listContacts(args: any = {}) {
    const schema = z.object({
      limit: z.number().min(1).max(100).optional().default(10),
      search: z.string().optional(),
      orderBy: z.enum(['id', 'email', 'date_added']).optional(),
      orderByDir: z.enum(['asc', 'desc']).optional().default('asc'),
      start: z.number().min(0).optional().default(0)
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.listContacts(validatedArgs);
    
    const contacts = Object.values(response.contacts);
    const summary = `Found ${response.total} total contacts, showing ${contacts.length} contacts`;
    
    return {
      content: [
        {
          type: "text",
          text: `${summary}\n\n${JSON.stringify({
            total: response.total,
            showing: contacts.length,
            contacts: contacts.map(contact => ({
              id: contact.id,
              email: contact.email,
              name: `${contact.firstname || ''} ${contact.lastname || ''}`.trim(),
              company: contact.company
            }))
          }, null, 2)}`
        }
      ]
    };
  }

  private async createContact(args: any) {
    const schema = z.object({
      email: z.string().email(),
      firstname: z.string().optional(),
      lastname: z.string().optional(),
      company: z.string().optional(),
      phone: z.string().optional()
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.createContact(validatedArgs);
    
    return {
      content: [
        {
          type: "text",
          text: `Contact created successfully:\n\n${JSON.stringify({
            id: response.contact.id,
            email: response.contact.email,
            name: `${response.contact.firstname || ''} ${response.contact.lastname || ''}`.trim(),
            company: response.contact.company,
            createdAt: response.contact.dateAdded
          }, null, 2)}`
        }
      ]
    };
  }
}