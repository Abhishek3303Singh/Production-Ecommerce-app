const cron = require('node-cron');
const { syncAnalyticsToDB } = require('../routeResponse/bannerResponse');

// Run every hour
cron.schedule('0 * * * *', async () => {
  // console.log('[CRON] Syncing banner analytics...');
  
  try {
    // Mock req/res for the function
    const req = {};
    const res = {
      json: (data) => console.log('[CRON] Synced:', data),
      status: () => ({ json: (err) => console.error('[CRON] Error:', err) })
    };
    
    await syncAnalyticsToDB(req, res);
  } catch (err) {
    console.error('[CRON] Failed:', err);
  }
});

console.log('[CRON] Analytics sync scheduled every hour');