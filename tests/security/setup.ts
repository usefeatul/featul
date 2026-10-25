// Some auth modules read configuration at import time. Install the shared
// synthetic environment before any test can load those modules indirectly.
process.env.AUTH_TRUSTED_ORIGINS = "https://app.example.com,https://*.example.com";
process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:55439/security";
process.env.API_RATE_LIMIT_ENABLED = "false";
process.env.AUTH_RATE_LIMIT_ENABLED = "false";
