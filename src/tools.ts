import { z } from 'zod';
import { MauticClient } from './client.js';

export class MauticTools {
  private client: MauticClient;

  constructor(client: MauticClient) {
    this.client = client;
  }

  private filterContactResponse(contact: any, fullResponse: boolean = false): any {
    if (fullResponse || !contact.fields) {
      return contact;
    }

    // Create a simplified contact object with only fields.all
    const filtered = { ...contact };
    if (contact.fields && contact.fields.all) {
      filtered.fields = { all: contact.fields.all };
    }
    
    return filtered;
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
            },
            minimal: {
              type: "boolean",
              description: "Return minimal contact data (default: true for reduced output)",
              default: true
            },
            fullResponse: {
              type: "boolean",
              description: "Return complete field definitions (default: false, only returns fields.all)",
              default: false
            }
          }
        }
      },
      {
        name: "mautic_get_contact",
        description: "Get a specific contact by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Contact ID to retrieve (required)"
            },
            fullResponse: {
              type: "boolean",
              description: "Return complete field definitions (default: false, only returns fields.all)",
              default: false
            }
          },
          required: ["id"]
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
            },
            fullResponse: {
              type: "boolean",
              description: "Return complete field definitions (default: false, only returns fields.all)",
              default: false
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
            },
            fullResponse: {
              type: "boolean",
              description: "Return complete field definitions (default: false, only returns fields.all)",
              default: false
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
            },
            fullResponse: {
              type: "boolean",
              description: "Return complete field definitions (default: false, only returns fields.all)",
              default: false
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
      },
      // Asset management tools
      {
        name: "mautic_list_assets",
        description: "List assets from Mautic with filtering and pagination options",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of assets to retrieve (1-100)",
              minimum: 1,
              maximum: 100,
              default: 10
            },
            search: {
              type: "string",
              description: "Search term for filtering assets by title, description, etc."
            },
            orderBy: {
              type: "string",
              enum: ["id", "title", "alias", "downloadCount"],
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
            },
            publishedOnly: {
              type: "boolean",
              description: "Return only published assets",
              default: false
            },
            minimal: {
              type: "boolean",
              description: "Return minimal asset data (default: true for reduced output)",
              default: true
            }
          }
        }
      },
      {
        name: "mautic_get_asset",
        description: "Get a specific asset by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Asset ID to retrieve (required)"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "mautic_create_asset",
        description: "Create a new asset in Mautic",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Asset title (required)"
            },
            description: {
              type: "string",
              description: "Asset description"
            },
            alias: {
              type: "string",
              description: "Asset alias"
            },
            language: {
              type: "string",
              description: "Asset language"
            },
            isPublished: {
              type: "boolean",
              description: "Whether the asset is published",
              default: true
            },
            storageLocation: {
              type: "string",
              enum: ["local", "remote"],
              description: "Storage location for the asset",
              default: "local"
            },
            remotePath: {
              type: "string",
              description: "Remote path (URL) for remote assets"
            },
            category: {
              type: "string",
              description: "Asset category"
            }
          },
          required: ["title"]
        }
      },
      {
        name: "mautic_update_asset",
        description: "Update an existing asset in Mautic",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Asset ID to update (required)"
            },
            title: {
              type: "string",
              description: "Asset title"
            },
            description: {
              type: "string",
              description: "Asset description"
            },
            alias: {
              type: "string",
              description: "Asset alias"
            },
            language: {
              type: "string",
              description: "Asset language"
            },
            isPublished: {
              type: "boolean",
              description: "Whether the asset is published"
            },
            category: {
              type: "string",
              description: "Asset category"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "mautic_delete_asset",
        description: "⚠️ DANGER: Permanently delete an asset from Mautic (requires confirmation)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Asset ID to delete (required)"
            },
            confirm: {
              type: "boolean",
              description: "Must be set to true to confirm deletion (required for safety)"
            }
          },
          required: ["id", "confirm"]
        }
      },
      // Segment management tools
      {
        name: "mautic_list_segments",
        description: "List segments from Mautic with filtering and pagination options",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of segments to retrieve (1-100)",
              minimum: 1,
              maximum: 100,
              default: 10
            },
            search: {
              type: "string",
              description: "Search term for filtering segments by name, description, etc."
            },
            orderBy: {
              type: "string",
              enum: ["id", "name", "alias"],
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
            },
            publishedOnly: {
              type: "boolean",
              description: "Return only published segments",
              default: false
            },
            minimal: {
              type: "boolean",
              description: "Return minimal segment data (default: true for reduced output)",
              default: true
            }
          }
        }
      },
      {
        name: "mautic_get_segment",
        description: "Get a specific segment by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Segment ID to retrieve (required)"
            }
          },
          required: ["id"]
        }
      },
      {
        name: "mautic_create_segment",
        description: "Create a new segment in Mautic",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Segment name (required)"
            },
            alias: {
              type: "string",
              description: "Segment alias"
            },
            description: {
              type: "string",
              description: "Segment description"
            },
            isPublished: {
              type: "boolean",
              description: "Whether the segment is published",
              default: true
            },
            filters: {
              type: "array",
              description: "Array of filter objects for segment criteria",
              items: {
                type: "object",
                properties: {
                  glue: {
                    type: "string",
                    enum: ["and", "or"],
                    description: "Logical operator to connect filters"
                  },
                  field: {
                    type: "string",
                    description: "Field to filter on"
                  },
                  operator: {
                    type: "string",
                    enum: ["=", "!=", "empty", "!empty", "like", "!like", "regexp", "!regexp", "startsWith", "endsWith", "contains"],
                    description: "Comparison operator"
                  },
                  filter: {
                    description: "Filter value"
                  }
                }
              }
            }
          },
          required: ["name"]
        }
      },
      {
        name: "mautic_update_segment",
        description: "Update an existing segment in Mautic",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Segment ID to update (required)"
            },
            name: {
              type: "string",
              description: "Segment name"
            },
            alias: {
              type: "string",
              description: "Segment alias"
            },
            description: {
              type: "string",
              description: "Segment description"
            },
            isPublished: {
              type: "boolean",
              description: "Whether the segment is published"
            },
            filters: {
              type: "array",
              description: "Array of filter objects for segment criteria",
              items: {
                type: "object",
                properties: {
                  glue: {
                    type: "string",
                    enum: ["and", "or"],
                    description: "Logical operator to connect filters"
                  },
                  field: {
                    type: "string",
                    description: "Field to filter on"
                  },
                  operator: {
                    type: "string",
                    enum: ["=", "!=", "empty", "!empty", "like", "!like", "regexp", "!regexp", "startsWith", "endsWith", "contains"],
                    description: "Comparison operator"
                  },
                  filter: {
                    description: "Filter value"
                  }
                }
              }
            }
          },
          required: ["id"]
        }
      },
      {
        name: "mautic_delete_segment",
        description: "⚠️ DANGER: Permanently delete a segment from Mautic (requires confirmation)",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Segment ID to delete (required)"
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
        name: "mautic_add_contact_to_segment",
        description: "Add a contact to a specific segment",
        inputSchema: {
          type: "object",
          properties: {
            segmentId: {
              type: "number",
              description: "Segment ID (required)"
            },
            contactId: {
              type: "number",
              description: "Contact ID to add to segment (required)"
            }
          },
          required: ["segmentId", "contactId"]
        }
      },
      {
        name: "mautic_remove_contact_from_segment",
        description: "Remove a contact from a specific segment",
        inputSchema: {
          type: "object",
          properties: {
            segmentId: {
              type: "number",
              description: "Segment ID (required)"
            },
            contactId: {
              type: "number",
              description: "Contact ID to remove from segment (required)"
            }
          },
          required: ["segmentId", "contactId"]
        }
      }
    ];
  }

  async executeTool(name: string, args: any) {
    try {
      switch (name) {
        case "mautic_list_contacts":
          return await this.listContacts(args);
        case "mautic_get_contact":
          return await this.getContact(args);
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
        // Asset tools
        case "mautic_list_assets":
          return await this.listAssets(args);
        case "mautic_get_asset":
          return await this.getAsset(args);
        case "mautic_create_asset":
          return await this.createAsset(args);
        case "mautic_update_asset":
          return await this.updateAsset(args);
        case "mautic_delete_asset":
          return await this.deleteAsset(args);
        // Segment tools
        case "mautic_list_segments":
          return await this.listSegments(args);
        case "mautic_get_segment":
          return await this.getSegment(args);
        case "mautic_create_segment":
          return await this.createSegment(args);
        case "mautic_update_segment":
          return await this.updateSegment(args);
        case "mautic_delete_segment":
          return await this.deleteSegment(args);
        case "mautic_add_contact_to_segment":
          return await this.addContactToSegment(args);
        case "mautic_remove_contact_from_segment":
          return await this.removeContactFromSegment(args);
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

  private async getContact(args: any) {
    const schema = z.object({
      id: z.number(),
      fullResponse: z.boolean().optional().default(false)
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.getContact(validatedArgs.id);
    
    const filteredContact = this.filterContactResponse(response.contact, validatedArgs.fullResponse);
    
    return {
      content: [
        {
          type: "text",
          text: `Contact retrieved successfully:\n\n${JSON.stringify(filteredContact, null, 2)}`
        }
      ]
    };
  }

  private async listContacts(args: any = {}) {
    const schema = z.object({
      limit: z.number().min(1).max(100).optional().default(10),
      search: z.string().optional(),
      orderBy: z.enum(['id', 'email', 'date_added']).optional(),
      orderByDir: z.enum(['asc', 'desc']).optional().default('asc'),
      start: z.number().min(0).optional().default(0),
      minimal: z.boolean().optional().default(true),
      fullResponse: z.boolean().optional().default(false)
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.listContacts(validatedArgs);
    
    const contacts = Object.values(response.contacts).map(contact => 
      this.filterContactResponse(contact, validatedArgs.fullResponse)
    );
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
      phone: z.string().optional(),
      fullResponse: z.boolean().optional().default(false)
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.createContact(validatedArgs);
    
    const filteredContact = this.filterContactResponse(response.contact, validatedArgs.fullResponse);
    
    return {
      content: [
        {
          type: "text",
          text: `Contact created successfully:\n\n${JSON.stringify(filteredContact, null, 2)}`
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
      phone: z.string().optional(),
      fullResponse: z.boolean().optional().default(false)
    });

    const validatedArgs = schema.parse(args);
    const { id, fullResponse, ...updateData } = validatedArgs;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    const response = await this.client.updateContact(id, cleanUpdateData);
    
    const filteredContact = this.filterContactResponse(response.contact, fullResponse);
    
    return {
      content: [
        {
          type: "text",
          text: `Contact updated successfully:\n\n${JSON.stringify(filteredContact, null, 2)}`
        }
      ]
    };
  }

  private async deleteContact(args: any) {
    const schema = z.object({
      id: z.number(),
      confirm: z.boolean(),
      fullResponse: z.boolean().optional().default(false)
    });

    const validatedArgs = schema.parse(args);
    
    if (!validatedArgs.confirm) {
      throw new Error('Deletion not confirmed. Set confirm: true to proceed with deletion.');
    }

    const response = await this.client.deleteContact(validatedArgs.id);
    
    const filteredContact = this.filterContactResponse(response.contact, validatedArgs.fullResponse);
    
    return {
      content: [
        {
          type: "text",
          text: `Contact deleted successfully:\n\n${JSON.stringify(filteredContact, null, 2)}`
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

  // Asset methods
  private async listAssets(args: any = {}) {
    const schema = z.object({
      limit: z.number().min(1).max(100).optional().default(10),
      search: z.string().optional(),
      orderBy: z.enum(['id', 'title', 'alias', 'downloadCount']).optional(),
      orderByDir: z.enum(['asc', 'desc']).optional().default('asc'),
      start: z.number().min(0).optional().default(0),
      publishedOnly: z.boolean().optional(),
      minimal: z.boolean().optional().default(true)
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.listAssets(validatedArgs);
    
    const assets = Object.values(response.assets);
    const summary = `Found ${response.total} total assets, showing ${assets.length} assets`;
    
    return {
      content: [
        {
          type: "text",
          text: `${summary}\n\n${JSON.stringify({
            total: response.total,
            showing: assets.length,
            assets: assets
          }, null, 2)}`
        }
      ]
    };
  }

  private async getAsset(args: any) {
    const schema = z.object({
      id: z.number()
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.getAsset(validatedArgs.id);
    
    return {
      content: [
        {
          type: "text",
          text: `Asset details:\n\n${JSON.stringify({
            id: response.asset.id,
            title: response.asset.title,
            description: response.asset.description,
            downloadCount: response.asset.downloadCount,
            storageLocation: response.asset.storageLocation,
            isPublished: response.asset.isPublished
          }, null, 2)}`
        }
      ]
    };
  }

  private async createAsset(args: any) {
    const schema = z.object({
      title: z.string(),
      description: z.string().optional(),
      alias: z.string().optional(),
      language: z.string().optional(),
      isPublished: z.boolean().optional(),
      storageLocation: z.enum(['local', 'remote']).optional(),
      remotePath: z.string().optional(),
      category: z.string().optional()
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.createAsset(validatedArgs);
    
    return {
      content: [
        {
          type: "text",
          text: `Asset created successfully:\n\n${JSON.stringify({
            id: response.asset.id,
            title: response.asset.title,
            description: response.asset.description,
            storageLocation: response.asset.storageLocation,
            isPublished: response.asset.isPublished,
            createdAt: response.asset.dateAdded
          }, null, 2)}`
        }
      ]
    };
  }

  private async updateAsset(args: any) {
    const schema = z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      alias: z.string().optional(),
      language: z.string().optional(),
      isPublished: z.boolean().optional(),
      category: z.string().optional()
    });

    const validatedArgs = schema.parse(args);
    const { id, ...updateData } = validatedArgs;
    
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    const response = await this.client.updateAsset(id, cleanUpdateData);
    
    return {
      content: [
        {
          type: "text",
          text: `Asset updated successfully:\n\n${JSON.stringify({
            id: response.asset.id,
            title: response.asset.title,
            description: response.asset.description,
            isPublished: response.asset.isPublished,
            updatedAt: response.asset.dateModified
          }, null, 2)}`
        }
      ]
    };
  }

  private async deleteAsset(args: any) {
    const schema = z.object({
      id: z.number(),
      confirm: z.boolean()
    });

    const validatedArgs = schema.parse(args);
    
    if (!validatedArgs.confirm) {
      throw new Error('Deletion not confirmed. Set confirm: true to proceed with deletion.');
    }

    const response = await this.client.deleteAsset(validatedArgs.id);
    
    return {
      content: [
        {
          type: "text",
          text: `Asset deleted successfully:\n\n${JSON.stringify({
            id: response.asset.id,
            title: response.asset.title,
            deletedAt: new Date().toISOString()
          }, null, 2)}`
        }
      ]
    };
  }

  // Segment methods
  private async listSegments(args: any = {}) {
    const schema = z.object({
      limit: z.number().min(1).max(100).optional().default(10),
      search: z.string().optional(),
      orderBy: z.enum(['id', 'name', 'alias']).optional(),
      orderByDir: z.enum(['asc', 'desc']).optional().default('asc'),
      start: z.number().min(0).optional().default(0),
      publishedOnly: z.boolean().optional(),
      minimal: z.boolean().optional().default(true)
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.listSegments(validatedArgs);
    
    const segments = Object.values(response.lists);
    const summary = `Found ${response.total} total segments, showing ${segments.length} segments`;
    
    return {
      content: [
        {
          type: "text",
          text: `${summary}\n\n${JSON.stringify({
            total: response.total,
            showing: segments.length,
            segments: segments
          }, null, 2)}`
        }
      ]
    };
  }

  private async getSegment(args: any) {
    const schema = z.object({
      id: z.number()
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.getSegment(validatedArgs.id);
    
    return {
      content: [
        {
          type: "text",
          text: `Segment details:\n\n${JSON.stringify({
            id: response.list.id,
            name: response.list.name,
            alias: response.list.alias,
            description: response.list.description,
            isPublished: response.list.isPublished,
            filters: response.list.filters
          }, null, 2)}`
        }
      ]
    };
  }

  private async createSegment(args: any) {
    const schema = z.object({
      name: z.string(),
      alias: z.string().optional(),
      description: z.string().optional(),
      isPublished: z.boolean().optional(),
      filters: z.array(z.object({
        glue: z.enum(['and', 'or']).optional(),
        field: z.string().optional(),
        operator: z.string().optional(),
        filter: z.any().optional()
      })).optional()
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.createSegment(validatedArgs);
    
    return {
      content: [
        {
          type: "text",
          text: `Segment created successfully:\n\n${JSON.stringify({
            id: response.list.id,
            name: response.list.name,
            alias: response.list.alias,
            description: response.list.description,
            isPublished: response.list.isPublished,
            createdAt: response.list.dateAdded
          }, null, 2)}`
        }
      ]
    };
  }

  private async updateSegment(args: any) {
    const schema = z.object({
      id: z.number(),
      name: z.string().optional(),
      alias: z.string().optional(),
      description: z.string().optional(),
      isPublished: z.boolean().optional(),
      filters: z.array(z.object({
        glue: z.enum(['and', 'or']).optional(),
        field: z.string().optional(),
        operator: z.string().optional(),
        filter: z.any().optional()
      })).optional()
    });

    const validatedArgs = schema.parse(args);
    const { id, ...updateData } = validatedArgs;
    
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      throw new Error('At least one field must be provided for update');
    }

    const response = await this.client.updateSegment(id, cleanUpdateData);
    
    return {
      content: [
        {
          type: "text",
          text: `Segment updated successfully:\n\n${JSON.stringify({
            id: response.list.id,
            name: response.list.name,
            alias: response.list.alias,
            description: response.list.description,
            isPublished: response.list.isPublished,
            updatedAt: response.list.dateModified
          }, null, 2)}`
        }
      ]
    };
  }

  private async deleteSegment(args: any) {
    const schema = z.object({
      id: z.number(),
      confirm: z.boolean()
    });

    const validatedArgs = schema.parse(args);
    
    if (!validatedArgs.confirm) {
      throw new Error('Deletion not confirmed. Set confirm: true to proceed with deletion.');
    }

    const response = await this.client.deleteSegment(validatedArgs.id);
    
    return {
      content: [
        {
          type: "text",
          text: `Segment deleted successfully:\n\n${JSON.stringify({
            id: response.list.id,
            name: response.list.name,
            deletedAt: new Date().toISOString()
          }, null, 2)}`
        }
      ]
    };
  }

  private async addContactToSegment(args: any) {
    const schema = z.object({
      segmentId: z.number(),
      contactId: z.number()
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.addContactToSegment(validatedArgs.segmentId, validatedArgs.contactId);
    
    return {
      content: [
        {
          type: "text",
          text: `Contact successfully added to segment:\n\n${JSON.stringify({
            segmentId: validatedArgs.segmentId,
            contactId: validatedArgs.contactId,
            success: response.success,
            timestamp: new Date().toISOString()
          }, null, 2)}`
        }
      ]
    };
  }

  private async removeContactFromSegment(args: any) {
    const schema = z.object({
      segmentId: z.number(),
      contactId: z.number()
    });

    const validatedArgs = schema.parse(args);
    const response = await this.client.removeContactFromSegment(validatedArgs.segmentId, validatedArgs.contactId);
    
    return {
      content: [
        {
          type: "text",
          text: `Contact successfully removed from segment:\n\n${JSON.stringify({
            segmentId: validatedArgs.segmentId,
            contactId: validatedArgs.contactId,
            success: response.success,
            timestamp: new Date().toISOString()
          }, null, 2)}`
        }
      ]
    };
  }
}