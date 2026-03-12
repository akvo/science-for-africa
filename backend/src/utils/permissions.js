'use strict';

/**
 * Programmatically synchronize Strapi permissions with Project Roles
 * Based on FIGMA-Aligned Permission Mapping (2026-03-12)
 */
const syncPermissions = async (strapi) => {
  console.log('🛡️ Synchronizing API permissions...');

  const permissionMapping = {
    'Public': [
      'api::resource.resource.find',
      'api::resource.resource.findOne',
      'api::community.community.find',
      'api::community.community.findOne',
      'api::institution.institution.find',
      'api::institution.institution.findOne',
      'api::forum-category.forum-category.find',
      'api::forum-category.forum-category.findOne',
    ],
    'Member': [
      'api::resource.resource.find',
      'api::resource.resource.findOne',
      'api::community.community.find',
      'api::community.community.findOne',
      'api::institution.institution.find',
      'api::institution.institution.findOne',
      'api::forum-category.forum-category.find',
      'api::forum-category.forum-category.findOne',
      'api::thread.thread.find',
      'api::thread.thread.findOne',
      'api::thread.thread.create',
      'api::post.post.find',
      'api::post.post.findOne',
      'api::post.post.create',
      'api::mentorship-request.mentorship-request.create',
    ],
    'Expert': [
      'api::resource.resource.find',
      'api::resource.resource.findOne',
      'api::resource.resource.create',
      'api::community.community.find',
      'api::community.community.findOne',
      'api::institution.institution.find',
      'api::institution.institution.findOne',
      'api::forum-category.forum-category.find',
      'api::forum-category.forum-category.findOne',
      'api::thread.thread.find',
      'api::thread.thread.findOne',
      'api::thread.thread.create',
      'api::post.post.find',
      'api::post.post.findOne',
      'api::post.post.create',
      'api::mentorship-request.mentorship-request.find',
      'api::mentorship-request.mentorship-request.findOne',
      'api::mentorship-request.mentorship-request.create',
    ],
    'Community Admin': [
      'api::community.community.find',
      'api::community.community.findOne',
      'api::community.community.create',
      'api::community.community.update',
      'api::community.community.delete',
      'api::forum-category.forum-category.find',
      'api::forum-category.forum-category.findOne',
      'api::forum-category.forum-category.create',
      'api::forum-category.forum-category.update',
      'api::forum-category.forum-category.delete',
      'api::thread.thread.find',
      'api::thread.thread.findOne',
      'api::thread.thread.create',
      'api::thread.thread.update',
      'api::thread.thread.delete',
      'api::post.post.find',
      'api::post.post.findOne',
      'api::post.post.create',
      'api::post.post.update',
      'api::post.post.delete',
    ]
  };

  // Add 'Individual' which shares Member permissions in this context
  permissionMapping['Individual'] = permissionMapping['Member'];

  // 1. Fetch all roles to get their IDs
  const roles = await strapi.db.query('plugin::users-permissions.role').findMany();

  for (const roleName in permissionMapping) {
    const role = roles.find(r => r.name === roleName);
    if (!role) {
      console.warn(`  ! Role "${roleName}" not found in database, skipping permissions.`);
      continue;
    }

    console.log(`  - Setting permissions for role: ${roleName}`);
    const actions = permissionMapping[roleName];

    for (const action of actions) {
      // Check if permission already exists for this role
      const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: {
          action,
          role: role.id
        }
      });

      if (!existingPermission) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: {
            action,
            role: role.id
          }
        });
      }
    }
  }

  console.log('✅ API permissions synchronized.');
};

module.exports = { syncPermissions };
