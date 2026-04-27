# ADR 0001: Institution Membership Join Table & Education FK

## Status
Proposed

## Context
The current user-institution relationship is a direct `manyToOne` link, which is inflexible for users with multiple affiliations. Additionally, institutional data for education is stored as plain text, hindering data quality and cross-referencing.

Staging data needs to be backfilled to a default "Akvo" institution to maintain consistency during this structural transition.

## Decision
1. **Introduction of `institution-membership` collection**: Move the affiliation logic to a join table (collection type) to support multiple affiliations in the future and store metadata (type, verification status).
2. **Formalize Education Relationship**: Replace `educationInstitutionName` with a `highestEducationInstitution` relationship (manyToOne) to the `Institution` collection.
3. **One-Time Data Migration**: Implement a bootstrap migration script in Strapi that:
    - Creates/Ensures the "Akvo" institution exists.
    - migrates existing user data (direct institution relation and education strings) to the new structure.
    - Uses a `seed-history` or `migration-lock` mechanism to ensure idempotency.

## Consequences
- **Positive**: Greater flexibility for user affiliations, better data structured for education, automated consistency in staging.
- **Negative**: Increased complexity in API calls (requires deeper population), need to maintain migration logic for new environments.
- **Neutral**: Requires updates to frontend components that interact with profile data.
