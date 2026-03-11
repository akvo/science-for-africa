# Research Finding: Clean Slate ERD Audit (v4)
**Date**: 2026-03-11
**Status**: Finalized
**Subject**: Verification of "Clean Slate" model against Figma and legacy debt removal.

## 1. Overview
In accordance with manager advice to "Developing a data model from scratch" and "compare to the LLD to see if you need to incorporate anything else," this document records the final audit of `architecture.md` (v4).

## 2. Figma Alignment (Source of Truth)
| Module | Figma User Flow Confirmation | Clean Slate Status |
| :--- | :--- | :--- |
| **Institutional Affiliation** | Confirmed in "Collaboration & Community" | **Fully Modeled** |
| **Mentorship Requests** | Confirmed in "Expert Directory" flow | **Fully Modeled** |
| **Resource Library** | Confirmed in "Resource Management" (mid-April | **Simplified & Modeled** |
| **User Roles (6+)** | Confirmed in Access Matrices | **Strictly Aligned** |

## 3. Legacy Debt Removed (from out-of-date LLD)
The following items were found in the previous LLD-merged version but **removed** in v4 because they weren't explicitly supported by the current Figma user flows:
- **`COURSE.certificationAvailable`**: Removed (not in current flow).
- **`OPPORTUNITY.viewCount/clickCount`**: Removed (simplified for MVP).
- **`USER.jobTitle/yearsOfExperience`**: Consolidated into `expertise` and `careerStage`.
- **`FORUM_CATEGORY.media icon`**: Removed (standardized to text/slug).

## 4. Gap Analysis (LLD Comparison)
Comparing the Clean Slate (v4) to the legacy `docs/diagrams/entity-relationship.mmd`:
- **Institutions**: The Clean Slate model correctly upgrades this to a first-class entity with affiliation workflows, which was only a string field in the LLD.
- **Resources**: The LLD had generic placeholders; Clean Slate uses the specific types identified in the Figma Resource Management board.
- **Community**: The hierarchy (Community -> Category -> Thread -> Post) is now strictly matched to the Figma navigation structure.

## 5. Conclusion
The current `agent_docs/architecture.md` (v4) is a true "Clean Slate" representation of the product requirements as they stand today in Figma. All legacy debt from the out-of-date LLD has been pruned.
