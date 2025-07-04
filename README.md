# MCP Mautic Server

A Model Context Protocol (MCP) server for Mautic marketing automation platform. Provides secure API access to contacts, assets, segments, and analytics data.

## Quick Start

### Install & Use with NPX

```json
{
  "mcpServers": {
    "mautic": {
      "command": "npx",
      "args": ["--yes", "mcp-mautic-server"],
      "env": {
        "MAUTIC_URL": "https://your-mautic-instance.com",
        "MAUTIC_CLIENT_ID": "your_client_id",
        "MAUTIC_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

### Mautic API Setup

1. Go to Mautic → Configuration → API Settings
2. Enable API and create new credentials with "Client Credentials" grant type
3. Copy Client ID and Client Secret to your environment

## Key Features

- **OAuth2 Authentication** - Secure server-to-server access
- **Contact Management** - CRUD operations with optimized responses
- **Asset & Segment Management** - Complete marketing asset control
- **Analytics** - Email stats, campaign data, and contact activity
- **Response Optimization** - Minimal data by default, full responses on demand

## Core Tools

### Contacts
- `mautic_list_contacts` - List and search contacts
- `mautic_get_contact` - Get specific contact by ID
- `mautic_create_contact` - Create new contact
- `mautic_update_contact` - Update existing contact
- `mautic_delete_contact` - Delete contact (requires confirmation)

### Emails
- `mautic_list_emails` - List marketing emails
- `mautic_get_email` - Get specific email by ID
- `mautic_create_email` - Create new email (template or segment)
- `mautic_update_email` - Update email content and settings
- `mautic_delete_email` - Delete email (requires confirmation)
- `mautic_send_email_to_contact` - Send email to specific contact with token personalization
- `mautic_send_email_to_segments` - Send email to all contacts in assigned segments

### Assets
- `mautic_list_assets` - List marketing assets
- `mautic_get_asset` - Get specific asset
- `mautic_create_asset` - Create new asset
- `mautic_update_asset` - Update asset
- `mautic_delete_asset` - Delete asset

### Segments
- `mautic_list_segments` - List contact segments
- `mautic_get_segment` - Get specific segment
- `mautic_create_segment` - Create new segment with filters
- `mautic_update_segment` - Update segment
- `mautic_delete_segment` - Delete segment
- `mautic_add_contact_to_segment` - Add contact to segment
- `mautic_remove_contact_from_segment` - Remove contact from segment

### Analytics
- `mautic_get_stats` - Database statistics (email_stats, form_submissions, etc.)
- `mautic_get_dashboard_data` - Dashboard metrics (emails.in.time, created.leads.in.time, etc.)
- `mautic_get_contact_activity` - Contact activity timeline

## Response Optimization

All contact APIs return optimized responses by default:

- **Default**: Returns only `fields.all` (simplified key-value pairs)
- **Full Response**: Set `fullResponse: true` for complete field definitions
- **Minimal**: Set `minimal: true` for reduced API output (default for list operations)

## Common Parameters

Most list operations support:
- `limit` (1-100): Number of items to retrieve
- `search`: Search term for filtering
- `orderBy` / `orderByDir`: Sorting options
- `start`: Pagination offset
- `minimal`: Return reduced output (default: true)
- `fullResponse`: Return complete field data (default: false)

## Installation Options

### Global Install
```bash
npm install -g mcp-mautic-server
```

### Local Development
```bash
git clone <repo>
npm install
cp .env.example .env
npm run build
npm start
```

## Available Data Sources

**Statistics Tables**: `email_stats`, `asset_downloads`, `campaign_lead_event_log`, `form_submissions`, `page_hits`, `sms_message_stats`

**Dashboard Types**: `emails.in.time`, `created.leads.in.time`, `most.hit.email.redirects`, `anonymous.vs.identified.leads`, `map.of.leads`

## License

MIT