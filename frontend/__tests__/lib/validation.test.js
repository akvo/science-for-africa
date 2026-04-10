import { passwordSchema } from "@/lib/validation";

describe("Password Validation Schema", () => {
  const getErrorMessage = (pwd) => {
    const result = passwordSchema.safeParse(pwd);
    if (result.success) return null;
    return result.error.issues[0].message;
  };

  it("should fail for passwords shorter than 8 characters", () => {
    expect(getErrorMessage("Short1!")).toContain("8 characters");
  });

  it("should fail for passwords without an uppercase letter", () => {
    expect(getErrorMessage("lowercase1!")).toContain("uppercase letter");
  });

  it("should fail for passwords without a lowercase letter", () => {
    expect(getErrorMessage("UPPERCASE1!")).toContain("lowercase letter");
  });

  it("should fail for passwords without a number", () => {
    expect(getErrorMessage("NoNumber!")).toContain("number");
  });

  it("should fail for passwords without a special character", () => {
    expect(getErrorMessage("NoSpecial1")).toContain("special character");
  });

  it("should pass for a valid compliant password", () => {
    const result = passwordSchema.safeParse("ValidPass1!");
    expect(result.success).toBe(true);
  });
});
