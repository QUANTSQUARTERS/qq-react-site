import { useState, useEffect } from "react";
import { groupByLeague } from "../lib/utils";
import Sidebar from "../components/Sidebar";
import UpcomingMatches from "../components/UpcomingMatches";

function MatchesPage() {
  const [leagues, setLeagues] = useState([]);

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
          return;
        }

        const teamsArray = data.teams;
        const leagueGroups = groupByLeague(teamsArray);
        setLeagues(leagueGroups);
      } catch (error) {
        console.error("Error loading leagues:", error);
      }
    };

    loadLeagues();
  }, []);

  return (
    <div className="layout">
      <Sidebar leagues={leagues} activeLeague={null} counts />
      <main className="main-content">
        <div className="page-header">
          <h1>Upcoming Matches</h1>
          <p className="text-gray-300">
            Browse and search upcoming soccer matches by league
          </p>
        </div>
        <UpcomingMatches />
      </main>
    </div>
  );
}

export default MatchesPage;

