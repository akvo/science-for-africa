"use strict";

async function buildLabel(event) {
  const { data, where } = event.params;

  // On create, relations are IDs; on update we may need to look up existing
  let userId = data?.user;
  let communityId = data?.community;

  // If updating and relations aren't in the payload, fetch existing
  if (where?.id && (!userId || !communityId)) {
    const existing = await strapi.db
      .query("api::community-membership.community-membership")
      .findOne({ where: { id: where.id }, populate: ["user", "community"] });
    if (!userId) userId = existing?.user;
    if (!communityId) communityId = existing?.community;
  }

  const user =
    typeof userId === "object"
      ? userId
      : userId
        ? await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({ where: { id: userId }, select: ["username", "email"] })
        : null;

  const community =
    typeof communityId === "object"
      ? communityId
      : communityId
        ? await strapi.db
            .query("api::community.community")
            .findOne({ where: { id: communityId }, select: ["name"] })
        : null;

  const userName = user?.username || user?.email || "?";
  const communityName = community?.name || "?";

  event.params.data = event.params.data || {};
  event.params.data.label = `${userName} — ${communityName}`;
}

module.exports = {
  beforeCreate: buildLabel,
  beforeUpdate: buildLabel,
};
