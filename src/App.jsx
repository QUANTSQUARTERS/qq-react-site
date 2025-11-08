import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { groupByLeague } from "./lib/utils";
import Breadcrumbs from "./components/Breadcrumbs";
import Sidebar from "./components/Sidebar";
import TeamsList from "./components/TeamsList";
import TeamDetail from "./components/TeamDetail";
import MockDataBanner from "./components/MockDataBanner";

function App() {
  const navigate = useNavigate();
  const params = useParams();
  const [teamDetail, setTeamDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leagues, setLeagues] = useState([]);
  const [dataSource, setDataSource] = useState(null);

  // Get route parameters
  const { teamId } = params;
  const { leagueId } = params;
  const activeLeague = leagueId ? decodeURIComponent(leagueId) : null;

  // Load leagues for sidebar
  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const response = await fetch("/api/teams");
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.teams?.length) {
          console.error("No teams data found:", typeof data);
          return;
        }

        const teamsArray = data.teams;

        // Check if using mock data or database
        if (data.source) {
          setDataSource(data.source);
        }

        const leagueGroups = groupByLeague(teamsArray);
        setLeagues(leagueGroups);
      } catch (error) {
        console.error("Error loading leagues:", error);
      }
    };

    loadLeagues();
  }, []);

  // Load team details when a team is selected via URL
  useEffect(() => {
    if (!teamId) return;

    const fetchTeamDetail = async () => {
      setLoading(true);
      try {
        // First get basic team details
        const teamResponse = await fetch(`/api/teams/${teamId}`);

        if (!teamResponse.ok) {
          throw new Error(`API returned status: ${teamResponse.status}`);
        }

        const teamData = await teamResponse.json();

        // Then get related teams data
        const relatedResponse = await fetch(`/api/teams/${teamId}/related`);

        if (!relatedResponse.ok) {
          throw new Error(`API returned status: ${relatedResponse.status}`);
        }

        const relatedData = await relatedResponse.json();

        // Combine the data
        const combinedData = {
          team: teamData.team,
          relatedTeams: relatedData.relatedTeams,
          recentRecommendations: relatedData.recentRecommendations,
          leagueStats: relatedData.leagueStats,
        };

        setTeamDetail(combinedData);
      } catch (error) {
        console.error("Error fetching team details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetail();
  }, [teamId]);

  const handleSelectTeam = (teamId) => {
    navigate(`/team/${teamId}`);
  };

  const handleSelectLeague = (league) => {
    if (league) {
      navigate(`/league/${encodeURIComponent(league)}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="layout">
      <Sidebar
        leagues={leagues}
        activeLeague={activeLeague}
        onSelectLeague={handleSelectLeague}
        counts
      />

      <main className="main-content">
        {/* Breadcrumbs for main teams page */}
        {!teamId && (
          <Breadcrumbs
            items={[
              { label: "All Teams", value: null },
              ...(activeLeague
                ? [{ label: activeLeague, value: activeLeague }]
                : []),
            ]}
            onNavigate={(value) => {
              if (value === null) {
                handleSelectLeague(null);
              }
            }}
          />
        )}

        <div className="page-header">
          <h1>{activeLeague ? `${activeLeague} Teams` : "Soccer Analytics"}</h1>
          <p className="text-gray-900">
            {activeLeague
              ? `Explore teams in ${activeLeague}`
              : "Discover teams, leagues, and soccer statistics"}
          </p>

          {/* Show banner only when using mock data */}
          {dataSource === "mock" && <MockDataBanner />}
        </div>

        {teamId ? (
          loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : teamDetail ? (
            <TeamDetail teamData={teamDetail} />
          ) : (
            <div className="text-center py-20 text-gray-600">
              Error loading team details
            </div>
          )
        ) : (
          <TeamsList onSelectTeam={handleSelectTeam} filter={activeLeague} />
        )}
      </main>
    </div>
  );
}

export default App;
