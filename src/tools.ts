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
      },
      {
        name: "mautic_update_contact",
        description: "Update an existing contact in Mautic",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Contact ID to update (required)"
            },
            email: {
              type: "string",
              format: "email",
              description: "Contact email address"
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
          required: ["id"]
        }
      },
      {
        name: "mautic_delete_contact",
        description: "⚠️ DANGER: Permanently delete a contact from Mautic (requires confirmation)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Contact ID to delete (required)"
            },
            confirm: {
              type: "boolean",
              description: "Must be set to true to confirm deletion (required for safety)"
            }
          },
          required: ["id", "confirm"]
        }
      },
      {
        name: "mautic_get_stats",
        description: "Get statistical data from Mautic database tables",
        inputSchema: {
          type: "object",
          properties: {
            table: {
              type: "string",
              enum: [
                "email_stats",
                "asset_downloads", 
                "campaign_lead_event_log",
                "campaign_leads",
                "email_stats_devices",
                "email_stat_replies",
                "form_submissions",
                "lead_event_log",
                "page_hits",
                "push_notification_stats",
                "sms_message_stats"
              ],
              description: "Statistical table to query"
            },
            limit: {
              type: "number",
              description: "Number of records to return (default: 10)",
              minimum: 1,
              maximum: 1000,
              default: 10
            },
            start: {
              type: "number",
              description: "Starting row (default: 0)",
              minimum: 0,
              default: 0
            }
          }
        }
      },
      {
        name: "mautic_get_dashboard_data",
        description: "Get dashboard analytics data for widgets and charts",
        inputSchema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: [
                "emails.in.time",
                "sent.email.to.contacts",
                "most.hit.email.redirects",
                "created.leads.in.time",
                "anonymous.vs.identified.leads",
                "map.of.leads",
                "top.lists",
                "top.creators",
                "created.leads.today"
              ],
              description: "Type of dashboard data to retrieve"
            },
            dateFrom: {
              type: "string",
              description: "Start date (YYYY-MM-DD format)"
            },
            dateTo: {
              type: "string", 
              description: "End date (YYYY-MM-DD format)"
            },
            timeUnit: {
              type: "string",
              enum: ["Y", "m", "W", "d", "H"],
              description: "Time unit: Y=Year, m=Month, W=Week, d=Day, H=Hour",
              default: "d"
            }
          }
        }
      },
      {
        name: "mautic_get_contact_activity",
        description: "Get activity timeline for a specific contact",
        inputSchema: {
          type: "object",
          properties: {
            contactId: {
              type: "number",
              description: "Contact ID to get activity for (required)"
            },
            search: {
              type: "string",
              description: "Search term to filter activities"
            },
            includeEvents: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "lead.identified",
                  "asset.download", 
                  "campaign.event",
                  "email.read",
                  "email.sent",
                  "email.failed",
                  "form.submitted",
                  "page.hit",
                  "point.gained",
                  "lead.utmtagsadded"
                ]
              },
              description: "Specific event types to include"
            }
          },
          required: ["contactId"]
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
        case "mautic_update_contact":
          return await this.updateContact(args);
        case "mautic_delete_contact":
          return await this.deleteContact(args);
        case "mautic_get_stats":
          return await this.getStats(args);
        case "mautic_get_dashboard_data":
          return await this.getDashboardData(args);
        case "mautic_get_contact_activity":
          return await this.getContactActivity(args);
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
            contacts: contacts
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

  private async updateContact(args: any) {
    const schema = z.object({
      id: z.number(),
      email: z.string().email().optional(),
      firstname: z.string().optional(),
      lastname: z.string().optional(),
      company: z.string().optional(),
      phone: z.string().optional()
    });

    const validatedArgs = schema.parse(args);
    const { id, ...updateData } = validatedArgs;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    const response = await this.client.updateContact(id, cleanUpdateData);
    
    return {
      content: [
        {
          type: "text",
          text: `Contact updated successfully:\n\n${JSON.stringify({
            id: response.contact.id,
            email: response.contact.email,
            name: `${response.contact.firstname || ''} ${response.contact.lastname || ''}`.trim(),
            company: response.contact.company,
            updatedAt: response.contact.dateModified
          }, null, 2)}`
        }
      ]
    };
  }

  private async deleteContact(args: any) {
    const schema = z.object({
      id: z.number(),
      confirm: z.boolean()
    });

    const validatedArgs = schema.parse(args);
    
    if (!validatedArgs.confirm) {
      throw new Error('Deletion not confirmed. Set confirm: true to proceed with deletion.');
    }

    const response = await this.client.deleteContact(validatedArgs.id);
    
    return {
      content: [
        {
          type: "text",
          text: `Contact deleted successfully:\n\n${JSON.stringify({
            id: response.contact.id,
            email: response.contact.email,
            name: `${response.contact.firstname || ''} ${response.contact.lastname || ''}`.trim(),
            deletedAt: new Date().toISOString()
          }, null, 2)}`
        }
      ]
    };
  }

  private async getStats(args: any) {
    const schema = z.object({
      table: z.string().optional(),
      limit: z.number().min(1).max(1000).optional().default(10),
      start: z.number().min(0).optional().default(0)
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.getStats(validatedArgs);
    
    return {
      content: [
        {
          type: "text",
          text: `Statistics from ${validatedArgs.table || 'all tables'}:\n\n${JSON.stringify({
            total: response.total,
            table: validatedArgs.table || 'summary',
            stats: response.stats
          }, null, 2)}`
        }
      ]
    };
  }

  private async getDashboardData(args: any) {
    const schema = z.object({
      type: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      timeUnit: z.enum(['Y', 'm', 'W', 'd', 'H']).optional().default('d')
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.getData(validatedArgs);
    
    return {
      content: [
        {
          type: "text",
          text: `Dashboard data${validatedArgs.type ? ` for ${validatedArgs.type}` : ''}:\n\n${JSON.stringify({
            type: validatedArgs.type || 'summary',
            dateRange: validatedArgs.dateFrom && validatedArgs.dateTo 
              ? `${validatedArgs.dateFrom} to ${validatedArgs.dateTo}` 
              : 'default range',
            timeUnit: validatedArgs.timeUnit,
            data: response.data,
            dateFormat: response.dateFormat
          }, null, 2)}`
        }
      ]
    };
  }

  private async getContactActivity(args: any) {
    const schema = z.object({
      contactId: z.number(),
      search: z.string().optional(),
      includeEvents: z.array(z.string()).optional()
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.getContactActivity(validatedArgs.contactId, {
      search: validatedArgs.search,
      includeEvents: validatedArgs.includeEvents
    });
    
    return {
      content: [
        {
          type: "text",
          text: `Activity for contact ${validatedArgs.contactId}:\n\n${JSON.stringify({
            contactId: validatedArgs.contactId,
            filters: {
              search: validatedArgs.search,
              includeEvents: validatedArgs.includeEvents
            },
            activities: response
          }, null, 2)}`
        }
      ]
    };
  }
}