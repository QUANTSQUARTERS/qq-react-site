import { useState, useEffect } from "react";
import { groupByLeague } from "../lib/utils";
import Sidebar from "../components/Sidebar";
import Analytics from "../components/Analytics";

function AnalyticsPage() {
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
        <Analytics />
      </main>
    </div>
  );
}

export default AnalyticsPage;

