import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Analytics() {
  const [leagues, setLeagues] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  // Load leagues on component mount
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch("/api/football-data/leagues");
        if (!response.ok) throw new Error("Failed to fetch leagues");
        const data = await response.json();
        setLeagues(data.leagues || []);
      } catch (error) {
        console.error("Error loading leagues:", error);
      }
    };
    fetchLeagues();
  }, []);

  // Load matches and process data when season is selected
  useEffect(() => {
    if (!selectedSeason) {
      setMatches([]);
      setChartData(null);
      return;
    }

    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/football-data/leagues/${selectedSeason}/matches`
        );
        if (!response.ok) throw new Error("Failed to fetch matches");
        const data = await response.json();
        const matchesData = data.data || [];
        setMatches(matchesData);
        processMatchData(matchesData);
      } catch (error) {
        console.error("Error loading matches:", error);
        setMatches([]);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedSeason]);

  const processMatchData = (matchesData) => {
    // Filter only finished matches for accurate statistics
    const finishedMatches = matchesData.filter(
      (match) => match.status === "finished"
    );

    if (finishedMatches.length === 0) {
      setChartData(null);
      return;
    }

    // Process xG distribution
    const xgBins = createBins(finishedMatches, "team_a_xg", "team_b_xg", 0.5);
    
    // Process goals distribution
    const goalsBins = createBins(
      finishedMatches,
      "homeGoalCount",
      "awayGoalCount",
      1
    );

    // Home vs Away statistics
    const homeAwayStats = calculateHomeAwayStats(finishedMatches);

    // Total goals distribution
    const totalGoalsDistribution = calculateTotalGoalsDistribution(
      finishedMatches
    );

    // xG vs Goals comparison
    const xgVsGoals = calculateXgVsGoals(finishedMatches);

    setChartData({
      xgDistribution: xgBins,
      goalsDistribution: goalsBins,
      homeAwayStats,
      totalGoalsDistribution,
      xgVsGoals,
      totalMatches: finishedMatches.length,
    });
  };

  const createBins = (matches, homeKey, awayKey, binSize) => {
    const homeData = [];
    const awayData = [];

    matches.forEach((match) => {
      const homeValue = match[homeKey] || 0;
      const awayValue = match[awayKey] || 0;

      homeData.push(homeValue);
      awayData.push(awayValue);
    });

    // Create bins
    const maxValue = Math.max(...homeData, ...awayData);
    const bins = [];
    for (let i = 0; i <= maxValue + binSize; i += binSize) {
      const binLabel = i.toFixed(1);
      const homeCount = homeData.filter(
        (v) => v >= i && v < i + binSize
      ).length;
      const awayCount = awayData.filter(
        (v) => v >= i && v < i + binSize
      ).length;

      bins.push({
        range: binLabel,
        home: homeCount,
        away: awayCount,
      });
    }

    return bins;
  };

  const calculateHomeAwayStats = (matches) => {
    const stats = {
      homeGoals: 0,
      awayGoals: 0,
      homeXG: 0,
      awayXG: 0,
      homeWins: 0,
      awayWins: 0,
      draws: 0,
      matches: matches.length,
    };

    matches.forEach((match) => {
      const homeGoals = match.homeGoalCount || 0;
      const awayGoals = match.awayGoalCount || 0;
      const homeXG = match.team_a_xg || 0;
      const awayXG = match.team_b_xg || 0;

      stats.homeGoals += homeGoals;
      stats.awayGoals += awayGoals;
      stats.homeXG += homeXG;
      stats.awayXG += awayXG;

      if (homeGoals > awayGoals) {
        stats.homeWins += 1;
      } else if (awayGoals > homeGoals) {
        stats.awayWins += 1;
      } else {
        stats.draws += 1;
      }
    });

    return [
      {
        category: "Goals",
        home: stats.homeGoals,
        away: stats.awayGoals,
      },
      {
        category: "xG",
        home: stats.homeXG.toFixed(2),
        away: stats.awayXG.toFixed(2),
      },
      {
        category: "Wins",
        home: stats.homeWins,
        away: stats.awayWins,
      },
      {
        category: "Draws",
        home: stats.draws,
        away: stats.draws,
      },
    ];
  };

  const calculateTotalGoalsDistribution = (matches) => {
    const distribution = {};

    matches.forEach((match) => {
      const totalGoals =
        (match.homeGoalCount || 0) + (match.awayGoalCount || 0);
      distribution[totalGoals] = (distribution[totalGoals] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([goals, count]) => ({
        goals: parseInt(goals),
        count,
      }))
      .sort((a, b) => a.goals - b.goals);
  };

  const calculateXgVsGoals = (matches) => {
    const data = matches.map((match) => {
      const homeXG = match.team_a_xg || 0;
      const awayXG = match.team_b_xg || 0;
      const homeGoals = match.homeGoalCount || 0;
      const awayGoals = match.awayGoalCount || 0;

      const homeName = match.home_name || "Home";
      const awayName = match.away_name || "Away";

      return {
        match: `${homeName.substring(0, 15)} vs ${awayName.substring(0, 15)}`,
        homeXG: parseFloat(homeXG.toFixed(2)),
        homeGoals,
        awayXG: parseFloat(awayXG.toFixed(2)),
        awayGoals,
        totalXG: parseFloat((homeXG + awayXG).toFixed(2)),
        totalGoals: homeGoals + awayGoals,
      };
    });

    // Sort by total goals and take top 20 for readability
    return data.sort((a, b) => b.totalGoals - a.totalGoals).slice(0, 20);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-4">Soccer Analytics & Distributions</h2>

        {/* League Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select League & Season
          </label>
          <select
            className="w-full md:w-1/2 py-2 px-4 border border-gray-300 rounded-md bg-white"
            value={selectedSeason || ""}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            <option value="">-- Select a league season --</option>
            {leagues.map((league) => (
              <option key={league.season_id} value={league.season_id}>
                {league.league_name} - {league.year} ({league.country})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chartData ? (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="metric-card">
                <div className="metric-value">{chartData.totalMatches}</div>
                <div className="metric-label">Total Matches</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">
                  {chartData.homeAwayStats[0].home}
                </div>
                <div className="metric-label">Home Goals</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">
                  {chartData.homeAwayStats[0].away}
                </div>
                <div className="metric-label">Away Goals</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">
                  {(
                    (chartData.homeAwayStats[0].home /
                      (chartData.homeAwayStats[0].home +
                        chartData.homeAwayStats[0].away)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="metric-label">Home Goal %</div>
              </div>
            </div>

            {/* Home vs Away Statistics */}
            <div>
              <h3 className="mb-4">Home vs Away Statistics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.homeAwayStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="home" fill="#3b82f6" name="Home" />
                  <Bar dataKey="away" fill="#ef4444" name="Away" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* xG Distribution */}
            <div>
              <h3 className="mb-4">Expected Goals (xG) Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.xgDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="home" fill="#3b82f6" name="Home xG" />
                  <Bar dataKey="away" fill="#ef4444" name="Away xG" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Goals Distribution */}
            <div>
              <h3 className="mb-4">Goals Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.goalsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="home" fill="#3b82f6" name="Home Goals" />
                  <Bar dataKey="away" fill="#ef4444" name="Away Goals" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Total Goals Distribution */}
            <div>
              <h3 className="mb-4">Total Goals per Match Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.totalGoalsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="goals" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Matches" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* xG vs Goals Comparison */}
            <div>
              <h3 className="mb-4">xG vs Actual Goals (Top 20 Matches by Total Goals)</h3>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" minWidth={800} height={400}>
                  <BarChart data={chartData.xgVsGoals} margin={{ bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="match" 
                      angle={-45} 
                      textAnchor="end" 
                      height={120}
                      interval={0}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalXG" fill="#f59e0b" name="Total xG" />
                    <Bar dataKey="totalGoals" fill="#10b981" name="Total Goals" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : selectedSeason ? (
          <div className="text-center py-20 text-gray-600">
            No finished matches found for analytics
          </div>
        ) : (
          <div className="text-center py-20 text-gray-600">
            Please select a league season to view analytics
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;

