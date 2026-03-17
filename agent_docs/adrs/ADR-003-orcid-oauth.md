# ADR-003: ORCID Identity Verification via OAuth 2.0

- **Status**: Proposed
- **Context**:
  The initial data model included an `orcidId` field and an `orcidVerified` boolean. An automated service was built to check if an ID exists in the public ORCID database. However, because ORCID IDs are public (found on journals and CVs), a user could "claim" any ID without proving ownership. This creates a high risk of impersonation on a platform dedicated to verified research managers.

- **Decision**:
  We will implement **ORCID OAuth 2.0** (using the Public API) to handle both registration and identity verification.

- **Proposed Workflow**:
  1. User clicks "Sign up with ORCID" or "Link ORCID".
  2. Redirect to ORCID Authorization server.
  3. User logs in to ORCID and authorizes Science for Africa.
  4. ORCID redirects back with an authorization code.
  5. SFA Backend exchanges code for an access token and the user's `orcidId`.
  6. Backend updates/creates user and sets `orcidVerified: true`.

- **Alternatives Considered**:
  - **Social Verification**: User adds a code to their ORCID profile. (Rejected: High friction for users).
  - **Manual Verification**: Admin checks researcher identity. (Rejected: Not scalable).

- **Consequences**:
  - **Pros**: Guaranteed identity ownership; frictionless "1-click" registration.
  - **Cons**: Requires registration of client credentials with ORCID; slight increase in backend complexity.

## Discussion Points for the Team
1. **Public vs Member API**: Should we use the Free Public API (Identity proof only) or the Member API (allows us to write to their ORCID profile)? (Recommendation: Start with Public).
2. **Mandatory vs Optional**: Should ORCID be required for all users or just for those seeking "Expert" status?
3. **Legacy Data**: How do we handle existing users who reached the "Verified" status using the previous (insecure) existence check? Should we force re-verification?
