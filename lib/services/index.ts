// Re-export all services
export * from "./auth";
export * from "./database";
export * from "./llm";
export * from "./map";

// Import services for combined export
import { authService } from "./auth";
import { db } from "./database";


export const services = {
  auth: authService,
  db,
};
