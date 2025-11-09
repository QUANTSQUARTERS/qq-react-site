import { useState, useEffect } from "react";

function UpcomingMatches() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Load matches when league is selected
  useEffect(() => {
    if (!selectedLeague) {
      setMatches([]);
      setFilteredMatches([]);
      return;
    }

    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/footystats/upcoming-matches/${selectedLeague}?season=2024`
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
  }, [selectedLeague]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      finished: "status-finished",
      scheduled: "status-scheduled",
      notstarted: "status-scheduled",
      live: "status-live",
    };

    return (
      <span className={`status-badge ${statusClasses[status] || "status-scheduled"}`}>
        {status || "TBD"}
      </span>
    );
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

        {/* Filters */}
        {selectedLeague && (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by team or stadium..."
                className="w-full py-3 px-4 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="py-3 px-4 rounded-lg"
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
            <div className="h-12 w-12 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="overflow-x-auto rounded-xl">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Home Team</th>
                  <th>Score</th>
                  <th>Away Team</th>
                  <th>Stadium</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-[#243447]">
                    <td className="font-medium">{formatDate(match.date)}</td>
                    <td className="font-semibold">{match.home_name || "TBD"}</td>
                    <td>
                      {match.status === "finished"
                        ? `${match.homeGoalCount || 0} - ${match.awayGoalCount || 0}`
                        : "vs"}
                    </td>
                    <td className="font-semibold">{match.away_name || "TBD"}</td>
                    <td className="text-sm text-gray-400">
                      {match.stadium_name || "TBD"}
                    </td>
                    <td>{getStatusBadge(match.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedLeague ? (
          <div className="text-center py-20 text-gray-400">
            No matches found
            {searchTerm && " matching your search"}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            Please select a league to view matches
          </div>
        )}

        {/* Results count */}
        {selectedLeague && filteredMatches.length > 0 && (
          <div className="mt-6 text-sm text-gray-400">
            Showing {filteredMatches.length} of {matches.length} matches
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingMatches;
