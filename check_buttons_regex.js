const fs = require('fs');
const sql = fs.readFileSync('src/app/dashboard/components/PtListTab.tsx', 'utf8');
const regex = /<button[^>]*>/g;
let match;
while ((match = regex.exec(sql)) !== null) {
  if (!match[0].includes('type="button"') && !match[0].includes('type="submit"')) {
    console.log('Found button without type:', match[0].replace(/\n/g, ' '));
  }
}
