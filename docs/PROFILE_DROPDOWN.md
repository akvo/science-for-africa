# PROFILE DROPDOWN — Implementation Specification

## 📊 Overview

### Purpose
The Profile Dropdown provides authenticated users with a centralized navigation hub for account management, personal content, support, and session control. It enhances the user experience by offering quick access to profile-specific sections without leaving the current page.

### Key Principle
**Visual Clarity & Accessibility**: The implementation must strictly follow the provided high-fidelity design to ensure brand consistency and intuitive navigation.

### User Experience
1. **Trigger**: An authenticated user clicks their avatar initials/image in the top-right corner of the Navbar.
2. **Identity Verification**: The dropdown opens, immediately showing the user's name and professional title/type (e.g., "Institutional researcher").
3. **Navigation**: User can scan three distinct sections:
    - **Personal Hub**: Quick links to Details, Communities, Content, etc.
    - **Support**: Direct link to FAQ.
    - **Session**: Log out capability.
4. **Action**: Selecting an item navigates the user to the corresponding page or terminates the session.

---

## 🎯 Design Principles
- **Visual Hierarchy**: Clear separation between identity (header), navigation (body), and actions (footer) using dividers.
- **Micro-interactions**: Subtle hover states for each menu item to provide feedback.
- **Minimalist Iconography**: Only the "Log out" action retains an icon for visual emphasis, aligning with the brand's premium aesthetic.
- **Responsive Layout**: Ensure the dropdown is accessible and scrollable on smaller viewports if necessary.

---

## 📐 Architecture Design

### Data Flow / Logic Flow
1. **State Injection**: The `Navbar` component consumes the `useAuthStore` to get the `user` object.
2. **Dynamic Rendering**:
    - If `isAuthenticated` is true, render the `Avatar` trigger.
    - On click, the `DropdownMenu` renders a structured list of links.
3. **Identity Resolution**:
    - Initials: Derived via `getInitials(user.fullName || user.username)`.
    - Profile Details: Displays `user.fullName` and a formatted `user.userType`.
4. **Navigation**: Links are mapped to `/profile/[section]` (e.g., `/profile/saved-posts`).
5. **Logout**: Triggers the `logout()` method in `useAuthStore`, followed by `router.push('/')`.

### Component Structure
- `DropdownMenu` (Root)
    - `DropdownMenuTrigger` -> `Avatar`
    - `DropdownMenuContent`
        - **Header Section** (Avatar + Name + Type)
        - **Separator**
        - **Management Section** (Map of Links)
        - **Separator**
        - **Support Section** (FAQ)
        - **Separator**
        - **Action Section** (Log out)

### Routing Strategy
- `/profile/details`
- `/profile/communities`
- `/profile/content`
- `/profile/saved-posts`
- `/profile/events`
- `/profile/courses`
- `/faq`

---

## ✅ Acceptance Criteria
- [x] Dropdown is only visible for logged-in users.
- [x] Clicking the avatar opens a vertical dropdown menu.
- [x] Header displays Full Name and User Type.
- [x] The menu includes navigation for:
    - Details
    - Communities
    - Content
    - Saved posts
    - My events
    - Courses and certifications
- [x] FAQ link is present in a separate bottom section.
- [x] "Log out" button terminates session and redirects to Home/Login.
- [x] Design matches the screenshot exactly (colors, spacing, icons).

### Technical Acceptance Criteria (Tech AC)
- [x] Use `@/components/ui/dropdown-menu` (Radix UI) for accessibility.
- [x] Use `lucide-react` for the Logout icon.
- [x] Dynamic routing for profile sections (placeholder used for now).
- [x] i18n support for all labels.
- [x] Component is performant with no unnecessary re-renders.

---

## 🔧 Implementation Details

### Phase 1: Preparation (Ideate/Analyze/Architect)
- [x] Define the routing strategy for profile sections.
- [x] Audit the `user` object to ensure `userType` is available.
- [x] Prepare i18n keys in `common.json`.

### Phase 2: Component Implementation (Design/Implement)
- [x] Layout the dropdown structure with headers and separators.
- [x] Style the Identity Header with the avatar and subtitle.
- [x] Implement the navigation links (text-only).
- [x] Add the Logout action with the `LogOut` icon.

### Phase 3: Verification (Test/Document)
- [x] Verify click-away behavior.
- [x] Verify navigation on all links.
- [x] Verify logout clears store and redirects.

---

## 📡 API Reference
N/A (Uses existing `/api/users/me` or auth session).

---

## ✅ Implementation Checklist
- [x] Unit tests cover core logic
- [x] Integration tests verify cross-component flow
- [x] Documentation updated
- [x] Security audit performed (no credentials!)

---

## 📊 Example Scenarios

### Scenario 1: Researcher Navigating to Saved Posts
- **Input**: User (Olivia Rhye, Institutional researcher) clicks avatar.
- **Process**: Dropdown opens. User clicks "Saved posts".
- **Expected Output**: User is navigated to `/profile/saved-posts`.

---

## 🔮 Future Enhancements
- Recent notifications preview inside the dropdown.
- Quick switch account (if applicable).
- Dark mode toggle within dropdown.
