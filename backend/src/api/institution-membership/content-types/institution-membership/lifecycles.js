"use strict";

async function buildLabel(event) {
  const { data, where } = event.params;

  let userId = data?.user;
  let institutionId = data?.institution;

  if (where?.id && (!userId || !institutionId)) {
    const existing = await strapi.db
      .query("api::institution-membership.institution-membership")
      .findOne({
        where: { id: where.id },
        populate: ["user", "institution"],
      });
    if (!userId) userId = existing?.user;
    if (!institutionId) institutionId = existing?.institution;
  }

  const user =
    typeof userId === "object"
      ? userId
      : userId
        ? await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({ where: { id: userId }, select: ["username", "email"] })
        : null;

  const institution =
    typeof institutionId === "object"
      ? institutionId
      : institutionId
        ? await strapi.db
            .query("api::institution.institution")
            .findOne({ where: { id: institutionId }, select: ["name"] })
        : null;

  const userName = user?.username || user?.email || "?";
  const institutionName = institution?.name || "?";

  event.params.data = event.params.data || {};
  event.params.data.label = `${userName} — ${institutionName}`;
}

module.exports = {
  beforeCreate: buildLabel,
  beforeUpdate: buildLabel,
};
