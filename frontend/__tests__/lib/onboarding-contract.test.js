import { transformProfileUpdatePayload } from "@/lib/strapi";

describe("Onboarding Contract Transformation (Smart Client)", () => {
  it("should transform individual user data correctly", () => {
    const rawData = {
      userType: "individual",
      roleType: "Researcher",
      firstName: "John",
      lastName: "Doe",
      interests: ["Science", "Medical"],
      educationLevel: "Doctorate (PhD)",
      educationInstitution: { id: 1, name: "University of Nairobi" },
      orcidId: "0000-0001-2345-6789",
      affiliationInstitution: { id: null, name: "SFA" },
      onboardingComplete: true,
    };

    const payload = transformProfileUpdatePayload(rawData);

    // Should preserve individual fields
    expect(payload.userType).toBe("individual");
    expect(payload.educationLevel).toBe("Doctorate (PhD)");
    expect(payload.highestEducationInstitution).toEqual({
      id: 1,
      name: "University of Nairobi",
    });
    expect(payload.orcidId).toBe("0000-0001-2345-6789");

    // Should map interests to components
    expect(payload.interests[0]).toEqual({ name: "Science" });

    // Should preserve affiliation object
    expect(payload.affiliationInstitution).toEqual({ id: null, name: "SFA" });
  });

  it("should strip individual-specific fields for institutional accounts", () => {
    const rawData = {
      userType: "institution",
      roleType: "Organization",
      institutionName: "African Research Foundation",
      interests: ["Funding"],
      educationLevel: "", // Empty from store
      orcidId: "", // Empty from store
      position: "", // Empty from store
      onboardingComplete: true,
    };

    const payload = transformProfileUpdatePayload(rawData);

    // Should preserve institutional fields
    expect(payload.userType).toBe("institution");
    expect(payload.institutionName).toBe("African Research Foundation");

    // CRITICAL: Should STRIP fields that cause 500 errors in backend
    expect(payload.educationLevel).toBeUndefined();
    expect(payload.orcidId).toBeUndefined();
    expect(payload.position).toBeUndefined();
    expect(payload.highestEducationInstitution).toBeUndefined();
  });

  it("should strip ANY empty string field to prevent enumeration validation failure", () => {
    const rawData = {
      userType: "individual",
      firstName: "Jane",
      educationLevel: "Master's Degree",
      biography: "", // Empty string
      orcidId: "0000-0000-0000-0000",
    };

    const payload = transformProfileUpdatePayload(rawData);

    expect(payload.biography).toBeUndefined();
    expect(payload.educationLevel).toBe("Master's Degree");
  });

  it("should map institution relation ID if provided", () => {
    const rawData = {
      affiliationInstitution: { id: 42, name: "Existing Univ" },
    };

    const payload = transformProfileUpdatePayload(rawData);

    expect(payload.affiliationInstitution.id).toBe(42);
  });
});
