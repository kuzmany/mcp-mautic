# MCP Mautic Server

A Model Context Protocol (MCP) server for integrating with Mautic marketing automation platform.

## Features

- **OAuth2 Client Credentials Authentication** - Secure server-to-server authentication
- **Contact Management** - Complete CRUD operations for contacts in Mautic
- **Statistics & Analytics** - Access to email stats, campaign data, and contact activity
- **Dashboard Data** - Real-time analytics and performance metrics
- **Type-Safe API** - Full TypeScript support with input validation
- **Error Handling** - Comprehensive error handling and logging

## Available Tools

### Contact Management

#### `mautic_list_contacts`
List contacts from Mautic with filtering and pagination options.

**Parameters:**
- `limit` (number, 1-100): Number of contacts to retrieve (default: 10)
- `search` (string): Search term for filtering contacts
- `orderBy` (string): Field to sort by (`id`, `email`, `date_added`)
- `orderByDir` (string): Sort direction (`asc`, `desc`)
- `start` (number): Starting position for pagination

#### `mautic_create_contact`
Create a new contact in Mautic.

**Parameters:**
- `email` (string, required): Contact email address
- `firstname` (string): Contact first name
- `lastname` (string): Contact last name
- `company` (string): Contact company name
- `phone` (string): Contact phone number

#### `mautic_update_contact`
Update an existing contact in Mautic.

**Parameters:**
- `id` (number, required): Contact ID to update
- `email` (string): Contact email address
- `firstname` (string): Contact first name
- `lastname` (string): Contact last name
- `company` (string): Contact company name
- `phone` (string): Contact phone number

#### `mautic_delete_contact`
⚠️ **DANGER**: Permanently delete a contact from Mautic.

**Parameters:**
- `id` (number, required): Contact ID to delete
- `confirm` (boolean, required): Must be `true` to confirm deletion

### Statistics & Analytics

#### `mautic_get_stats`
Get statistical data from Mautic database tables.

**Parameters:**
- `table` (string): Statistical table to query (`email_stats`, `asset_downloads`, `campaign_lead_event_log`, `form_submissions`, `page_hits`, etc.)
- `limit` (number, 1-1000): Number of records to return (default: 10)
- `start` (number): Starting row (default: 0)

#### `mautic_get_dashboard_data`
Get dashboard analytics data for widgets and charts.

**Parameters:**
- `type` (string): Data type (`emails.in.time`, `created.leads.in.time`, `most.hit.email.redirects`, etc.)
- `dateFrom` (string): Start date (YYYY-MM-DD format)
- `dateTo` (string): End date (YYYY-MM-DD format)
- `timeUnit` (string): Time unit (`Y`, `m`, `W`, `d`, `H`)

#### `mautic_get_contact_activity`
Get activity timeline for a specific contact.

**Parameters:**
- `contactId` (number, required): Contact ID to get activity for
- `search` (string): Search term to filter activities
- `includeEvents` (array): Specific event types to include (`email.read`, `form.submitted`, `page.hit`, etc.)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure your Mautic settings:

```bash
cp .env.example .env
```

Edit `.env`:
```
MAUTIC_URL=https://your-mautic-instance.com
MAUTIC_CLIENT_ID=your_client_id
MAUTIC_CLIENT_SECRET=your_client_secret
```

### 3. Set up Mautic API Access

1. Go to your Mautic instance → Configuration → API Settings
2. Set "API enabled" to "Yes"
3. Go to API Credentials and create new credentials
4. Set grant type to "Client Credentials"
5. Copy the Client ID and Client Secret to your `.env` file

### 4. Build and Run

```bash
npm run build
npm start
```

## Development

```bash
# Watch mode for development
npm run dev

# Build TypeScript
npm run build
```

## MCP Client Configuration

Add to your MCP client configuration:

### Global Installation (Recommended)

```bash
# Install globally
sudo npm install -g .

# Then use in MCP configuration
{
  "mcpServers": {
    "mautic": {
      "command": "mcp-mautic-server",
      "env": {
        "MAUTIC_URL": "https://your-mautic-instance.com",
        "MAUTIC_CLIENT_ID": "your_client_id",
        "MAUTIC_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

### Local Installation

```json
{
  "mcpServers": {
    "mautic": {
      "command": "node",
      "args": ["/path/to/mcp-mautic-server/build/index.js"],
      "env": {
        "MAUTIC_URL": "https://your-mautic-instance.com",
        "MAUTIC_CLIENT_ID": "your_client_id",
        "MAUTIC_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

## Available Statistics Tables

When using `mautic_get_stats`, you can query these tables:

- **`email_stats`** - Email delivery, opens, clicks, bounces
- **`asset_downloads`** - Asset download tracking
- **`campaign_lead_event_log`** - Campaign interaction logs
- **`campaign_leads`** - Contact-campaign associations
- **`email_stats_devices`** - Email client and device statistics
- **`email_stat_replies`** - Email reply tracking
- **`form_submissions`** - Form submission data
- **`lead_event_log`** - Complete contact activity logs
- **`page_hits`** - Website page view statistics
- **`push_notification_stats`** - Push notification metrics
- **`sms_message_stats`** - SMS message statistics

## Dashboard Data Types

When using `mautic_get_dashboard_data`, available types include:

- **`emails.in.time`** - Email performance over time
- **`sent.email.to.contacts`** - Email delivery statistics
- **`most.hit.email.redirects`** - Click tracking data
- **`created.leads.in.time`** - New contact creation trends
- **`anonymous.vs.identified.leads`** - Contact identification metrics
- **`map.of.leads`** - Geographic distribution of contacts
- **`top.lists`** - Most active contact segments
- **`top.creators`** - User activity statistics
- **`created.leads.today`** - Daily contact creation

## Architecture

- **`auth.ts`** - OAuth2 client credentials authentication
- **`client.ts`** - Mautic API client with statistics endpoints
- **`tools.ts`** - MCP tool definitions and implementations  
- **`types.ts`** - TypeScript type definitions
- **`index.ts`** - Main server entry point

## Error Handling

The server includes comprehensive error handling:
- OAuth2 token refresh with automatic retry
- API error parsing and user-friendly messages
- Input validation using Zod schemas
- Connection error handling

## License

MIT