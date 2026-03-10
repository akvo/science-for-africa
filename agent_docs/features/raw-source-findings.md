# Raw Source Analysis Findings
**Project**: Science for Africa - External Platform
**Phase**: Analyze (Source Artifacts)

This document serves as an archive of the raw information extracted directly from the provided source materials (Figma mockups and Google Docs) via browser automation.

---

## 1. Figma Mockup Analysis
**Source Link**: [Figma Board](https://www.figma.com/board/Chk297BVmFWcw4zJjuqX5F/Science-for-Africa--External-?node-id=55-3844&t=pnha0YXHRsfhsHBv-1)

### Key Entities & Fields
*   **User Profile**: First Name, Last Name, Email, Role(s), Expertise, Interests, Profile Photo, ORCID ID, Institutional Affiliation.
*   **Institution**: Name, Location (City/Country), Admin User, Member List, Affiliation Request Status.
*   **Resources**: Title, Type (Publication, Training & Capacity Building, Impact Stories, Toolkits & Standards), Description, File Upload/Link, Tags, Author, Moderation Status (Pending/Approved).
*   **Opportunities**: Title, Type (Funding, Jobs, Scholarships), Description, Deadline, Application Link.
*   **Events**: Title, Date, Description, Link, Organizer (User or Institution), Type (Conference, Workshop, Webinar), Moderation Status.
*   **Community / Forums**: Category (Topics), Thread Title, Post Content, Author, Timestamp.
*   **Mentorship**: Mentor, Mentee, Request Message, Status (Pending/Accepted/Declined).

### User Roles & Permissions
*   **Platform Admin (Strapi)**: Full access to all content, user management, and system settings.
*   **Organisation / Institution Admin**: Can manage their institution's profile, approve affiliation requests from other users, and moderate content (Resources/Events) posted by their members.
*   **Organisation / Institution Member**: Can post content (Resources, Events) that is automatically or semi-automatically linked to their institution.
*   **Community Admin**: Has moderation privileges over specific sections like Discussion Forums or Mentorship matching.
*   **Community Member / Individual User**: Can browse all sections, participate in forums, submit resources/events for moderation, and request mentorship.

### Key Workflows Identified
*   **Onboarding**: Includes email verification, role selection, and an optional step to link an ORCID ID or request institutional affiliation.
*   **Moderation Pipeline**: Resources and Events submitted by users remain in a "Pending" state until reviewed by a Platform Admin or Institution Admin.
*   **Affiliation Flow**: Users can request to join an existing institution.

---

## 2. Google Doc: Community of Practice Platform (Detailed Data Model)
**Source Link**: [Google Doc 1](https://docs.google.com/document/d/1vRhPkE-ebguJqRh-PMW2zqBYK9PY1ymo5SgrodpAM5s/edit?usp=sharing)

### Data Model Entities
*   **User Profile (Extended)**: Bio, Job Title, Institution, Country, Region (Eastern, Southern, Western, Central, Northern Africa, or Other), Expertise Areas (linked to Tags), Years of Experience, Career Stage (Early/Mid/Senior/Executive), LinkedIn URL, ORCID ID, Mentor Availability (toggle), and Notification Preferences.
*   **Community**: Name, Slug, Description, Type (Programme, Thematic, Regional, Working Group), Privacy status (Public/Private), Featured Image. Contains multiple Forum Categories; many-to-many link with Members and Admins.
*   **Opportunity**: Title, Slug, Content (richtext), Opportunity Type (Funding, Job, Scholarship, Fellowship, Conference, Training, Award), Provider Name/Logo, External URL, Deadline (supports rolling deadlines), Eligibility Criteria, Funding Amount, Location (Remote toggle), View/Click/Save counters. Linked to Tags.
*   **Resource**: Title, Slug, Description, Resource Type (Report, Tool, Training Material, Policy Brief, Case Study), File attachments, Author Name, Publication Date, Visibility (Public/Members Only). Linked to Tags and Uploader.
*   **Event**: Title, Slug, Description, Start/End Datetime, Timezone, Virtual/Physical Location, Registration URL, Cost, Max Participants, Recording URL.
*   **Tag (Unified Taxonomy)**: Name, Slug, Tag Group (Expertise, Opportunity Category, Resource Topic, Region). Used to filter and link content across all entities.

### Feature Set
*   **Opportunities Board**: A curated repository of research funding and career opportunities specifically for the African context.
*   **Resource Repository**: A version-controlled library of professional documents and tools.
*   **Discussion Forums**: Space for moderated thematic and regional peer collaboration.
*   **Member Directory**: A searchable database of practitioners with filters for mentorship and specific expertise.
*   **Event Management**: Integrated scheduling for webinars, workshops, and networking sessions.

### User Roles & Permissions
*   **Guest**: Can view public opportunities and basic platform information; restricted resource access.
*   **Member**: Standard authenticated user. Can create forum threads, reply to posts, view the member directory, and save opportunities.
*   **Contributor**: Privileged users (e.g., from partner institutions). Can upload resources and post new opportunities for approval.
*   **Moderator**: Governance role. Can manage forum activity, approve/reject reported content, and moderate discussions.
*   **Admin**: Full platform management, including user role assignment and system-wide configuration.

---

## 3. Google Doc: Forum Functionality Focus
**Source Link**: [Google Doc 2](https://docs.google.com/document/d/1FbywZGVxfjvWMu9YzFxzx-CquQDgpJzYrykochlBaFw/edit?usp=sharing)

### Forum Data Model Hierarchy
*   **Forum Category**: Organises threads within a community. Attributes: `name`, `slug`, `description`, `sort_order`, `is_locked/is_private`, `icon`. Contains parent/child relations.
*   **Thread**: The core discussion unit. Attributes: `title`, `slug`, `content`, `status` (open, closed, archived), `is_pinned/is_locked/is_private`.
*   **Post (Replies)**: Content within threads. Attributes: `content`, `status` (published, pending, flagged, hidden), `is_solution`. Recursively relates to `parent_post` for nesting.
*   **Report**: For content moderation. Attributes: `reporter`, `reported_post/thread` (polymorphic relation), `reason`, `status` (pending, resolved, dismissed), `moderator_notes`.

### Moderation Workflows
*   **Reporting Flow**: Any logged-in Member can flag a Post or Thread. Creates a `Report` entry with a "pending" status.
*   **Review Process**: Moderators can view pending reports and execute actions:
    *   **Hide Post**: Sets the post status to `hidden` or `is_hidden: true`.
    *   **Dismiss Report**: Marks the report "resolved/dismissed" without taking action.
    *   **Escalate**: Notifying admins for severe violations.

### Advanced Features
*   **Real-time Notifications**: Users receive alerts for mentions (`@user`) and direct replies.
*   **Threaded Replies**: Visual nesting of post replies.
*   **Rich Text Editor**: Support for internal links, images, and mentions.
