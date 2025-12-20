export * from "./llm-sessions";
export * from "./profiles";
export * from "./route-points";
export * from "./routes";
export * from "./transit-segments";
export * from "./user-stats";

import { llmSessionsService } from "./llm-sessions";
import { profilesService } from "./profiles";
import { routePointsService } from "./route-points";
import { routesService } from "./routes";
import { transitSegmentsService } from "./transit-segments";
import { userStatsService } from "./user-stats";

export const db = {
  profiles: profilesService,
  routes: routesService,
  llmSessions: llmSessionsService,
  routePoints: routePointsService,
  transitSegments: transitSegmentsService,
  userStats: userStatsService,
};
