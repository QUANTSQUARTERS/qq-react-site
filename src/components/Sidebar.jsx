import { Link, useLocation } from "react-router";

function Sidebar({ leagues, activeLeague, counts }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === "/") {
      return currentPath === "/" && !activeLeague;
    }
    return currentPath.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Soccer Analytics</div>

      <nav className="sidebar-nav">
        <Link
          to="/"
          className={
            currentPath === "/" && !activeLeague
              ? "sidebar-link-active"
              : "sidebar-link"
          }
        >
          All Teams
        </Link>

        <div className="sidebar-section">
          <div className="sidebar-heading">Leagues</div>
          {leagues.map((league) => (
            <Link
              key={league.name}
              to={`/league/${encodeURIComponent(league.name)}`}
              className={
                activeLeague === league.name
                  ? "sidebar-link-active"
                  : "sidebar-link"
              }
            >
              {league.name}
              {counts && (
                <span className="ml-2 text-xs text-gray-400">
                  ({league.count})
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-heading">Analytics</div>
          <Link
            to="/matches"
            className={
              isActive("/matches") ? "sidebar-link-active" : "sidebar-link"
            }
          >
            Upcoming Matches
          </Link>
          <Link
            to="/analytics"
            className={
              isActive("/analytics") ? "sidebar-link-active" : "sidebar-link"
            }
          >
            Distribution Graphs
          </Link>
        </div>
      </nav>

      <div className="mt-auto pt-6 px-6">
        <div className="text-xs text-gray-400">
          Powered by
          <br />
          <a
            href="https://cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00d4ff] hover:text-[#00b8e6] hover:underline transition-colors"
          >
            Cloudflare
          </a>
          <br />
          <a
            href="https://footystats.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00d4ff] hover:text-[#00b8e6] hover:underline transition-colors"
          >
            FootyStats API
          </a>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
