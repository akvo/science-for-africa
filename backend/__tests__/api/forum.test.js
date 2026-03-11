/**
 * Forum API Tests (US-006-B)
 * 
 * Verifies the hierarchical structure of Communities, Categories, Threads, and Posts.
 */

const { setupStrapi, teardownStrapi, getStrapi } = require("../helpers/strapi");
const request = require("supertest");

describe("Forum System (US-006-B)", () => {
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await teardownStrapi();
  });

  beforeEach(async () => {
    // Cleanup to avoid uniqueness violations
    await strapi.db.query("api::community.community").deleteMany({});
    await strapi.db.query("api::forum-category.forum-category").deleteMany({});
    await strapi.db.query("plugin::users-permissions.user").deleteMany({});
  });

  describe("Phase 1: Communities & Categories", () => {
    it("should create a Community and a nested Forum Category", async () => {
      // 1. Create Community
      const community = await strapi.documents("api::community.community").create({
        data: {
          name: "Open Science",
          description: "General discussions about open science in Africa.",
          isPrivate: false,
        },
        status: 'published',
      });

      expect(community.name).toBe("Open Science");

      // 2. Create Parent Category
      const parentCategory = await strapi.documents("api::forum-category.forum-category").create({
        data: {
          name: "Geospatial Data",
          description: "Mapping and GIS research.",
          community: community.documentId,
        },
        status: 'published',
      });

      // 3. Create Nested Child Category
      const childCategory = await strapi.documents("api::forum-category.forum-category").create({
        data: {
          name: "Remote Sensing",
          description: "Satellite imagery analysis.",
          community: community.documentId,
          parentCategory: parentCategory.documentId,
        },
        status: 'published',
      });

      const fetchedChild = await strapi.documents("api::forum-category.forum-category").findOne({
        documentId: childCategory.documentId,
        populate: ["parentCategory", "community"],
      });

      // console.log("Fetched Child:", JSON.stringify(fetchedChild, null, 2));

      expect(fetchedChild.name).toBe("Remote Sensing");
      expect(fetchedChild.parentCategory).not.toBeNull();
      expect(fetchedChild.parentCategory.documentId).toBe(parentCategory.documentId);
      expect(fetchedChild.community.documentId).toBe(community.documentId);
    });
  });

  describe("Phase 2: Threads & Posts", () => {
    let community;
    let category;
    let user;

    beforeEach(async () => {
      // Setup minimal state for phase 2
      community = await strapi.documents("api::community.community").create({
        data: { name: "Phase 2 Community" },
        status: 'published',
      });
      category = await strapi.documents("api::forum-category.forum-category").create({
        data: { name: "Phase 2 Category", community: community.documentId },
        status: 'published',
      });
      user = await strapi.documents("plugin::users-permissions.user").create({
        data: { username: "forumuser", email: "forum@example.com", password: "Password123" },
        status: 'published',
      });
    });

    it("should create a thread with an author in a category", async () => {
      const thread = await strapi.documents("api::thread.thread").create({
        data: {
          title: "First Thread",
          forumCategory: category.documentId,
          author: user.documentId,
        },
        status: 'published',
      });

      const fetchedThread = await strapi.documents("api::thread.thread").findOne({
        documentId: thread.documentId,
        populate: ["author", "forumCategory"],
      });

      expect(fetchedThread.title).toBe("First Thread");
      expect(fetchedThread.author.documentId).toBe(user.documentId);
      expect(fetchedThread.forumCategory.documentId).toBe(category.documentId);
    });

    it("should create a post in a thread", async () => {
      const thread = await strapi.documents("api::thread.thread").create({
        data: { title: "Post Test Thread", author: user.documentId, forumCategory: category.documentId },
        status: 'published',
      });

      const post = await strapi.documents("api::post.post").create({
        data: {
          content: "This is a post content.",
          author: user.documentId,
          thread: thread.documentId,
        },
        status: 'published',
      });

      const fetchedPost = await strapi.documents("api::post.post").findOne({
        documentId: post.documentId,
        populate: ["author", "thread"],
      });

      expect(fetchedPost.content).toBe("This is a post content.");
      expect(fetchedPost.thread.documentId).toBe(thread.documentId);
    });
  });

  describe("Phase 3: Recursive Threading & Followers", () => {
    let thread;
    let user1, user2;

    beforeEach(async () => {
      const community = await strapi.documents("api::community.community").create({
        data: { name: "Phase 3 Community" },
        status: 'published',
      });
      const category = await strapi.documents("api::forum-category.forum-category").create({
        data: { name: "Phase 3 Category", community: community.documentId },
        status: 'published',
      });
      user1 = await strapi.documents("plugin::users-permissions.user").create({
        data: { username: "user1", email: "user1@example.com", password: "Password123" },
        status: 'published',
      });
      user2 = await strapi.documents("plugin::users-permissions.user").create({
        data: { username: "user2", email: "user2@example.com", password: "Password123" },
        status: 'published',
      });
      thread = await strapi.documents("api::thread.thread").create({
        data: { title: "Phase 3 Thread", author: user1.documentId, forumCategory: category.documentId },
        status: 'published',
      });
    });

    it("should support nested replies (recursive posts)", async () => {
      // 1. Initial Post
      const post1 = await strapi.documents("api::post.post").create({
        data: { content: "Original Post", author: user1.documentId, thread: thread.documentId },
        status: 'published',
      });

      // 2. Reply to Post 1
      const post2 = await strapi.documents("api::post.post").create({
        data: {
          content: "First Reply",
          author: user2.documentId,
          thread: thread.documentId,
          parentPost: post1.documentId,
        },
        status: 'published',
      });

      // 3. Nested Reply to Post 2
      const post3 = await strapi.documents("api::post.post").create({
        data: {
          content: "Recursive Reply",
          author: user1.documentId,
          thread: thread.documentId,
          parentPost: post2.documentId,
        },
        status: 'published',
      });

      const fetchedPost3 = await strapi.documents("api::post.post").findOne({
        documentId: post3.documentId,
        populate: {
          parentPost: {
            populate: ["parentPost"]
          }
        },
      });

      expect(fetchedPost3.content).toBe("Recursive Reply");
      expect(fetchedPost3.parentPost.documentId).toBe(post2.documentId);
      expect(fetchedPost3.parentPost.parentPost.documentId).toBe(post1.documentId);
    });

    it("should allow users to follow threads", async () => {
      await strapi.documents("api::thread.thread").update({
        documentId: thread.documentId,
        data: {
          followers: [user1.documentId, user2.documentId],
        },
      });

      const fetchedThread = await strapi.documents("api::thread.thread").findOne({
        documentId: thread.documentId,
        populate: ["followers"],
      });

      expect(fetchedThread.followers).toHaveLength(2);
      expect(fetchedThread.followers.map(f => f.documentId)).toContain(user1.documentId);
      expect(fetchedThread.followers.map(f => f.documentId)).toContain(user2.documentId);
    });
  });
});
