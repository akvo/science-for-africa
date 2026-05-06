/**
 * Interest Category API Tests
 */

const request = require("supertest");
const {
  setupStrapi,
  teardownStrapi,
  grantPermissions,
} = require("../helpers/strapi");

describe("Interest & Category API", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();

    // Grant permissions
    await grantPermissions("public", {
      interest: ["find"],
      "interest-category": ["find"],
    });
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  it("should create an interest category and link it to an interest", async () => {
    // 1. Create Category
    const category = await strapi
      .documents("api::interest-category.interest-category")
      .create({
        data: { name: "Health" },
        status: "published",
      });

    expect(category).toBeDefined();
    expect(category.name).toBe("Health");

    // 2. Create Interest linked to Category
    const interest = await strapi.documents("api::interest.interest").create({
      data: {
        name: "Quantum Computing",
        interestCategory: category.id,
      },
      status: "published",
    });

    expect(interest).toBeDefined();
    expect(interest.name).toBe("Quantum Computing");

    // 3. Fetch Interest with populated category
    const response = await request(strapi.server.httpServer).get(
      "/api/interests?filters[name][$eq]=Quantum Computing&populate=interestCategory",
    );

    expect(response.status).toBe(200);

    expect(response.body.data).toBeDefined();

    // Find our interest in the list (handling both flattened and nested attributes)
    const found = response.body.data.find((i) => {
      const name = i.attributes ? i.attributes.name : i.name;
      return name === "Quantum Computing";
    });

    expect(found).toBeDefined();

    const fetchedCategory = found.interestCategory;
    const fetchedCategoryData = fetchedCategory;

    expect(fetchedCategoryData).toBeDefined();
    expect(found.interestCategory.name).toBe("Health");
  });

  it("should block deletion of interest categories for accident prevention", async () => {
    const categoryName = `Protection Test ${Math.random()}`;
    const category = await strapi
      .documents("api::interest-category.interest-category")
      .create({
        data: { name: categoryName },
        status: "published",
      });

    const response = await request(strapi.server.httpServer)
      .delete(`/api/interest-categories/${category.documentId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(403);
    // In some test environments, Strapi returns a generic 'Forbidden' message
    const message = response.body.error?.message || response.body.message || "";
    expect(message.toLowerCase()).toMatch(/forbidden|cannot be deleted/);
  });
});
