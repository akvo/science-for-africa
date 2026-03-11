# System Architecture & Data Model
**Project**: Science for Africa - External Platform
**Phase**: Architect (v3 - Figma & Google Docs Alignment)

## 1. System Overview
The backend is powered by **Strapi v5**, acting as a headless CMS and community backend API. The architecture leverages Strapi's built-in `users-permissions` heavily extended to allow robust community engagement. It relies heavily on hierarchical collections (`Community` -> `Category` -> `Thread` -> `Post`) and a comprehensive reporting system for peer moderation. For detailed technical mapping of this ERD to Strapi v5 features, see the [Strapi v5 Architectural Mapping](research-findings/strapi-v5-mapping.md).

## 2. Data Model ERD (Entity-Relationship Diagram)

### 2.1 Top-Level Data Model ERD
This monolithic diagram provides a bird's-eye view of all collections and relations in the Strapi backend.

```mermaid
erDiagram
    %% Core Users & Institutions
    USER {
        string firstName
        string lastName
        string email
        text bio
        string jobTitle
        string expertise
        enum careerStage "Early-Career, Mid-Career, Senior, Executive"
        int yearsOfExperience
        boolean mentorAvailability
        string orcidId
        string linkedInUrl
        string profilePhoto
        enum region "Eastern, Southern, Western, Central, Northern Africa, Other"
        string country
        json notificationPreferences
        enum role "Platform Admin, Moderator, Institution Admin, Contributor, Member"
    }

    INSTITUTION {
        string name
        string city
        string country
        enum affiliationRequestStatus "Open, Invite-Only"
    }

    MENTORSHIP_CONNECTION {
        text requestMessage
        enum status "Pending, Accepted, Declined"
    }

    TAG {
        string name
        string slug
        enum tagGroup "Expertise, Opportunity Category, Resource Topic, Region"
    }

    COURSE {
        string title
        string slug
        text description
        enum type "Learning Course, Partner Course"
        boolean isExternal
        string externalUrl
        boolean certificationAvailable
        media thumbnail
    }

    %% Community & Hierarchical Forums
    COMMUNITY {
        string name
        string slug
        text description
        media featuredImage
        enum type "Programme, Thematic, Regional, Working Group"
        enum privacy "Public, Private"
    }

    FORUM_CATEGORY {
        string name
        string slug
        text description
        media icon
        int sortOrder
        boolean isLocked
        boolean isPrivate
    }

    THREAD {
        string title
        string slug
        text content
        enum status "Open, Closed, Archived"
        boolean isPinned
        boolean isLocked
        boolean isPrivate
    }

    POST {
        text content
        enum status "Published, Pending, Flagged, Hidden"
        boolean isSolution
        datetime createdAt
    }

    REPORT {
        text reason
        enum status "Pending, Resolved, Dismissed"
        text moderatorNotes
    }

    %% Content Types
    RESOURCE {
        string title
        string slug
        enum resourceType "Publication, Training & Capacity Building, Impact Stories, Toolkits & Standards, Policy Brief, Case Study, Report, Tool"
        text description
        media file
        datetime publicationDate
        enum visibility "Public, Members Only"
    }

    OPPORTUNITY {
        string title
        string slug
        enum oppType "Funding, Job, Scholarship, Fellowship, Conference, Training, Award"
        text content
        string providerName
        media providerLogo
        datetime deadline
        string applicationLink
        text eligibilityCriteria
        string fundingAmount
        boolean isRemote
        int viewCount
        int clickCount
        int saveCount
    }

    EVENT {
        string title
        string slug
        enum eventType "Conference, Workshop, Webinar"
        text description
        string cost
        int maxParticipants
        datetime startDate
        datetime endDate
        string timezone
        string location
        string registrationUrl
        string recordingUrl
    }

    %% Relationships - Core
    USER }|--|| INSTITUTION : "Belongs to"
    INSTITUTION ||--|| USER : "Managed by (Admin)"
    USER ||--o{ MENTORSHIP_CONNECTION : "As Mentor"
    USER ||--o{ MENTORSHIP_CONNECTION : "As Mentee"

    %% Relationships - Forums
    USER }|--o{ COMMUNITY : "Joined as Member"
    COMMUNITY ||--o{ FORUM_CATEGORY : "Contains"
    FORUM_CATEGORY ||--o{ THREAD : "Organizes"
    THREAD ||--o{ POST : "Has Replies"
    POST |o--o{ POST : "Replies To (Parent)"

    USER ||--o{ THREAD : "Author of"
    USER ||--o{ POST : "Author of"

    %% Relationships - Moderation
    USER ||--o{ REPORT : "Files"
    POST ||--o{ REPORT : "Targeted by"
    THREAD ||--o{ REPORT : "Targeted by"

    %% Relationships - Resources & Opps
    USER ||--o{ RESOURCE : "Uploads"
    USER ||--o{ EVENT : "Organizes"
    USER ||--o{ COURSE : "Enrolls in"
    INSTITUTION ||--o{ COURSE : "Provides (Partner)"

    %% Taxonomy Links
    TAG }|--o{ USER : "Expertise of"
    TAG }|--o{ OPPORTUNITY : "Categorizes"
    TAG }|--o{ RESOURCE : "Categorizes"
    TAG }|--o{ EVENT : "Categorizes"
    TAG }|--o{ THREAD : "Tags"
    TAG }|--o{ COURSE : "Tags"
```

### 2.2 Core Identity & Access Control
This module anchors users to institutions and manages mentor-mentee connections.

```mermaid
erDiagram
    %% Core Users & Institutions
    USER {
        string firstName
        string lastName
        string email
        text bio
        string jobTitle
        string expertise
        enum careerStage "Early-Career, Mid-Career, Senior, Executive"
        int yearsOfExperience
        boolean mentorAvailability
        string orcidId
        string linkedInUrl
        string profilePhoto
        enum region "Eastern, Southern, Western, Central, Northern Africa, Other"
        string country
        json notificationPreferences
        enum role "Platform Admin, Moderator, Institution Admin, Contributor, Member"
    }

    INSTITUTION {
        string name
        string city
        string country
        enum affiliationRequestStatus "Open, Invite-Only"
    }

    MENTORSHIP_CONNECTION {
        text requestMessage
        enum status "Pending, Accepted, Declined"
    }

    %% Relationships
    USER }|--|| INSTITUTION : "Belongs to"
    INSTITUTION ||--|| USER : "Managed by (Admin)"
    USER ||--o{ MENTORSHIP_CONNECTION : "As Mentor"
    USER ||--o{ MENTORSHIP_CONNECTION : "As Mentee"
```

### 2.3 Community & Forums
This module governs the hierarchical structure of discussions and peer moderation reporting.

```mermaid
erDiagram
    COMMUNITY {
        string name
        string slug
        text description
        media featuredImage
        enum type "Programme, Thematic, Regional, Working Group"
        enum privacy "Public, Private"
    }

    FORUM_CATEGORY {
        string name
        string slug
        text description
        media icon
        int sortOrder
        boolean isLocked
        boolean isPrivate
    }

    THREAD {
        string title
        string slug
        text content
        enum status "Open, Closed, Archived"
        boolean isPinned
        boolean isLocked
        boolean isPrivate
    }

    POST {
        text content
        enum status "Published, Pending, Flagged, Hidden"
        boolean isSolution
        datetime createdAt
    }

    REPORT {
        text reason
        enum status "Pending, Resolved, Dismissed"
        text moderatorNotes
    }

    %% Core Entity References
    USER {
        string id "Implicit Relation"
    }

    %% Relationships
    USER }|--o{ COMMUNITY : "Joined as Member"
    COMMUNITY ||--o{ FORUM_CATEGORY : "Contains"
    FORUM_CATEGORY ||--o{ THREAD : "Organizes"
    THREAD ||--o{ POST : "Has Replies"
    POST |o--o{ POST : "Replies To (Parent)"

    USER ||--o{ THREAD : "Author of"
    USER ||--o{ POST : "Author of"

    USER ||--o{ REPORT : "Files"
    POST ||--o{ REPORT : "Targeted by"
    THREAD ||--o{ REPORT : "Targeted by"
```

### 2.4 Content, Opportunities & Taxonomy
This module handles draft/publish content pipelines and the unified tagging system.

```mermaid
erDiagram
    TAG {
        string name
        string slug
        enum tagGroup "Expertise, Opportunity Category, Resource Topic, Region"
    }

    RESOURCE {
        string title
        string slug
        enum resourceType "Publication, Training & Capacity Building, Impact Stories, Toolkits & Standards, Policy Brief, Case Study, Report, Tool"
        text description
        media file
        datetime publicationDate
        enum visibility "Public, Members Only"
    }

    OPPORTUNITY {
        string title
        string slug
        enum oppType "Funding, Job, Scholarship, Fellowship, Conference, Training, Award"
        text content
        string providerName
        media providerLogo
        datetime deadline
        string applicationLink
        text eligibilityCriteria
        string fundingAmount
        boolean isRemote
        int viewCount
        int clickCount
        int saveCount
    }

    EVENT {
        string title
        string slug
        enum eventType "Conference, Workshop, Webinar"
        text description
        string cost
        int maxParticipants
        datetime startDate
        datetime endDate
        string timezone
        string location
        string registrationUrl
        string recordingUrl
    }

    COURSE {
        string title
        string slug
        enum type "Learning Course, Partner Course"
        boolean isExternal
    }

    %% Core Entity References
    USER {
        string id "Implicit Relation"
    }

    THREAD {
        string id "Implicit Relation"
    }

    %% Relationships
    USER ||--o{ RESOURCE : "Uploads"
    USER ||--o{ EVENT : "Organizes"
    USER ||--o{ COURSE : "Enrolls in"
    INSTITUTION ||--o{ COURSE : "Provides (Partner)"

    TAG }|--o{ USER : "Expertise of"
    TAG }|--o{ OPPORTUNITY : "Categorizes"
    TAG }|--o{ RESOURCE : "Categorizes"
    TAG }|--o{ EVENT : "Categorizes"
    TAG }|--o{ THREAD : "Tags"
    TAG }|--o{ COURSE : "Tags"
```

## 3. Data Model Explanation

### Institutions & Mentorship (Primary Engine)
*   **INSTITUTION**: Anchors users to physical organizations. A user requests affiliation which is approved by the assigned `Institution Admin`.
*   **MENTORSHIP_CONNECTION**: A direct join table between two `User` models (Mentor and Mentee) handling the request message and workflow status. Requires the Mentor to have `mentorAvailability` set to true.

### Community and Forum Hierarchy
*   **COMMUNITY**: The top-level grouping (e.g., "Western Africa Genomics"). Can be public or private, dictating Guest/Member access.
*   **FORUM_CATEGORY**: Organizes discussions within a Community (e.g., "Funding Advice", "General Chat").
*   **THREAD & POST**: The core engagement entities. Thread owns posts. Posts can have a recursive Parent-Child relationship to support nested UI replies. Threads have specific moderation boolean flags (`isPinned`, `isLocked`, `isPrivate`).

### Unified Tag System
A single `TAG` collection groups all taxonomy data (Expertise, Regions, Opportunity Types). It sits at the center of the application, linked via Many-to-Many relations to Users, Resources, Threads, and Opportunities.

### Moderation via Reports
Instead of users deleting others' content, users create a `REPORT`. The report holds relations to the reporter (`USER`) and the target (either a `POST` or `THREAD`). Moderators view this queue to make decisions, eventually updating the status of the Report and potentially `Hiding` the offending post.

### Learning & Courses
*   **COURSE**: Represents professional development content. Can be internal "Learning Courses" or "Partner Courses" that redirect externally. Linked to `USER` via enrollment and `INSTITUTION` for partner accreditation.
