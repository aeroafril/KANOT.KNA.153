const fs = require('fs');
const sql = fs.readFileSync('src/app/dashboard/components/PtListTab.tsx', 'utf8');
const regex = /<button[^>]*>/g;
let match;
while ((match = regex.exec(sql)) !== null) {
  if (!match[0].includes('type="button"') && !match[0].includes('type="submit"')) {
    const lineNum = sql.substring(0, match.index).split('\n').length;
    if (lineNum > 914 && lineNum < 1805) {
      console.log('Line ' + lineNum + ':', match[0].replace(/\n/g, ' '));
    }
  }
}
