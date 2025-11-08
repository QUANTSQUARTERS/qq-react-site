import { Hono } from "hono";
import { selectDataSource, teamRelatedMockUtils } from "../lib/utils.js";

// Create team related router
const teamRelatedRouter = new Hono();

// Related teams endpoint
teamRelatedRouter.get("/", async (c) => {
  const teamId = c.req.param("id");

  // Use the imported mock logic
  const mockLogic = async (c) => {
    return teamRelatedMockUtils.getRelatedTeamData(c, teamId);
  };

  // Database logic
  const dbLogic = async (c) => {
    const sql = c.env.SQL;

    const team = await sql`
      SELECT t.*, l.name as league_name 
      FROM public.teams t
      LEFT JOIN public.leagues l ON t.league_id = l.id
      WHERE t.id = ${teamId}
    `;

    if (team.length === 0) {
      return Response.json({ error: "Team not found" }, { status: 404 });
    }

    let relatedTeams = [];
    let recentTeams = [];
    let leagueCounts = [];

    const teamLeagueId = team[0].league_id;
    const teamLeagueName = team[0].league_name;

    relatedTeams = await sql`
      SELECT t.*, l.name as league_name 
      FROM public.teams t
      LEFT JOIN public.leagues l ON t.league_id = l.id
      WHERE t.league_id = ${teamLeagueId} AND t.id != ${teamId}
      LIMIT 3
    `;

    leagueCounts = await sql`
      SELECT l.name as league, COUNT(*) as count 
      FROM public.teams t
      LEFT JOIN public.leagues l ON t.league_id = l.id
      GROUP BY l.name 
      ORDER BY count DESC
    `;

    recentTeams = await sql`
      SELECT t.*, l.name as league_name 
      FROM public.teams t
      LEFT JOIN public.leagues l ON t.league_id = l.id
      WHERE t.id != ${teamId} 
      ORDER BY t.created_at DESC 
      LIMIT 2
    `;

    return Response.json({
      teamId: teamId,
      teamLeague: teamLeagueName,
      relatedTeams,
      recentRecommendations: recentTeams,
      leagueStats: leagueCounts,
      source: "database",
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

export default teamRelatedRouter;

