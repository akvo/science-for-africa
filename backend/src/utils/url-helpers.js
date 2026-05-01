"use strict";

/**
 * Resolves the frontend URL from environment variables with a consistent priority.
 * Used for email links, OAuth callbacks, and other frontend redirections.
 *
 * Priority:
 * 1. NEXT_PUBLIC_FRONTEND_URL
 * 2. FRONTEND_URL
 * 3. PUBLIC_URL
 * 4. http://localhost:3000 (fallback)
 *
 * @returns {string} The sanitized frontend URL without a trailing slash.
 */
const getFrontendUrl = () => {
  return (
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    process.env.PUBLIC_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
};

module.exports = {
  getFrontendUrl,
};
