const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/components/PtListTab.tsx', 'utf8');

// 1. Add temporary state for new shareholder
code = code.replace(
  /const \[shareholdersList, setShareholdersList\] = useState<Shareholder\[\]>\(\[\]\);/g,
  `const [shareholdersList, setShareholdersList] = useState<Shareholder[]>([]);
  const [newShName, setNewShName] = useState("");
  const [newShNik, setNewShNik] = useState("");
  const [newShShares, setNewShShares] = useState(0);
  const [newShPosition, setNewShPosition] = useState("Pemegang Saham");`
);

// 2. Add handlers
const handlers = `
  const handleAddShareholder = () => {
    if (!newShName.trim()) {
      alert("Nama pemegang saham wajib diisi!");
      return;
    }
    if (newShShares <= 0) {
      alert("Jumlah lembar saham harus lebih dari 0!");
      return;
    }
    
    setShareholdersList([...shareholdersList, {
      name: newShName,
      nik: newShNik,
      sharesCount: newShShares,
      position: newShPosition
    }]);
    
    setNewShName("");
    setNewShNik("");
    setNewShShares(0);
    setNewShPosition("Pemegang Saham");
  };

  const handleRemoveShareholder = (index: number) => {
    const newList = [...shareholdersList];
    newList.splice(index, 1);
    setShareholdersList(newList);
  };
`;
code = code.replace(
  /const handleNextStep = \(\) => \{/g,
  `${handlers}\n  const handleNextStep = () => {`
);

// 3. Add UI inside formStep === 3, just above the submit buttons
const shareholderUI = `
                <div style={{ marginTop: "2rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155", marginBottom: "1rem" }}>Daftar Pemegang Saham</h4>
                  
                  {shareholdersList.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                            <th style={{ padding: "0.5rem", borderBottom: "1px solid #cbd5e1" }}>Nama</th>
                            <th style={{ padding: "0.5rem", borderBottom: "1px solid #cbd5e1" }}>NIK</th>
                            <th style={{ padding: "0.5rem", borderBottom: "1px solid #cbd5e1" }}>Jabatan</th>
                            <th style={{ padding: "0.5rem", borderBottom: "1px solid #cbd5e1" }}>Lembar Saham</th>
                            <th style={{ padding: "0.5rem", borderBottom: "1px solid #cbd5e1" }}>Nilai (Rp)</th>
                            <th style={{ padding: "0.5rem", borderBottom: "1px solid #cbd5e1", textAlign: "center" }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shareholdersList.map((sh, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "0.5rem" }}>{sh.name}</td>
                              <td style={{ padding: "0.5rem" }}>{sh.nik}</td>
                              <td style={{ padding: "0.5rem" }}>{sh.position}</td>
                              <td style={{ padding: "0.5rem" }}>{sh.sharesCount.toLocaleString("id-ID")}</td>
                              <td style={{ padding: "0.5rem" }}>{(sh.sharesCount * nominalValue).toLocaleString("id-ID")}</td>
                              <td style={{ padding: "0.5rem", textAlign: "center" }}>
                                <button type="button" onClick={() => handleRemoveShareholder(idx)} style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}>Hapus</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ fontWeight: "700", backgroundColor: "#f8fafc" }}>
                            <td colSpan={3} style={{ padding: "0.5rem", textAlign: "right" }}>Total:</td>
                            <td style={{ padding: "0.5rem", color: totalSharesAllocated === totalShares ? "inherit" : "red" }}>
                              {totalSharesAllocated.toLocaleString("id-ID")} / {totalShares.toLocaleString("id-ID")}
                            </td>
                            <td colSpan={2} style={{ padding: "0.5rem", color: totalValueAllocated === modalDisetor ? "inherit" : "red" }}>
                              Rp {totalValueAllocated.toLocaleString("id-ID")} / Rp {modalDisetor.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                    <h5 style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#475569" }}>Tambah Pemegang Saham Baru</h5>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                      <div style={{ flex: "1 1 200px" }}>
                        <label className={styles.formLabel}>Nama Lengkap</label>
                        <input type="text" className={styles.inputField} value={newShName} onChange={e => setNewShName(e.target.value)} placeholder="Nama pemegang saham..." />
                      </div>
                      <div style={{ flex: "1 1 150px" }}>
                        <label className={styles.formLabel}>NIK</label>
                        <input type="text" className={styles.inputField} value={newShNik} onChange={e => setNewShNik(e.target.value)} placeholder="NIK..." />
                      </div>
                      <div style={{ flex: "1 1 150px" }}>
                        <label className={styles.formLabel}>Jabatan</label>
                        <input type="text" className={styles.inputField} value={newShPosition} onChange={e => setNewShPosition(e.target.value)} placeholder="Pemegang Saham / Direktur..." />
                      </div>
                      <div style={{ flex: "1 1 120px" }}>
                        <label className={styles.formLabel}>Jml Lembar Saham</label>
                        <input type="number" className={styles.inputField} value={newShShares || ""} onChange={e => setNewShShares(parseInt(e.target.value, 10) || 0)} placeholder="0" />
                      </div>
                      <div style={{ flex: "0 0 auto" }}>
                        <button type="button" onClick={handleAddShareholder} style={{ padding: "0.6rem 1rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "0.375rem", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}>
                          + Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
`;

code = code.replace(
  /onChange=\{\(e\) => setShareComposition\(e.target.value\)\}\n                    \/>\n                  <\/div>\n              <\/div>\n            \)}/g,
  `onChange={(e) => setShareComposition(e.target.value)}
                    />
                  </div>
${shareholderUI}
              </div>
            )}`
);

fs.writeFileSync('src/app/dashboard/components/PtListTab.tsx', code);
console.log('Shareholder UI Patched');
