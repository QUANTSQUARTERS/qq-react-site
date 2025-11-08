export function groupByLeague(teams) {
  const leaguesMap = {};

  // Group teams by league
  teams.forEach((team) => {
    if (team.league_name) {
      if (!leaguesMap[team.league_name]) {
        leaguesMap[team.league_name] = [];
      }
      leaguesMap[team.league_name].push(team);
    }
  });

  // Convert to sorted array
  return Object.entries(leaguesMap)
    .map(([name, teams]) => ({
      name,
      count: teams.length,
      teams,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
