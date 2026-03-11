module.exports = {
  async afterCreate(event) {
    const { result, params } = event;
    
    // In a real application, you would send an email or push notification here.
    // For MVP, we simply log the event, demonstrating the hook works.
    strapi.log.info(`[Mentorship] New request created! Mentee ID: ${params.data.mentee} -> Mentor ID: ${params.data.mentor}. Message: "${params.data.message}"`);
  },

  async afterUpdate(event) {
    const { result, params } = event;
    
    // Only trigger if status specifically transitioned
    if (params.data && params.data.status) {
      strapi.log.info(`[Mentorship] Request ${result.documentId} status updated to: ${params.data.status}`);
      
      if (params.data.status === 'Accepted') {
        strapi.log.info(`[Mentorship] Request ${result.documentId} ACCEPTED! Notifying Mentee...`);
      } else if (params.data.status === 'Declined') {
        strapi.log.info(`[Mentorship] Request ${result.documentId} DECLINED. Notifying Mentee...`);
      }
    }
  }
};
