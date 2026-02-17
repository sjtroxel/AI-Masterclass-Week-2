import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const feRoot = resolve(__dirname, '..', 'FE-Mighty_Mileage_Meetup', 'src');

const server = new McpServer({
  name: 'theme-scout',
  version: '1.0.0',
});

server.tool(
  'get_theme_details',
  'Returns the Tailwind v4 @theme block and CSS custom properties (light + dark) for the Mighty Mileage Meetup frontend',
  async () => {
    const sections = [];

    // 1. Read tailwind.css for the @theme block
    try {
      const tailwindCss = readFileSync(resolve(feRoot, 'tailwind.css'), 'utf-8');
      const themeMatch = tailwindCss.match(/@theme\s*\{[^}]+\}/s);
      if (themeMatch) {
        sections.push('/* === Tailwind v4 @theme (tailwind.css) === */');
        sections.push(themeMatch[0]);
      }
    } catch (err) {
      sections.push(`Error reading tailwind.css: ${err.message}`);
    }

    // 2. Read styles.scss for CSS custom properties (:root and .dark-mode)
    try {
      const styles = readFileSync(resolve(feRoot, 'styles.scss'), 'utf-8');
      const rootMatch = styles.match(/:root\s*\{[^}]+\}/s);
      const darkMatch = styles.match(/body\.dark-mode\s*\{[^}]+\}/s);
      if (rootMatch) {
        sections.push('\n/* === Light theme CSS variables (styles.scss :root) === */');
        sections.push(rootMatch[0]);
      }
      if (darkMatch) {
        sections.push('\n/* === Dark theme CSS variables (styles.scss body.dark-mode) === */');
        sections.push(darkMatch[0]);
      }
    } catch (err) {
      sections.push(`Error reading styles.scss: ${err.message}`);
    }

    return {
      content: [{ type: 'text', text: sections.join('\n') }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
