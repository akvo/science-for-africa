'use strict';

const strapi = require('@strapi/strapi');

async function verify() {
  const instance = await strapi
    .createStrapi({
      appDir: process.cwd(),
    })
    .load();
  
  try {
    const store = instance.store({
      type: 'plugin',
      name: 'content_manager',
      key: 'configuration_content_types::plugin::users-permissions.user',
    });

    const config = await store.get();

    if (config && config.layouts && config.layouts.list) {
      console.log('Current User List Layout:', config.layouts.list);
      const hasRole = config.layouts.list.includes('role');
      const hasInstitution = config.layouts.list.includes('institution');

      if (hasRole && hasInstitution) {
        console.log('SUCCESS: "role" and "institution" columns are present.');
      } else {
        console.log('FAILURE: Missing expected columns.');
        process.exit(1);
      }
    } else {
      console.log('FAILURE: Could not retrieve configuration.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  } finally {
    await instance.destroy();
  }
}

verify();
