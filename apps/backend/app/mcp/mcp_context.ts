import type { HttpContext } from "@adonisjs/core/http";

declare module "@jrmc/adonis-mcp/types/context" {
    interface McpContext {
        auth: HttpContext["auth"];
    }
}
