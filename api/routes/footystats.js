import { Hono } from "hono";

const footystatsRouter = new Hono();
const BASE_URL = "https://api.footystats.org/v3";

// Get leagues
footystatsRouter.get("/leagues", async (c) => {
  const apiKey = c.env.FOOTYSTATS_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE_URL}/leagues?key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();

    return Response.json({
      leagues: data.data || [],
      success: data.success || false,
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
footystatsRouter.get("/league-matches/:leagueId", async (c) => {
  const apiKey = c.env.FOOTYSTATS_API_KEY;
  const leagueId = c.req.param("leagueId");
  const season = c.req.query("season") || "2024";

  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE_URL}/league-matches?key=${apiKey}&league_id=${leagueId}&season=${season}`;
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

// Get team stats
footystatsRouter.get("/team-stats/:teamId", async (c) => {
  const apiKey = c.env.FOOTYSTATS_API_KEY;
  const teamId = c.req.param("teamId");
  const season = c.req.query("season") || "2024";

  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE_URL}/team-stats?key=${apiKey}&team_id=${teamId}&season=${season}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching team stats:", error);
    return Response.json(
      { error: error.message || "Failed to fetch team stats" },
      { status: 500 }
    );
  }
});

// Get upcoming matches
footystatsRouter.get("/upcoming-matches/:leagueId", async (c) => {
  const apiKey = c.env.FOOTYSTATS_API_KEY;
  const leagueId = c.req.param("leagueId");
  const season = c.req.query("season") || "2024";

  if (!apiKey) {
    return Response.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE_URL}/league-matches?key=${apiKey}&league_id=${leagueId}&season=${season}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for upcoming matches
    const upcoming = (data.data || []).filter(
      (match) => match.status === "scheduled" || match.status === "notstarted"
    );

    return Response.json({
      ...data,
      data: upcoming,
    });
  } catch (error) {
    console.error("Error fetching upcoming matches:", error);
    return Response.json(
      { error: error.message || "Failed to fetch upcoming matches" },
      { status: 500 }
    );
  }
});

export default footystatsRouter;

