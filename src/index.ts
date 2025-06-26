#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { MauticClient } from './client.js';
import { MauticTools } from './tools.js';
import { MauticConfig } from './types.js';

// Configuration from environment variables
const config: MauticConfig = {
  url: process.env.MAUTIC_URL || '',
  clientId: process.env.MAUTIC_CLIENT_ID || '',
  clientSecret: process.env.MAUTIC_CLIENT_SECRET || '',
};

// Validate configuration
if (!config.url || !config.clientId || !config.clientSecret) {
  console.error('Missing required environment variables:');
  console.error('- MAUTIC_URL: Your Mautic instance URL');
  console.error('- MAUTIC_CLIENT_ID: OAuth2 client ID');
  console.error('- MAUTIC_CLIENT_SECRET: OAuth2 client secret');
  process.exit(1);
}

// Remove trailing slash from URL
config.url = config.url.replace(/\/$/, '');

// Initialize Mautic client and tools
const mauticClient = new MauticClient(config);
const mauticTools = new MauticTools(mauticClient);

// Create MCP server
const server = new Server(
  {
    name: 'mcp-mautic-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = mauticTools.getToolDefinitions();
  return { tools };
});

// Execute tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return await mauticTools.executeTool(name, args || {});
});

// Error handling
process.on('SIGINT', async () => {
  console.log('\nShutting down MCP Mautic server...');
  await server.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
async function main() {
  console.log('Starting MCP Mautic server...');
  console.log(`Mautic URL: ${config.url}`);
  console.log(`Client ID: ${config.clientId}`);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log('MCP Mautic server started successfully');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});