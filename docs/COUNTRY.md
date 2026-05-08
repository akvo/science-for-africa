# Feature: Relational Country Model

## Overview
To ensure data consistency and enable future extensibility (e.g., ISO codes, regions), the `Country` property of `Institution` has been migrated from a free-text string to a relational model.

## Data Architecture
### `Country` Collection Type
- **`name`** (String, Unique, Required, Localized)
- **`isActive`** (Boolean, Default: `true`)
- **`sortOrder`** (Integer, Default: `0`)
- **`institutions`** (Relation `OneToMany` with `api::institution`)

## Security Constraints
Similar to `InstitutionType`, the `Country` entity is protected from accidental deletion.
- **Delete Protection**: `api::country/controllers/country.js` hardcodes a `403 Forbidden` response for all `DELETE` requests.
- **Deactivation**: If a country needs to be hidden, use the `isActive` flag.

## Seeding Strategy
- **Production Seeder**: `backend/src/utils/prod-seeder.js` contains a predefined list of African countries (and potentially others) that are bootstrapped automatically.
- **Development Seeder**: `backend/src/utils/seeder.js` automatically maps the dummy institution country strings to the relational `Country` IDs on startup.

## ADR-002: Relational Country Migration
- **Status**: Accepted
- **Context**: The `Institution` model previously stored countries as strings, which invites typos and makes filtering fragmented.
- **Decision**: Migrate to a dedicated `api::country` collection type with delete protection.
- **Consequences**: Queries for institutions now require populating the `country` relation to retrieve the country name.
