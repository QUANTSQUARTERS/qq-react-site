import { Hono } from "hono";
import { selectDataSource, teamsMockUtils, fetchFootyStatsAPI } from "../lib/utils.js";

// Create teams router
const teamsRouter = new Hono();

// Teams list endpoint with filtering and sorting
teamsRouter.get("/", async (c) => {
  const { league, sort } = c.req.query();

  // Use imported mock logic
  const mockLogic = async (c) => {
    return teamsMockUtils.getTeamsList(c, league, sort);
  };

  // Database logic
  const dbLogic = async (c) => {
    const sql = c.env.SQL;
    let query = sql`
      SELECT t.*, l.name as league_name 
      FROM public.teams t
      LEFT JOIN public.leagues l ON t.league_id = l.id
    `;

    // Apply league filter if provided
    if (league) {
      query = sql`
        SELECT t.*, l.name as league_name 
        FROM public.teams t
        LEFT JOIN public.leagues l ON t.league_id = l.id
        WHERE l.name = ${league}
      `;
    }

    // Apply sorting if provided
    if (sort) {
      switch (sort) {
        case "name_asc":
          query = league
            ? sql`
                SELECT t.*, l.name as league_name 
                FROM public.teams t
                LEFT JOIN public.leagues l ON t.league_id = l.id
                WHERE l.name = ${league}
                ORDER BY t.name ASC
              `
            : sql`
                SELECT t.*, l.name as league_name 
                FROM public.teams t
                LEFT JOIN public.leagues l ON t.league_id = l.id
                ORDER BY t.name ASC
              `;
          break;
        case "name_desc":
          query = league
            ? sql`
                SELECT t.*, l.name as league_name 
                FROM public.teams t
                LEFT JOIN public.leagues l ON t.league_id = l.id
                WHERE l.name = ${league}
                ORDER BY t.name DESC
              `
            : sql`
                SELECT t.*, l.name as league_name 
                FROM public.teams t
                LEFT JOIN public.leagues l ON t.league_id = l.id
                ORDER BY t.name DESC
              `;
          break;
        case "country_asc":
          query = league
            ? sql`
                SELECT t.*, l.name as league_name 
                FROM public.teams t
                LEFT JOIN public.leagues l ON t.league_id = l.id
                WHERE l.name = ${league}
                ORDER BY t.country ASC
              `
            : sql`
                SELECT t.*, l.name as league_name 
                FROM public.teams t
                LEFT JOIN public.leagues l ON t.league_id = l.id
                ORDER BY t.country ASC
              `;
          break;
        case "country_desc":
          query = league
            ? sql`
                SELECT t.*, l.name as league_name 
                FROM public.teams t
                LEFT JOIN public.leagues l ON t.league_id = l.id
                WHERE l.name = ${league}
                ORDER BY t.country DESC
              `
            : sql`
                SELECT t.*, l.name as league_name 
                FROM public.teams t
                LEFT JOIN public.leagues l ON t.league_id = l.id
                ORDER BY t.country DESC
              `;
          break;
        default:
          // Default sort, no change to query needed
          break;
      }
    }

    // Execute query
    const results = await query;

    // Return results
    return Response.json({
      teams: results,
      source: "database",
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

// Team details endpoint
teamsRouter.get("/:id", async (c) => {
  const teamId = c.req.param("id");

  // Use imported mock logic
  const mockLogic = async (c) => {
    return teamsMockUtils.getTeamDetail(c, teamId);
  };

  // Database logic
  const dbLogic = async (c) => {
    const sql = c.env.SQL;

    // Get the specific team by ID with league info
    const team = await sql`
      SELECT t.*, l.name as league_name 
      FROM public.teams t
      LEFT JOIN public.leagues l ON t.league_id = l.id
      WHERE t.id = ${teamId}
    `;

    if (team.length === 0) {
      return Response.json({ error: "Team not found" }, { status: 404 });
    }

    return Response.json({
      team: team[0],
      source: "database",
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

export default teamsRouter;

