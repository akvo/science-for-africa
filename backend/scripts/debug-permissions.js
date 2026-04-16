
module.exports = async ({ strapi }) => {
  const roles = await strapi.db.query("plugin::users-permissions.role").findMany({
    populate: ["permissions"],
  });

  for (const role of roles) {
    console.log(`Role: ${role.name} (${role.type})`);
    const permissions = role.permissions.map(p => p.action).sort();
    console.log(`Permissions (${permissions.length}):`);
    permissions.forEach(p => console.log(` - ${p}`));
    console.log('-------------------');
  }
};
