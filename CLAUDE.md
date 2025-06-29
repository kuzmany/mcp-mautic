# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides integration with Mautic marketing automation platform. It enables contact management, statistics retrieval, and analytics data access through a set of MCP tools.

## Common Commands

```bash
# Development
npm run build          # Build TypeScript to ./build directory
npm run dev           # Watch mode for development (tsc --watch)
npm start             # Run the built server
npm install           # Install dependencies

# Environment setup
cp .env.example .env  # Copy environment template
```

## Architecture Overview

**Core Components:**
- `src/index.ts` - Main MCP server entry point with configuration validation
- `src/client.ts` - Mautic API client with OAuth2 authentication
- `src/auth.ts` - OAuth2 client credentials flow implementation  
- `src/tools.ts` - MCP tool definitions and execution logic
- `src/types.ts` - TypeScript type definitions and Zod schemas

**Authentication Flow:**
- Uses OAuth2 client credentials grant type
- Automatic token refresh with retry logic
- Tokens stored in memory during server lifetime

**MCP Tools Available:**
- Contact CRUD operations (list, create, update, delete)
- Statistics access from Mautic database tables
- Dashboard analytics data retrieval
- Contact activity timeline tracking

## Environment Configuration

Required environment variables:
- `MAUTIC_URL` - Your Mautic instance URL (without trailing slash)
- `MAUTIC_CLIENT_ID` - OAuth2 client ID from Mautic API credentials
- `MAUTIC_CLIENT_SECRET` - OAuth2 client secret from Mautic API credentials

## Key Implementation Details

**Error Handling:**
- Comprehensive API error parsing with user-friendly messages
- Input validation using Zod schemas
- Automatic OAuth2 token refresh on 401 errors

**Data Access:**
- Statistics tables: `email_stats`, `campaign_lead_event_log`, `form_submissions`, etc.
- Dashboard data types: `emails.in.time`, `created.leads.in.time`, etc.
- Pagination support for large datasets

**MCP Integration:**
- Implements standard MCP server protocol
- Uses stdio transport for communication
- Proper graceful shutdown handling