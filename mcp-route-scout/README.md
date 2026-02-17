# Route Scout "Plugin" for Mighty Mileage Meetup

This is a composite AI Plugin consisting of an **MCP Server** and a **Claude Skill**.

### 1. The Capability (MCP)
The Node.js server in this folder provides the `get_rails_routes` tool. It executes `bin/rails routes` inside the `/Mighty_Mileage_Meetup-api` directory.

### 2. The Skill (.claude/rules)
The `backend-integration.md` rule instructs the AI to automatically verify routes before writing any frontend integration code.

### Installation
1. Add to `.mcp.json` or Claude Desktop Config.
2. Ensure `bin/rails` is executable (`chmod +x`).