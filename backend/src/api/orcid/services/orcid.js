"use strict";

/**
 * orcid service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::orcid.orcid", ({ strapi }) => ({
  /**
   * Validates an ORCID iD against the public API.
   * 
   * @param {string} orcidId - The ORCID iD to validate (e.g., 0000-0002-1825-0097)
   * @returns {Promise<boolean>} - True if valid and exists
   */
  async validate(orcidId) {
    if (!orcidId) return false;

    // Validate format: 0000-0000-0000-0000 or 0000-0000-0000-000X
    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
    if (!orcidRegex.test(orcidId)) {
      throw new Error("Invalid ORCID iD format");
    }

    try {
      const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 200) {
        return true;
      }

      if (response.status === 404) {
        return false;
      }

      // Handle other statuses as false or logs
      strapi.log.warn(`ORCID API returned unexpected status: ${response.status}`);
      return false;
    } catch (error) {
      strapi.log.error(`Error validating ORCID iD: ${error.message}`);
      return false;
    }
  },
}));
