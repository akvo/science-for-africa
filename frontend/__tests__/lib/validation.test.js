import { getPasswordSchema } from "@/lib/validation";

describe("Password Validation Schema", () => {
  const t = (key) => key;
  const passwordSchema = getPasswordSchema(t);

  const getErrorMessage = (pwd) => {
    const result = passwordSchema.safeParse(pwd);
    if (result.success) return null;
    return result.error.issues[0].message;
  };

  it("should fail for passwords shorter than 8 characters", () => {
    expect(getErrorMessage("Short1!")).toBe("validation.password_minLength");
  });

  it("should fail for passwords without an uppercase letter", () => {
    expect(getErrorMessage("lowercase1!")).toBe("validation.password_uppercase");
  });

  it("should fail for passwords without a lowercase letter", () => {
    expect(getErrorMessage("UPPERCASE1!")).toBe("validation.password_lowercase");
  });

  it("should fail for passwords without a number", () => {
    expect(getErrorMessage("NoNumber!")).toBe("validation.password_number");
  });

  it("should fail for passwords without a special character", () => {
    expect(getErrorMessage("NoSpecial1")).toBe("validation.password_special");
  });

  it("should pass for a valid compliant password", () => {
    const result = passwordSchema.safeParse("ValidPass1!");
    expect(result.success).toBe(true);
  });
});
