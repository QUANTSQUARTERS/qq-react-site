import { useNavigate } from "react-router";
import Breadcrumbs from "./Breadcrumbs";

function TeamDetail({ teamData }) {
  const navigate = useNavigate();
  const { team, relatedTeams } = teamData;

  const breadcrumbItems = [{ label: "All Teams", value: null }];

  if (team.league_name) {
    breadcrumbItems.push({ label: team.league_name, value: team.league_name });
  }

  breadcrumbItems.push({ label: team.name, value: "team" });

  const handleNavigate = (value) => {
    if (value === null) {
      navigate("/");
    } else if (value !== "team") {
      navigate(`/league/${encodeURIComponent(value)}`);
    }
  };

  const handleRelatedTeamClick = (teamId) => {
    navigate(`/team/${teamId}`);
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} onNavigate={handleNavigate} />

      <div className="space-y-12 mt-6">
        <div className="card">
          <div className="md:flex gap-10">
            <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 mb-8 md:mb-0">
              <img
                src={team.logo_url || "/images/teams/default-team.png"}
                alt={team.name}
                className="w-full h-full object-contain rounded-md border border-gray-200"
                onError={(e) => {
                  e.target.src = "/images/teams/default-team.png";
                }}
              />
            </div>
            <div className="md:w-2/3 lg:w-3/4">
              <h1 className="mb-3">{team.name}</h1>
              <h2 className="text-xl text-gray-900 mb-6 font-serif font-normal">
                {team.country}
              </h2>

              {team.league_name && (
                <div className="mb-6">
                  <span
                    className="inline-block border border-blue-800 text-blue-800 text-sm px-3 py-1 rounded-full font-sans cursor-pointer"
                    onClick={() =>
                      navigate(`/league/${encodeURIComponent(team.league_name)}`)
                    }
                  >
                    {team.league_name}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                {team.founded_year && (
                  <div>
                    <p className="text-sm text-gray-500">Founded</p>
                    <p className="text-lg font-semibold">{team.founded_year}</p>
                  </div>
                )}
                {team.stadium && (
                  <div>
                    <p className="text-sm text-gray-500">Stadium</p>
                    <p className="text-lg font-semibold">{team.stadium}</p>
                  </div>
                )}
              </div>

              <p className="text-gray-900 leading-relaxed">
                {team.description}
              </p>
            </div>
          </div>
        </div>

        {/* Other teams in this league - combined section */}
        {relatedTeams.length > 0 && (
          <section className="mb-12">
            <h3 className="mb-6">
              {team.league_name
                ? `Other Teams in ${team.league_name}`
                : "You May Also Like"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedTeams.map((relTeam) => (
                <div
                  key={relTeam.id}
                  className="card py-4 px-5 text-center cursor-pointer"
                  onClick={() => handleRelatedTeamClick(relTeam.id)}
                >
                  <div className="w-24 h-24 mx-auto mb-3">
                    <img
                      src={relTeam.logo_url || "/images/teams/default-team.png"}
                      alt={relTeam.name}
                      className="w-full h-full object-contain rounded-sm border border-gray-200"
                      onError={(e) => {
                        e.target.src = "/images/teams/default-team.png";
                      }}
                    />
                  </div>
                  <div className="font-serif text-gray-900 mb-1 line-clamp-1">
                    {relTeam.name}
                  </div>
                  <div className="text-gray-900 text-sm font-sans">
                    {relTeam.country}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default TeamDetail;

