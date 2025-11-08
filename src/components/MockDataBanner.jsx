function MockDataBanner() {
  return (
    <div className="mock-data-banner">
      <div className="banner-content">
        <h2>Demo Mode: Using Mock Data</h2>
        <p>
          You're viewing this app with mock data. To connect to real soccer data:
        </p>
        <ol>
          <li>
            <a
              href="https://developers.cloudflare.com/hyperdrive/configuration/connect-to-postgres/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Set up a PostgreSQL database
            </a>{" "}
            with soccer data or configure FootyStats API integration
          </li>
          <li>Create a Hyperdrive binding in your wrangler.jsonc file.</li>
          <li>
            Configure your FootyStats API key in environment variables for live data.
          </li>
        </ol>
        <p>
          This app can pull data from{" "}
          <a
            href="https://footystats.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            FootyStats API
          </a>
          , PostgreSQL database, or S3 storage.
        </p>
      </div>
    </div>
  );
}

export default MockDataBanner;
