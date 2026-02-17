---
description: Ensures frontend-backend alignment using the Route Scout MCP
paths: ["FE-Mighty_Mileage_Meetup/**", "Mighty_Mileage_Meetup-api/**"]
---

# Backend Integration Skill

## Trigger Protocol
**This rule triggers whenever a file change is proposed for Angular services, HTTP interceptors, or any frontend form communicating with the Rails API.**

## Protocol
1. **Verify Truth:** Use the `get_rails_routes` tool immediately. 
2. **Audit:** Compare the current TypeScript `HttpClient` call against the actual Rails route pattern.
3. **Correct:** If there is a mismatch (e.g., the frontend uses `PUT` but Rails expects `PATCH`), correct the frontend code and notify the user of the discrepancy.

## Goal
Eliminate "404 Not Found" and "422 Unprocessable Entity" errors by ensuring the frontend never "guesses" an API endpoint.