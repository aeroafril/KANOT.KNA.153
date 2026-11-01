const fs = require('fs');
let sql = fs.readFileSync('src/app/dashboard/components/PtListTab.tsx', 'utf8');
const searchStr = '{/* Pemegang Saham */}';
if (sql.includes(searchStr)) {
  const insertStr = `
                {/* Komposisi Saham */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className={styles.formLabel}>Komposisi Saham</label>
                  <input
                    type="text"
                    placeholder="Keterangan komposisi saham (misal: A: 50%, B: 50%)..."
                    className={styles.inputField}
                    value={shareComposition}
                    onChange={(e) => setShareComposition(e.target.value)}
                  />
                </div>
`;
  sql = sql.replace(searchStr, insertStr + '\n                ' + searchStr);
  fs.writeFileSync('src/app/dashboard/components/PtListTab.tsx', sql);
  console.log('Successfully injected Komposisi Saham');
} else {
  console.log('Could not find anchor');
}
