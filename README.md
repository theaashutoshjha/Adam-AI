# ADAM-AR on Cloudflare Pages

    public/index.html          the website
    public/_headers            security headers
    functions/api/contact.js   contact form backend (POST /api/contact)
    schema.sql                 D1 table for enquiries
    wrangler.toml              Pages + D1 config

## Deploy

    npm i -g wrangler && wrangler login
    wrangler d1 create adam-ar-db            # copy database_id into wrangler.toml
    wrangler d1 execute adam-ar-db --remote --file=schema.sql
    wrangler pages deploy public --project-name adam-ar

## Read enquiries

Dashboard: Storage & Databases > D1 > adam-ar-db > Tables > enquiries (or Console tab):

    SELECT * FROM enquiries ORDER BY id DESC;

CLI:

    wrangler d1 execute adam-ar-db --remote --command "SELECT * FROM enquiries ORDER BY id DESC"

## Optional email alerts (Resend)

Pages project > Settings > Variables and Secrets: RESEND_API_KEY (secret), NOTIFY_TO, NOTIFY_FROM.
