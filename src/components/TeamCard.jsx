function TeamCard({ team, onClick }) {
  return (
    <div className="team-card cursor-pointer" onClick={onClick}>
      <div className="team-card-image">
        <img
          src={team.logo_url || "/images/teams/default-team.png"}
          alt={team.name}
          className="w-full h-full object-contain transition-transform hover:scale-[1.03] duration-300"
          onError={(e) => {
            e.target.src = "/images/teams/default-team.png";
          }}
        />
      </div>
      <div className="team-card-content">
        <h3 className="text-lg font-serif mb-1 line-clamp-1">{team.name}</h3>
        <p className="text-gray-900 text-sm mb-2">{team.country}</p>
        {team.league_name && (
          <p className="text-blue-800 text-xs mb-2 font-semibold">
            {team.league_name}
          </p>
        )}
        <p className="text-gray-900 text-sm overflow-hidden line-clamp-3 mb-4">
          {team.description}
        </p>
        <button className="btn-primary w-full text-sm font-bold">
          View Details
        </button>
      </div>
    </div>
  );
}

export default TeamCard;

