const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/components/PtListTab.tsx', 'utf8');

// Insert Masa Jabatan Direksi and Tahun Buku after Keterangan in the Detail Modal
const extraModalInfo = `
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Masa Jabatan Direksi</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.directorsTenure || "-"}</strong>
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Tahun Buku</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.financialYear || "-"}</strong>
                        </div>
`;

code = code.replace(
  /<strong style=\{\{ fontSize: "0\.95rem", color: "#0f172a" \}\}>\{selectedPtDetail\.description\}<\/strong>\n                        <\/div>/g,
  `<strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{selectedPtDetail.description}</strong>
                        </div>${extraModalInfo}`
);

// Insert Komposisi Saham in Struktur Permodalan
const extraModalCapitalInfo = `
                        <div style={{ marginTop: "0.5rem" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Komposisi Saham</span>
                          <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                            {selectedPtDetail.shareComposition || "-"}
                          </strong>
                        </div>
`;

code = code.replace(
  /<strong style=\{\{ fontSize: "0\.95rem", color: "#0f172a" \}\}>\n                            Rp \{selectedPtDetail\.nominalValue \? selectedPtDetail\.nominalValue\.toLocaleString\("id-ID"\) : "0"\}\n                          <\/strong>\n                        <\/div>/g,
  `<strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                            Rp {selectedPtDetail.nominalValue ? selectedPtDetail.nominalValue.toLocaleString("id-ID") : "0"}
                          </strong>
                        </div>${extraModalCapitalInfo}`
);

fs.writeFileSync('src/app/dashboard/components/PtListTab.tsx', code);
console.log('Patched Detail Modal in PtListTab.tsx');
