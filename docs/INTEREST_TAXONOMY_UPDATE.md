# Feature Specification: Interest Taxonomy Update (#83)

## 1. Vision & Goals
Update the platform's interest taxonomy to align with the Research Management and Innovation frameworks (SFA Standards). The primary goal is to provide a more professional and relevant set of tags for users and institutions while maintaining backward compatibility with existing data.

## 2. Target Users
- **Individual Users**: Research managers, PIs, and students seeking to define their expertise.
- **Institutions**: Organizations seeking to define their thematic focus areas.
- **Administrators**: Staff managing the platform's data integrity.

## 3. User Journeys
### Onboarding Selection
1. User reaches Step 2 of onboarding.
2. User sees two distinctions: "Research & Innovation Themes" and "Research Management Competencies".
3. User selects up to 5 interests from across the 12 categories.
4. Selection is saved to the user profile.

### Filtering & Search
1. User visits the Community or Collaboration page.
2. User opens the interest/tag filter.
3. User sees only the new (active) interests grouped by category.

## 4. Feature Requirements

### FR-1: Soft Migration (Mandatory)
- Existing interests MUST NOT be deleted from the database.
- Legacy interests (e.g., "Bioinformatics") MUST be marked as `isActive: false`.
- New interests MUST be marked as `isActive: true`.

### FR-2: Taxonomy Seeding
- The seeder MUST populate 12 categories:
    - Set 1 (Themes): Research & Innovation Governance; Grants, Contracts & Partnerships; Innovation, Translation & Impact; Systems, Capacity & Workforce.
    - Set 2 (Competencies): Governance, Strategy & Leadership; Research Development & Funding; Financial & Grants Management; Infrastructure and Systems; Human Capacity...; Ethics...; Monitoring...; Innovation...

### FR-3: Category Grouping
- Interests MUST be grouped by their respective categories in all UI selection components.
- The UI MUST handle overlapping category names gracefully (e.g., "Innovation, Translation & Impact" appears in both sets).

### 4. Production Deployment
The production taxonomy sync is **manual** and idempotent. Run the following command after deploying the backend:

```bash
# Execute within the backend container
npm run seed:prod
```

This script will:
- Synchronize all 12 Interest Categories and their Interests.
- Deactivate (soft migration) any legacy interests/categories.
- Ensure public permissions are correctly configured.

## 5. Non-Functional Requirements
- **Performance**: Seeder must run within < 5 seconds. Onboarding fetch must be cached or optimized.
- **Security**: Prevent deletion of interest records via controller overrides.
- **Localization**: All categories and interests should be ready for i18n (though initial seed is EN).

## 6. Success Metrics
- 100% of new users select interests from the updated taxonomy.
- Zero "broken" profile views for legacy users.

## 7. Out of Scope
- Automated mapping of old interests to new ones (users must manually update if they wish).
- Multi-language seeding in the first pass (localized labels to follow).
