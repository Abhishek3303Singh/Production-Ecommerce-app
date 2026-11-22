// scripts/migrateProducts.js
// node scripts/migrateProducts.js           -> dry run
// node scripts/migrateProducts.js --apply   -> writes the changes
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config/config.env') });
const mongoose = require('mongoose');
require('../dataBase/conf');
const Product = require('../dataBase/product/Product');

const APPLY = process.argv.includes('--apply');

const waitForDb = () => new Promise((resolve, reject) => {
  if (mongoose.connection.readyState === 1) return resolve();
  mongoose.connection.once('open', resolve);
  mongoose.connection.once('error', reject);
});

(async () => {
  await waitForDb();
  console.log(APPLY ? 'APPLY mode' : 'DRY RUN (add --apply to write)');

  const steps = [
    { name: 'No reviews but rating shown',
      filter: { reviewsCount: { $in: [0, null] }, 'customerReview.0': { $exists: false }, ratings: { $ne: 0 } },
      update: { $set: { ratings: 0 } } },
    { name: 'Missing variants array', filter: { variants: { $exists: false } }, update: { $set: { variants: [] } } },
    { name: 'Missing attributes',     filter: { attributes: { $exists: false } }, update: { $set: { attributes: {} } } },
  ];

  for (const s of steps) {
    const n = await Product.countDocuments(s.filter);
    console.log(`${s.name}: ${n}`);
    if (APPLY && n) await Product.updateMany(s.filter, s.update);
  }

  // These can't be guessed. Set them in Compass, or in the admin form once it's updated.
  const noType = await Product.find({ $or: [{ productType: { $exists: false } }, { productType: '' }] })
    .select('title category').lean();
  console.log(`\nMissing productType: ${noType.length}`);
  noType.forEach((p) => console.log(`  ${p._id}  [${p.category}]  ${p.title}`));

  console.log('\nCategories in use:', await Product.distinct('category'));
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });