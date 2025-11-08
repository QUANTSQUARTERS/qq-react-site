/**
 * Selects appropriate data source based on database availability
 * @param {object} c - Hono context
 * @param {function} dbLogic - Function to execute when DB is available
 * @param {function} mockLogic - Function to execute when using mock data
 * @returns {Response} API response
 */
export async function selectDataSource(c, dbLogic, mockLogic) {
  try {
    // Use mock data if database is not available
    if (!c.env.DB_AVAILABLE) {
      return await mockLogic(c);
    }

    // Use database if available
    return await dbLogic(c);
  } catch (e) {
    console.error("API Error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : e },
      { status: 500 },
    );
  }
}

/**
 * Fetches data from FootyStats API
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response data
 */
export async function fetchFootyStatsAPI(endpoint, options = {}) {
  const API_KEY = options.apiKey || process.env.FOOTYSTATS_API_KEY;
  const BASE_URL = options.baseUrl || "https://api.footystats.org/v3";

  if (!API_KEY) {
    throw new Error("FootyStats API key not configured");
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "footystats.org",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`FootyStats API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Contains mock data logic functions for team-related endpoints
 */
export const teamRelatedMockUtils = {
  /**
   * Generates mock related teams response
   * @param {object} c - Hono context
   * @param {string} teamId - Team ID to fetch related data for
   * @returns {Response} Mock API response
   */
  getRelatedTeamData: async (c, teamId) => {
    const teamIdNum = parseInt(teamId, 10);
    const team = c.env.MOCK_DATA.find((team) => team.id === teamIdNum);

    if (!team) {
      return Response.json({ error: "Team not found" }, { status: 404 });
    }

    const teamLeague = team.league_name;

    // Generate mock related data
    const relatedTeams = c.env.MOCK_DATA.filter(
      (t) => t.league_name === teamLeague && t.id !== teamIdNum,
    ).slice(0, 3);

    // Generate mock recent teams
    const recentTeams = c.env.MOCK_DATA.filter((t) => t.id !== teamIdNum).slice(
      0,
      2,
    );

    // Generate mock league counts
    const leagues = {};
    c.env.MOCK_DATA.forEach((t) => {
      leagues[t.league_name] = (leagues[t.league_name] || 0) + 1;
    });

    const leagueCounts = Object.entries(leagues)
      .map(([league, count]) => ({
        league: league,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return Response.json({
      teamId: teamId,
      teamLeague: teamLeague,
      relatedTeams,
      recentRecommendations: recentTeams,
      leagueStats: leagueCounts,
      source: "mock",
    });
  },
};

/**
 * Contains mock data logic functions for teams endpoints
 */
export const teamsMockUtils = {
  /**
   * Generates mock teams list with optional filtering and sorting
   * @param {object} c - Hono context
   * @param {string} league - Optional league filter
   * @param {string} sort - Optional sort parameter
   * @returns {Response} Mock API response
   */
  getTeamsList: async (c, league, sort) => {
    let results = [...c.env.MOCK_DATA];

    // Apply league filter if provided
    if (league) {
      results = results.filter((team) => team.league_name === league);
    }

    // Apply sorting if provided
    if (sort) {
      switch (sort) {
        case "name_asc":
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          results.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "country_asc":
          results.sort((a, b) => a.country.localeCompare(b.country));
          break;
        case "country_desc":
          results.sort((a, b) => b.country.localeCompare(a.country));
          break;
        default:
          // Default sort, no change needed
          break;
      }
    }

    return Response.json({
      teams: results,
      source: "mock",
    });
  },

  /**
   * Generates mock team detail response
   * @param {object} c - Hono context
   * @param {string} teamId - Team ID to fetch
   * @returns {Response} Mock API response
   */
  getTeamDetail: async (c, teamId) => {
    const teamIdNum = parseInt(teamId, 10);
    const team = c.env.MOCK_DATA.find((team) => team.id === teamIdNum);

    if (!team) {
      return Response.json({ error: "Team not found" }, { status: 404 });
    }

    return Response.json({
      team,
      source: "mock",
    });
  },
};
