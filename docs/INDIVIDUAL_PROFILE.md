# Individual Profile — Implementation Specification

## 📊 Overview

### Purpose
Provide a centralized hub for registered individual users to manage their professional identity, track platform interactions (communities, collaborations, content), and access their saved resources. This feature enhances user engagement and professional visibility within the Science for Africa community.

### Key Principle
**Professional Identity & Privacy**: Users should have full control over their public profile and privacy settings, ensuring their professional presence is accurate and secure.

### User Experience
Users access their profile via the user dropdown in the Navbar. The profile is organized into logical tabs based on the [Figma Design](https://www.figma.com/design/9pJSajNx54DrJ1rafYOr6e/Science-for-Africa):
- **Details**: Identity management and core professional info. ([Design](https://www.figma.com/design/9pJSajNx54DrJ1rafYOr6e/Science-for-Africa?node-id=130-5796&m=dev), [Edit](https://www.figma.com/design/9pJSajNx54DrJ1rafYOr6e/Science-for-Africa?node-id=179-12861&m=dev))
- **Communities**: Oversight of joined groups. ([Design](https://www.figma.com/design/9pJSajNx54DrJ1rafYOr6e/Science-for-Africa?node-id=175-4875&m=dev), [Empty State](https://www.figma.com/design/9pJSajNx54DrJ1rafYOr6e/Science-for-Africa?node-id=299-12849&m=dev))
- **Collaboration**: Tracking of active and completed projects. ([Design](https://www.figma.com/design/9pJSajNx54DrJ1rafYOr6e/Science-for-Africa?node-id=696-37828&m=dev), [Empty State](https://www.figma.com/design/9pJSajNx54DrJ1rafYOr6e/Science-for-Africa?node-id=179-9917&m=dev))
- **Resources**: Access to saved documents.

---

## 🎯 Design Principles
- **Clarity & Transparency**: High visibility into account status and community involvement.
- **Ease of Management**: Simple toggles/buttons for leaving communities or removing saved items.
- **Empty States**: Professional and helpful guidance when content is missing.
- **Visual Consistency**: Adopts the platform's standardized grid and navigation patterns.

---

## 📐 Architecture Design

### Data Flow / Logic Flow
```mermaid
graph TD
    A[User Profile Page] --> B{Tab Selection}
    B -->|Details| C[User Profile Form]
    B -->|Communities| D[Community Membership API]
    B -->|Collaboration| E[Collaboration Status API]
    B -->|Resources| F[Saved Resources API]
    B -->|Saved| G[Saved Posts API]
    B -->|Content| H[User Posts API]
    B -->|Events| I[Event Registration API]
    B -->|Courses| J[Course Enrollment API]
    B -->|Mentorship| K[Mentorship Connection API]

    C -->|Update| L[PUT /api/auth/me]
    D -->|Leave| M[DELETE /api/communities/:id/leave]
    G -->|Remove| N[DELETE /api/saved-posts/:id]
```

### Database Schema / Data Structure
- **User Entity**: Extension of current schema to include:
    - `fullName` (string)
    - `displayName` (string)

    - `profilePhoto` (Media Relation)
    - `pageCover` (Media Relation)
    - `languagePreferences` (Enum: en, fr)
    - `biography` (Text, 275 char limit)
    - `roleType` (Enum: professional roles)
    - `careerStage` (Enum: career stages)
    - `educationLevel` (string)
    - `educationInstitutionName` (string)
    - `institutionName` (string)
    - `orcidId` (string)
    - `interests` (Component: user.interest, repeatable)
    - `onboardingComplete` (boolean)
    - `full_name` (Auto-synced from first/last name - legacy reference)

    - `memberships` (One-to-Many to `CommunityMembership`)
    - `collaborationInvites` (One-to-Many to `CollaborationInvite`)
- **Community**: (Branch 31 Merged)
    - `avatarUrl` (String)
    - `bannerUrl` (String)
    - `handle` (String)
    - `subscribers` / `posts` (Integers)
- **CommunityMembership**: Relation between User and Community with Role.
- **CollaborationInvite**: Relation between User and CollaborationCall with InviteStatus.

---

## ✅ Acceptance Criteria

### User Acceptance Criteria (UAC Baseline)
#### Core Profile
- [x] **Profile Customization**: Within "Details" tab, user can update display name, professional bio (character limited), profile photo, and page cover.
- [x] **View Details**: See Full Name, Email, Role, Education, Institutional Organization, optional description, language preferences, and unique ORCID identifier.
- [x] **Edit Mode**: "Edit" button transforms fields into inputs with "Save" and "Cancel" buttons.
- [x] **Validation**: Real-time "characters left" counter for bio; file type/size validation for images.

#### Community Oversight
- [ ] **Communities Tab**: Displays a grid of joined communities and sub-communities.
- [ ] **Community Actions**: Ability to "View" a community or "Leave" it.
- [ ] **Badges**: Show "Joined" status badges where appropriate.

#### Collaboration Tracking
- [ ] **Collaboration Tab**: Monitor involvement in active and completed collaboration spaces.
- [ ] **Project Details**: Display project objectives and relevant tags.
- [ ] **Status Badges**: Clear "Active" (green) or "Completed" (red) indicators.

#### Resource & Activity
- [ ] **Resources Tab**: Access and download technical documents or reports saved or associated with the profile.
- [ ] **Empty States**: Display a professional empty state with a relevant CTA if no content is found in any tab.

---

## 🔮 Future Development (Post-MVP)
The following features were identified in the initial discovery but are not part of the current UAC baseline:

- **Saved Items**: Consolidated list of bookmarked posts with community context. Ability to remove directly.
- **My Content**: Chronological feed of own posts with interaction counts (bookmarks, comments, shares).
- **Event Attendance**: Management of upcoming and past attendances.
- **Courses & Certifications**: Educational progress and certifications.
*   **Mentorship**: Management of mentorship relationships.
- **Quick Join**: Join community directly from a saved post view.
- **Public Profiles**: Publicly accessible profile URLs.
- **Notification Preferences**: Granular control over platform alerts.

### Technical Acceptance Criteria (Tech AC)
- [x] **API Security**: Endpoints restricted to authenticated owner of the profile.
- [ ] **Optimistic UI**: Joined/Leave/Saved status updates immediately on frontend.
- [ ] **Image Optimization**: Profile photos and covers are optimized/resized on upload.
- [x] **I18n**: Support for multi-language display (English/French) via dedicated `profile` namespace.

---

## 🔧 Implementation Details

### Phase 1: Foundation & Data Layer
- [x] Update Strapi User Schema with missing fields (`displayName`, `profilePhoto`, `pageCover`, etc.).
- [x] Implement/Harden `/api/auth/me` PUT endpoint.
- [x] Create basic Profile Layout in Next.js with Tab navigation.

### Phase 2: Core Tabs (MVP)
- [x] **Details Tab**: Implement View/Edit flows for identity management.
- [ ] **Communities Tab**: Implement grid view, sub-community support, and "Leave" logic.
- [ ] **Collaboration Tab**: Implement tracking for active/completed projects.
- [ ] **Resources Tab**: Implement document access and download functionality.
- [ ] **Empty States**: Implement for all tabs.

---

## 📡 API Reference

### Fetch Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Response**: `200 OK` with deep population of `memberships`, `collaborationInvites`, and Media.

### Update Profile
- **Method**: `PUT`
- **Path**: `/api/auth/me` (Custom extended endpoint)
- **Request Body**: `Multipart/form-data` for images or `application/json`
- **Response**: `200 OK` with updated user object.

### Leave Community
- **Method**: `DELETE`
- **Path**: `/api/communities/:id/leave`
- **Response**: `200 OK` with success message.
- **Action**: Permanent deletion of the `CommunityMembership` record for the current user.

---

## ✅ Implementation Checklist
- [ ] Unit tests for bio character counting and file validation.
- [ ] Integration tests for tab switching and empty states.
- [ ] Documentation updated in README and LLD.
- [ ] Security audit: verify user cannot edit other users' profiles via API.

---

## 📊 Example Scenarios

### Scenario 1: User Edits Bio
- **Input**: User enters 300 characters in bio field.
- **Expected**: Counter shows "-25 characters left" (assuming 275 limit), Save button disabled.

### Scenario 2: Empty Community Tab
- **Input**: New user visits "Communities" tab.
- **Expected**: "You don’t have any communities yet" message and "Explore communities" button.

---

## 🔮 Future Enhancements
- Public profile vanity URLs.
- Profile completion percentage progress bar.
- Activity heatmap/graph.
