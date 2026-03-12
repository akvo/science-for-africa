# System Architecture & Data Model
**Project**: Science for Africa - External Platform
**Phase**: Architect (v4 - Clean Slate Refresh)

> [!NOTE]
> This version (v4) represents a "Clean Slate" data model built primarily from Figma user flows, as advised by the manager. The previous LLD-merged approach has been deprecated to remove legacy debt.

## 1. System Overview
The backend is powered by **Strapi v5**, acting as a headless CMS and community backend API. The architecture follows the "Clean Slate" approach, focusing on three core pillars: **Identity**, **Community**, and **Knowledge Base**.

## 2. Clean Slate Data Model ERD

```mermaid
erDiagram
    %% Identity & Institutions
    USER {
        string firstName
        string lastName
        string email
        text bio
        string orcidId
        enum careerStage "Early-Career, Mid-Career, Senior, Executive"
        string expertise
        boolean mentorAvailability
        enum role "Platform Admin, Moderator, Institution Admin, Contributor, Member"
        json notificationPreferences
    }

    INSTITUTION {
        string name
        string city
        string country
        media logo
        enum affiliationType "University, Research Org, Funding Agency, Other"
    }

    MENTORSHIP_REQUEST {
        text message
        enum status "Pending, Accepted, Declined"
        datetime requestedAt
    }

    %% Community & Forums
    COMMUNITY {
        string name
        string slug
        text description
        media featuredImage
        enum privacy "Public, Private"
    }

    FORUM_CATEGORY {
        string name
        string slug
        int sortOrder
    }

    THREAD {
        string title
        string slug
        text content
        boolean isPinned
        boolean isLocked
    }

    POST {
        text content
        boolean isSolution
        enum status "Published, Hidden"
    }

    REPORT {
        text reason
        enum status "Pending, Resolved"
    }

    %% Knowledge Base & Resources
    RESOURCE {
        string title
        string slug
        text content
        enum type "Publication, Training, Impact Story, Toolkit, Policy Brief, Case Study, Report, Tool"
        media file
        datetime publicationDate
        enum visibility "Public, Members Only"
    }

    OPPORTUNITY {
        string title
        string slug
        text content
        enum type "Grant, Job, Fellowship, Award"
        datetime deadline
        string externalUrl
    }

    %% Taxonomy
    TAG {
        string name
        string slug
        enum group "Expertise, Region, Topic"
    }

    %% Relationships
    USER }|--o| INSTITUTION : "Affiliated with"
    USER ||--o{ MENTORSHIP_REQUEST : "Sends"
    USER ||--o{ MENTORSHIP_REQUEST : "Receives"
    
    USER }|--o{ COMMUNITY : "Member of"
    COMMUNITY ||--o{ FORUM_CATEGORY : "Contains"
    FORUM_CATEGORY ||--o{ THREAD : "Organizes"
    THREAD ||--o{ POST : "Contains"
    POST |o--o{ POST : "Replies to"

    USER ||--o{ THREAD : "Author"
    USER ||--o{ POST : "Author"

    REPORT }|--|| USER : "Filed by"
    REPORT }|--o| POST : "Targets"

    TAG }|--o{ RESOURCE : "Tags"
    TAG }|--o{ OPPORTUNITY : "Tags"
    TAG }|--o{ USER : "Expertise of"
```

## 3. Data Model Explanation

### 3.1 Identity & Access
*   **Two-Tier User Architecture**: The system distinguishes between system administrators (`admin_users`) and platform users (`up_users`). Detailed in the [RBAC & User Architecture](file:///Users/galihpratama/Sites/science-for-africa/agent_docs/features/RBAC-User-Architecture.md) specification.
*   **USER**: Central social identity for the platform (`up_users`). Roles are derived from the Figma access matrices (Guest, Member, Expert, etc.). ORCID validation is a critical onboarding step.

### 3.2 Community Engine
*   **Hierarchical Structure**: Following the Figma user journey: Community -> Category -> Thread -> Post.
*   **Moderation**: Simple `REPORT` and `post.status` system for peer reporting and admin moderation.

### 3.3 Knowledge Base (Resources & Opportunities)
*   **Unified Content**: Resources and Opportunities share a similar metadata structure but serve different user needs (knowledge vs career growth).
*   **Taxonomy**: The `TAG` entity provides a unified cross-linking mechanism for expertise and topics.

## 4. Implementation Priorities (Figma Aligned)
1. **Onboarding & Auth**: Institutional affiliation workflow.
2. **Community Foundation**: Basic forum hierarchy and posting.
3. **Expert Directory**: Discovery via tags and mentorship requests.
4. **Knowledge Base**: Moderated resource submission.

## 5. Security & Access Control
API authentication and Role-Based Access Control (RBAC) are documented in detail in the [API Authentication & RBAC Mapping](file:///Users/galihpratama/Sites/science-for-africa/agent_docs/features/api-auth-rbac.md) specification.
