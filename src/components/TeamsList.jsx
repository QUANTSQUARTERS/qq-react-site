import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import TeamCard from "./TeamCard";

function useTeams(filter, sortBy) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const params = new URLSearchParams();
        if (filter) params.append("league", filter);
        if (sortBy) params.append("sort", sortBy);

        const url = `/api/teams${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.teams?.length) {
          console.error("No teams data found:", data);
          setTeams([]);
        } else {
          setTeams(data.teams);
        }
      } catch (error) {
        console.error("Error loading teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [filter, sortBy]);

  return { teams, loading };
}

function TeamsList({ filter, onSelectTeam }) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("");
  const { teams, loading } = useTeams(filter, sortBy);

  const handleTeamSelect = (teamId) => {
    onSelectTeam ? onSelectTeam(teamId) : navigate(`/team/${teamId}`);
  };
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <select
          className="py-2 px-4 border border-gray-300 rounded-md bg-white"
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="">Sort by...</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="country_asc">Country (A-Z)</option>
          <option value="country_desc">Country (Z-A)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onClick={() => handleTeamSelect(team.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default TeamsList;

