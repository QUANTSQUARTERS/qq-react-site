import { useState, useEffect } from "react";

function UpcomingMatches() {
  const [leagues, setLeagues] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, scheduled, finished

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

  // Load matches when season is selected
  useEffect(() => {
    if (!selectedSeason) {
      setMatches([]);
      setFilteredMatches([]);
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
        setFilteredMatches(matchesData);
      } catch (error) {
        console.error("Error loading matches:", error);
        setMatches([]);
        setFilteredMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedSeason]);

  // Filter matches based on search and status
  useEffect(() => {
    let filtered = [...matches];

    // Filter by status
    if (statusFilter === "scheduled") {
      filtered = filtered.filter(
        (match) => match.status === "scheduled" || match.status === "notstarted"
      );
    } else if (statusFilter === "finished") {
      filtered = filtered.filter((match) => match.status === "finished");
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (match) =>
          match.home_name?.toLowerCase().includes(term) ||
          match.away_name?.toLowerCase().includes(term) ||
          match.stadium_name?.toLowerCase().includes(term)
      );
    }

    setFilteredMatches(filtered);
  }, [matches, searchTerm, statusFilter]);

  const formatDate = (dateUnix) => {
    if (!dateUnix) return "TBD";
    const date = new Date(dateUnix * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      finished: "bg-green-100 text-green-800",
      scheduled: "bg-blue-100 text-blue-800",
      notstarted: "bg-gray-100 text-gray-800",
      live: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status || "TBD"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-4">Upcoming Matches</h2>

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

        {/* Filters */}
        {selectedSeason && (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by team or stadium..."
                className="w-full py-2 px-4 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="py-2 px-4 border border-gray-300 rounded-md bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Matches</option>
                <option value="scheduled">Scheduled</option>
                <option value="finished">Finished</option>
              </select>
            </div>
          </div>
        )}

        {/* Matches Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Home Team</th>
                  <th>Score</th>
                  <th>Away Team</th>
                  <th>Stadium</th>
                  <th>Status</th>
                  <th>Game Week</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td>{formatDate(match.date_unix)}</td>
                    <td className="font-medium">{match.home_name || "TBD"}</td>
                    <td>
                      {match.status === "finished"
                        ? `${match.homeGoalCount || 0} - ${
                            match.awayGoalCount || 0
                          }`
                        : "vs"}
                    </td>
                    <td className="font-medium">{match.away_name || "TBD"}</td>
                    <td className="text-sm text-gray-600">
                      {match.stadium_name || "TBD"}
                    </td>
                    <td>{getStatusBadge(match.status)}</td>
                    <td className="text-sm text-gray-600">
                      {match.game_week || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedSeason ? (
          <div className="text-center py-20 text-gray-600">
            No matches found
            {searchTerm && " matching your search"}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-600">
            Please select a league season to view matches
          </div>
        )}

        {/* Results count */}
        {selectedSeason && filteredMatches.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredMatches.length} of {matches.length} matches
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingMatches;

