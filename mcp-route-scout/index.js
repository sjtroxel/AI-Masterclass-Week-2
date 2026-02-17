import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const railsRoot = resolve(__dirname, '..', 'Mighty_Mileage_Meetup-api');

const server = new McpServer({
  name: 'route-scout',
  version: '1.0.0',
});

server.tool(
  'get_rails_routes',
  'Returns all Rails routes for the Mighty Mileage Meetup API',
  async () => {
    try {
      const output = execSync('bin/rails routes', {
        cwd: railsRoot,
        encoding: 'utf-8',
        timeout: 30_000,
      });
      return { content: [{ type: 'text', text: output }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error running rails routes: ${err.message}` }],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
