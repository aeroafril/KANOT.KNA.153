const fs = require('fs');
const sql = fs.readFileSync('src/app/dashboard/components/PtListTab.tsx', 'utf8');
const lines = sql.split('\n');
lines.forEach((l, i) => {
  if (l.includes('<button') && !l.includes('type="button"') && !l.includes('type="submit"')) {
    console.log(i + ': ' + l.trim());
  }
});
