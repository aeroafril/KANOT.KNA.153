const fs = require('fs');
let sql = fs.readFileSync('src/app/dashboard/components/PtListTab.tsx', 'utf8');
const startStr = '<div style={{ marginTop: "2rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>';
const endStr = '</div>\n              </div>\n            )}';

const startIdx = sql.indexOf(startStr);
const endIdx = sql.indexOf(endStr, startIdx);

if(startIdx !== -1 && endIdx !== -1) {
  sql = sql.substring(0, startIdx) + '              </div>\n            )}' + sql.substring(endIdx + endStr.length);
  fs.writeFileSync('src/app/dashboard/components/PtListTab.tsx', sql);
  console.log('Cleaned up duplicate UI');
} else {
  console.log('Not found');
}
