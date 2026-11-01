const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/components/PtListTab.tsx', 'utf8');

// 1. Add interface fields
code = code.replace(
  /shareholdersList\?: Shareholder\[\];/g,
  `shareholdersList?: Shareholder[];
  directorsTenure?: string;
  shareComposition?: string;
  financialYear?: string;`
);

// 2. Add useState
code = code.replace(
  /const \[shareholdersList, setShareholdersList\] = useState<Shareholder\[\]>\(\[\]\);/g,
  `const [shareholdersList, setShareholdersList] = useState<Shareholder[]>([]);
  const [directorsTenure, setDirectorsTenure] = useState("");
  const [shareComposition, setShareComposition] = useState("");
  const [financialYear, setFinancialYear] = useState("");`
);

// 3. Add to newPt object
code = code.replace(
  /shareholdersList\n    };/g,
  `shareholdersList,
      directorsTenure,
      shareComposition,
      financialYear
    };`
);

// 4. Add to ptService.create
code = code.replace(
  /sk_kemenkumham: newPt\.legalization \|\| "-",/g,
  `sk_kemenkumham: newPt.legalization || "-",
      directors_tenure: newPt.directorsTenure || "-",
      share_composition: newPt.shareComposition || "-",
      financial_year: newPt.financialYear || "-",`
);

// 5. Add to Reset States
code = code.replace(
  /setShareholdersList\(\[\]\);/g,
  `setShareholdersList([]);
    setDirectorsTenure("");
    setShareComposition("");
    setFinancialYear("");`
);

// 6. Add UI fields to formStep 2 (Masa Jabatan Direksi & Tahun Buku)
const step2Fields = `
                  {/* Masa Jabatan Direksi */}
                  <div>
                    <label className={styles.formLabel}>Masa Jabatan Direksi</label>
                    <input
                      type="text"
                      placeholder="Contoh: 5 Tahun"
                      className={styles.inputField}
                      value={directorsTenure}
                      onChange={(e) => setDirectorsTenure(e.target.value)}
                    />
                  </div>

                  {/* Tahun Buku */}
                  <div>
                    <label className={styles.formLabel}>Tahun Buku</label>
                    <input
                      type="text"
                      placeholder="Contoh: Januari - Desember"
                      className={styles.inputField}
                      value={financialYear}
                      onChange={(e) => setFinancialYear(e.target.value)}
                    />
                  </div>
`;
code = code.replace(
  /onChange=\{\(e\) => setDescription\(e\.target\.value\)\}\n                    \/>\n                  <\/div>\n                <\/div>/g,
  `onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>${step2Fields}                </div>`
);

// 7. Add Komposisi Saham to formStep 3
const step3Fields = `
                  <div style={{ marginTop: "1rem" }}>
                    <label className={styles.formLabel}>Komposisi Saham</label>
                    <input
                      type="text"
                      placeholder="Keterangan komposisi saham..."
                      className={styles.inputField}
                      value={shareComposition}
                      onChange={(e) => setShareComposition(e.target.value)}
                    />
                  </div>
`;
code = code.replace(
  /<\/button>\n                <\/div>\n              <\/div>\n            \)}/g,
  `</button>
                </div>${step3Fields}              </div>
            )}`
);

fs.writeFileSync('src/app/dashboard/components/PtListTab.tsx', code);
console.log('Patched PtListTab.tsx');
