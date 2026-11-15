const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const bersihkan = (nilai) =>
  String(nilai ?? '')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ')
    .trim();

const formatTanggal = (nilai) => {
  if (!nilai) return '';
  const teks = String(nilai).slice(0, 10);
  const [t, b, h] = teks.split('-');
  return t && b && h ? `${h}-${b}-${t}` : teks;
};

const formatUang = (nilai) => {
  if (nilai === null || nilai === undefined || nilai === '') return '';
  const angka = Number(nilai);
  if (Number.isNaN(angka)) return bersihkan(nilai);
  return angka.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatSel = (kolom, nilai) => {
  if (kolom.tipe === 'tanggal') return formatTanggal(nilai);
  if (kolom.tipe === 'uang') return formatUang(nilai);
  return bersihkan(nilai);
};

const namaSheet = (teks) => bersihkan(teks).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Laporan';

const waktuWib = (tanggal) =>
  tanggal.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false }).replace(/\./g, ':');

class ExportService {
  static async buatExcel(laporan) {
    const wb = new ExcelJS.Workbook();
    wb.creator = laporan.kantor;
    wb.created = new Date();

    const sheet = wb.addWorksheet(namaSheet(laporan.judul), {
      pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
    });

    const kolom = [{ kunci: 'no', judul: 'No', lebar: 5, tipe: 'teks' }, ...laporan.kolom];
    sheet.columns = kolom.map((k) => ({ key: k.kunci, width: k.lebar }));
    const jumlahKolom = kolom.length;

    const tambahJudul = (teks, ukuran, tebal) => {
      const baris = sheet.addRow([bersihkan(teks)]);
      sheet.mergeCells(baris.number, 1, baris.number, jumlahKolom);
      baris.getCell(1).font = { bold: tebal, size: ukuran };
      baris.getCell(1).alignment = { horizontal: 'center' };
    };

    tambahJudul(laporan.kantor, 12, true);
    tambahJudul(laporan.judul, 14, true);
    tambahJudul(`Periode: ${laporan.periode}`, 10, false);
    sheet.addRow([]);

    if (laporan.nihil) {
      const baris = sheet.addRow(['NIHIL - tidak ada akta/data yang dibuat pada periode ini']);
      sheet.mergeCells(baris.number, 1, baris.number, jumlahKolom);
      baris.getCell(1).font = { bold: true, size: 12 };
      baris.getCell(1).alignment = { horizontal: 'center' };
    } else {
      const header = sheet.addRow(kolom.map((k) => k.judul));
      header.eachCell((sel) => {
        sel.font = { bold: true };
        sel.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        sel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } };
        sel.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
      sheet.views = [{ state: 'frozen', ySplit: header.number }];

      laporan.baris.forEach((data, indeks) => {
        const nilaiBaris = kolom.map((k) => {
          if (k.kunci === 'no') return indeks + 1;
          const mentah = data[k.kunci];
          if (mentah === null || mentah === undefined || mentah === '') return null;
          if (k.tipe === 'tanggal') {
            const [t, b, h] = String(mentah).slice(0, 10).split('-').map(Number);
            return new Date(Date.UTC(t, b - 1, h));
          }
          if (k.tipe === 'uang') return Number(mentah);
          return bersihkan(mentah);
        });
        const baris = sheet.addRow(nilaiBaris);
        baris.eachCell({ includeEmpty: true }, (sel, nomorKolom) => {
          const k = kolom[nomorKolom - 1];
          sel.alignment = { vertical: 'top', wrapText: true };
          sel.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (k.tipe === 'tanggal') sel.numFmt = 'dd/mm/yyyy';
          if (k.tipe === 'uang') sel.numFmt = '#,##0.00';
        });
      });
    }

    sheet.addRow([]);
    const ringkas = [
      laporan.nihil ? 'Jumlah data: 0 (NIHIL)' : `Jumlah data: ${laporan.baris.length}`,
      laporan.status ? `Status verifikasi: ${laporan.status}` : null,
      `Dicetak oleh: ${bersihkan(laporan.dibuatOleh)} pada ${waktuWib(laporan.dibuatPada)} WIB`
    ].filter(Boolean);
    for (const teks of ringkas) {
      const baris = sheet.addRow([teks]);
      baris.getCell(1).font = { italic: true, size: 9 };
    }

    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  static buatPdf(laporan) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 36,
        bufferPages: true,
        info: { Title: bersihkan(laporan.judul), Author: bersihkan(laporan.kantor) }
      });

      const potongan = [];
      doc.on('data', (d) => potongan.push(d));
      doc.on('end', () => resolve(Buffer.concat(potongan)));
      doc.on('error', reject);

      const kiri = doc.page.margins.left;
      const lebarHalaman = doc.page.width - kiri - doc.page.margins.right;
      const batasBawah = () => doc.page.height - doc.page.margins.bottom - 24;

      doc.font('Helvetica-Bold').fontSize(12).text(bersihkan(laporan.kantor), { align: 'center' });
      doc.fontSize(14).text(bersihkan(laporan.judul), { align: 'center' });
      doc.font('Helvetica').fontSize(10).text(`Periode: ${laporan.periode}`, { align: 'center' });
      doc.moveDown(0.8);

      if (laporan.nihil) {
        doc.font('Helvetica-Bold').fontSize(16).text('NIHIL', { align: 'center' });
        doc.font('Helvetica').fontSize(10).text('Tidak ada akta/data yang dibuat pada periode ini.', { align: 'center' });
      } else {
        const kolom = [{ kunci: 'no', judul: 'No', lebar: 4, tipe: 'teks' }, ...laporan.kolom];
        const totalBobot = kolom.reduce((jumlah, k) => jumlah + k.lebar, 0);
        const lebarKolom = kolom.map((k) => (lebarHalaman * k.lebar) / totalBobot);
        const padding = 3;
        let y = doc.y;

        const gambarBaris = (sel, tebal, isiLatar) => {
          doc.font(tebal ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
          const tinggi =
            Math.max(
              ...sel.map((teks, i) =>
                doc.heightOfString(teks || ' ', { width: lebarKolom[i] - padding * 2 })
              )
            ) +
            padding * 2;

          if (y + tinggi > batasBawah()) {
            doc.addPage();
            y = doc.page.margins.top;
            if (!tebal) {
              gambarBaris(kolom.map((k) => k.judul), true, true);
            }
          }

          let x = kiri;
          sel.forEach((teks, i) => {
            if (isiLatar) {
              doc.rect(x, y, lebarKolom[i], tinggi).fillAndStroke('#E8E8E8', '#888888');
            } else {
              doc.rect(x, y, lebarKolom[i], tinggi).stroke('#888888');
            }
            doc
              .fillColor('#000000')
              .font(tebal ? 'Helvetica-Bold' : 'Helvetica')
              .fontSize(8)
              .text(teks || '', x + padding, y + padding, { width: lebarKolom[i] - padding * 2 });
            x += lebarKolom[i];
          });
          y += tinggi;
        };

        gambarBaris(kolom.map((k) => k.judul), true, true);
        laporan.baris.forEach((data, indeks) => {
          gambarBaris(
            kolom.map((k) => (k.kunci === 'no' ? String(indeks + 1) : formatSel(k, data[k.kunci]))),
            false,
            false
          );
        });

        doc.y = y + 10;
        doc.x = kiri;
      }

      doc.font('Helvetica').fontSize(9).fillColor('#000000');
      const ringkas = laporan.nihil ? 'Jumlah data: 0 (NIHIL)' : `Jumlah data: ${laporan.baris.length}`;
      if (doc.y + 30 > batasBawah()) {
        doc.addPage();
      }
      doc.text(ringkas, kiri, doc.y + (laporan.nihil ? 12 : 0), { width: lebarHalaman });
      if (laporan.status) {
        doc.text(`Status verifikasi: ${laporan.status}`, kiri, doc.y, { width: lebarHalaman });
      }

      const rentang = doc.bufferedPageRange();
      for (let i = 0; i < rentang.count; i++) {
        doc.switchToPage(rentang.start + i);
        const marginBawah = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc.font('Helvetica').fontSize(8).fillColor('#555555');
        doc.text(
          `Dicetak oleh ${bersihkan(laporan.dibuatOleh)} pada ${waktuWib(laporan.dibuatPada)} WIB`,
          kiri,
          doc.page.height - 28,
          { width: lebarHalaman / 2, lineBreak: false }
        );
        doc.text(`Halaman ${i + 1} dari ${rentang.count}`, kiri + lebarHalaman / 2, doc.page.height - 28, {
          width: lebarHalaman / 2,
          align: 'right',
          lineBreak: false
        });
        doc.page.margins.bottom = marginBawah;
      }

      doc.end();
    });
  }
}

module.exports = ExportService;