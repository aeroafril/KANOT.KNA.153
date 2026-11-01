const fs = require('fs');
let sql = fs.readFileSync('src/app/dashboard/components/PtListTab.tsx', 'utf8');
const searchStr = `  const handleSavePt = (e: React.FormEvent) => {
    e.preventDefault();`;

const replaceStr = `  const handleSavePt = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep < 3) {
      handleNextStep();
      return;
    }`;

if (sql.includes(searchStr)) {
  sql = sql.replace(searchStr, replaceStr);
  fs.writeFileSync('src/app/dashboard/components/PtListTab.tsx', sql);
  console.log('Fixed premature form submission');
} else {
  console.log('Anchor not found');
}
