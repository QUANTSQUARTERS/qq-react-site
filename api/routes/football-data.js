import { Hono } from "hono";

const footballDataRouter = new Hono();
const BASE_URL = "https://api.football-data-api.com/";

// Get leagues
footballDataRouter.get("/leagues", async (c) => {
  const apiKey = c.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE_URL}league-list?key=${apiKey}&chosen_leagues_only=true`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();

    // Process leagues into a flat structure
    const leagueSeasons = [];
    if (data.data) {
      for (const league of data.data) {
        if (league.season) {
          for (const season of league.season) {
            leagueSeasons.push({
              league_id: league.id,
              league_name: league.name,
              season_id: season.id,
              year: season.year,
              country: season.country,
            });
          }
        }
      }
    }

    return Response.json({
      leagues: leagueSeasons,
      raw: data.data,
    });
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return Response.json(
      { error: error.message || "Failed to fetch leagues" },
      { status: 500 }
    );
  }
});

// Get league matches
footballDataRouter.get("/leagues/:seasonId/matches", async (c) => {
  const apiKey = c.env.FOOTBALL_DATA_API_KEY;
  const seasonId = c.req.param("seasonId");
  const homeTeamId = c.req.query("home_team_id");
  const awayTeamId = c.req.query("away_team_id");

  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    let url = `${BASE_URL}league-matches?key=${apiKey}&season_id=${seasonId}`;

    if (homeTeamId && homeTeamId !== "0") {
      url += `&home_team_id=${homeTeamId}`;
    }
    if (awayTeamId && awayTeamId !== "0") {
      url += `&away_team_id=${awayTeamId}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching league matches:", error);
    return Response.json(
      { error: error.message || "Failed to fetch matches" },
      { status: 500 }
    );
  }
});

// Get league teams
footballDataRouter.get("/leagues/:leagueId/teams", async (c) => {
  const apiKey = c.env.FOOTBALL_DATA_API_KEY;
  const leagueId = c.req.param("leagueId");

  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE_URL}league-teams?key=${apiKey}&league_id=${leagueId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      return Response.json(
        { error: "API request failed", data },
        { status: 500 }
      );
    }

    // Process teams
    const teams = (data.data || []).map((team) => ({
      team_id: team.id,
      name: team.name,
      clean_name: team.cleanName,
      country: team.country,
      founded: team.founded,
      image: team.image,
      position: team.table_position,
      risk: team.risk,
    }));

    return Response.json({
      teams,
      raw: data.data,
    });
  } catch (error) {
    console.error("Error fetching league teams:", error);
    return Response.json(
      { error: error.message || "Failed to fetch teams" },
      { status: 500 }
    );
  }
});

export default footballDataRouter;

