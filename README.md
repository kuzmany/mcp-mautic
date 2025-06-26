# MCP Mautic Server

A Model Context Protocol (MCP) server for integrating with Mautic marketing automation platform.

## Features

- **OAuth2 Client Credentials Authentication** - Secure server-to-server authentication
- **Contact Management** - List and create contacts in Mautic
- **Type-Safe API** - Full TypeScript support with input validation
- **Error Handling** - Comprehensive error handling and logging

## Available Tools

### `mautic_list_contacts`
List contacts from Mautic with filtering and pagination options.

**Parameters:**
- `limit` (number, 1-100): Number of contacts to retrieve (default: 10)
- `search` (string): Search term for filtering contacts
- `orderBy` (string): Field to sort by (`id`, `email`, `date_added`)
- `orderByDir` (string): Sort direction (`asc`, `desc`)
- `start` (number): Starting position for pagination

### `mautic_create_contact`
Create a new contact in Mautic.

**Parameters:**
- `email` (string, required): Contact email address
- `firstname` (string): Contact first name
- `lastname` (string): Contact last name
- `company` (string): Contact company name
- `phone` (string): Contact phone number

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

## Architecture

- **`auth.ts`** - OAuth2 client credentials authentication
- **`client.ts`** - Mautic API client with automatic token management
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