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
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  // Load leagues on component mount
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch("/api/footystats/leagues");
        if (!response.ok) throw new Error("Failed to fetch leagues");
        const data = await response.json();
        if (data.success && data.leagues) {
          setLeagues(data.leagues);
        }
      } catch (error) {
        console.error("Error loading leagues:", error);
      }
    };
    fetchLeagues();
  }, []);

  // Load matches and process data when league is selected
  useEffect(() => {
    if (!selectedLeague) {
      setMatches([]);
      setChartData(null);
      return;
    }

    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/footystats/league-matches/${selectedLeague}?season=2024`
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
  }, [selectedLeague]);

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
      const homeValue = parseFloat(match[homeKey]) || 0;
      const awayValue = parseFloat(match[awayKey]) || 0;

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

      if (homeCount > 0 || awayCount > 0) {
        bins.push({
          range: binLabel,
          home: homeCount,
          away: awayCount,
        });
      }
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
      const homeGoals = parseInt(match.homeGoalCount) || 0;
      const awayGoals = parseInt(match.awayGoalCount) || 0;
      const homeXG = parseFloat(match.team_a_xg) || 0;
      const awayXG = parseFloat(match.team_b_xg) || 0;

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
        home: parseFloat(stats.homeXG.toFixed(2)),
        away: parseFloat(stats.awayXG.toFixed(2)),
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
        (parseInt(match.homeGoalCount) || 0) + (parseInt(match.awayGoalCount) || 0);
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
      const homeXG = parseFloat(match.team_a_xg) || 0;
      const awayXG = parseFloat(match.team_b_xg) || 0;
      const homeGoals = parseInt(match.homeGoalCount) || 0;
      const awayGoals = parseInt(match.awayGoalCount) || 0;

      const homeName = match.home_name || "Home";
      const awayName = match.away_name || "Away";

      return {
        match: `${homeName.substring(0, 12)} vs ${awayName.substring(0, 12)}`,
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

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="card">

        {/* League Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Select League
          </label>
          <select
            className="w-full md:w-1/2 py-3 px-4 rounded-lg"
            value={selectedLeague || ""}
            onChange={(e) => setSelectedLeague(e.target.value)}
          >
            <option value="">-- Select a league --</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name} ({league.country})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-12 w-12 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chartData ? (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="metrics-container">
              <div className="metric-card">
                <div className="metric-value">{chartData.totalMatches}</div>
                <div className="metric-label">Total Matches</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{chartData.homeAwayStats[0].home}</div>
                <div className="metric-label">Home Goals</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{chartData.homeAwayStats[0].away}</div>
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
            <div className="card">
              <h3 className="mb-4">Home vs Away Statistics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.homeAwayStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="category" stroke="#a0aec0" />
                  <YAxis stroke="#a0aec0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="home" fill="#00d4ff" name="Home" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="away" fill="#ed8936" name="Away" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* xG Distribution */}
            <div className="card">
              <h3 className="mb-4">Expected Goals (xG) Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.xgDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="range" stroke="#a0aec0" />
                  <YAxis stroke="#a0aec0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="home" fill="#00d4ff" name="Home xG" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="away" fill="#ed8936" name="Away xG" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Goals Distribution */}
            <div className="card">
              <h3 className="mb-4">Goals Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.goalsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="range" stroke="#a0aec0" />
                  <YAxis stroke="#a0aec0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="home" fill="#00d4ff" name="Home Goals" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="away" fill="#ed8936" name="Away Goals" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Total Goals Distribution */}
            <div className="card">
              <h3 className="mb-4">Total Goals per Match Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.totalGoalsDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="goals" stroke="#a0aec0" />
                  <YAxis stroke="#a0aec0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#48bb78" name="Matches" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* xG vs Goals Comparison */}
            {chartData.xgVsGoals.length > 0 && (
              <div className="card">
                <h3 className="mb-4">xG vs Actual Goals (Top 20 Matches)</h3>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" minWidth={800} height={400}>
                    <BarChart data={chartData.xgVsGoals} margin={{ bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                      <XAxis 
                        dataKey="match" 
                        angle={-45} 
                        textAnchor="end" 
                        height={120}
                        interval={0}
                        tick={{ fontSize: 10, fill: "#a0aec0" }}
                      />
                      <YAxis stroke="#a0aec0" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="totalXG" fill="#ed8936" name="Total xG" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="totalGoals" fill="#48bb78" name="Total Goals" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ) : selectedLeague ? (
          <div className="text-center py-20 text-gray-400">
            No finished matches found for analytics
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            Please select a league to view analytics
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
