import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// API endpoint for AI-powered Teacher Needs & Policy Analysis
app.post('/api/ai-analysis', async (req, res) => {
  try {
    const { school, items, teachers, summary } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di lingkungan server.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const deficitItems = (items || []).filter(
      (item: any) => item.total < item.abk
    );
    const surplusItems = (items || []).filter(
      (item: any) => item.total > item.abk
    );

    // Calculate near-retirement teachers (BUP 60 years in Indonesia)
    const currentYear = parseInt(school?.year, 10) || 2026;
    const retiringSoon = (teachers || [])
      .map((t: any) => {
        const cleanNip = (t.nip || '').replace(/\D/g, '');
        if (cleanNip.length >= 4) {
          const birthYear = parseInt(cleanNip.substring(0, 4), 10);
          const retYear = birthYear + 60;
          const diff = retYear - currentYear;
          return { ...t, birthYear, retYear, diff };
        }
        return null;
      })
      .filter((t: any) => t && t.diff <= 5)
      .sort((a: any, b: any) => a.diff - b.diff);

    const prompt = `Anda adalah seorang Analis Kepegawaian dan Perencanaan Kebutuhan Tenaga Pendidik senior pada Dinas Pendidikan dan BKN (Badan Kepegawaian Negara).
Analisa data Peta Jabatan Guru dan Data Nominatif Guru (By Name By NIP) berikut ini secara komprehensif, real-time, akurat, dan susun rekomendasi kebijakan resmi:

IDENTITAS SATUAN PENDIDIKAN:
- Nama Sekolah: ${school?.name || 'Sekolah'}
- Jenjang: ${school?.level || 'SMK'}
- Tahun Analisis: ${school?.year || '2026'}
- Lokasi: ${school?.location || 'Kepulauan Bangka Belitung'}

REKAPITULASI DATA:
- Total Kebutuhan ABK (Analisis Beban Kerja): ${summary?.totalAbk || 0} guru
- Total Guru Eksisting Riil: ${summary?.totalExisting || 0} guru
- Jumlah PNS: ${summary?.totalPns || 0}
- Jumlah PPPK: ${summary?.totalPppk || 0}
- Jumlah GTT (Honorer): ${summary?.totalGtt || 0}
- Total Defisit (Kekurangan Guru): ${summary?.totalDeficit || 0} guru
- Total Surplus: ${summary?.totalSurplus || 0} guru

DAFTAR MAPEL DEFISIT (KURANG GURU):
${deficitItems
  .map(
    (i: any) =>
      `- ${i.level} - ${i.subject}: Kebutuhan ABK ${i.abk}, Eksisting ${i.total} (PNS ${i.pns}, PPPK ${i.pppk}, GTT ${i.gtt}) -> Kurang ${i.abk - i.total}`
  )
  .join('\n') || 'Tidak ada defisit'}

DAFTAR MAPEL SURPLUS (LEBIH GURU):
${surplusItems
  .map(
    (i: any) =>
      `- ${i.level} - ${i.subject}: Kebutuhan ABK ${i.abk}, Eksisting ${i.total} -> Lebih ${i.total - i.abk}`
  )
  .join('\n') || 'Tidak ada surplus'}

DATA GURU MENDEKATI BATAS USIA PENSIUN (BUP 60 TAHUN DALAM 1-5 TAHUN KE DEPAN):
${retiringSoon
  .map(
    (t: any) =>
      `- ${t.name} (NIP: ${t.nip}, ${t.status}) - ${t.subject} (${t.functionalTitle}) -> Pensiun ${t.retYear} (${t.diff} tahun lagi)`
  )
  .join('\n') || 'Tidak ada guru yang mendekati pensiun dalam 5 tahun.'}

Tolong susun laporan telaah staf dan analisis kebutuhan guru dalam Bahasa Indonesia formal kedinasan dengan struktur:
1. EXECUTIVE SUMMARY: Gambaran umum pemenuhan formasi guru di sekolah ini berdasarkan data nominatif 40 guru dan ABK 42 formasi.
2. ANALISIS KEKURANGAN & RISIKO PEMBELAJARAN: Pembahasan mendalam tentang mata pelajaran yang defisit (misal Bahasa Inggris Ahli Pertama yang kosong dan Bimbingan Konseling Ahli Muda) dan dampaknya terhadap sekolah.
3. ANALISIS SUKSESI & PROYEKSI PENSIUN GURU: Evaluasi guru yang akan pensiun (seperti Basri tahun 2027, Lismasari tahun 2028, Syamsiah tahun 2030) dan langkah antisipasi kekosongan guru.
4. STRUKTUR KOMPOSISI KEPEGAWAIAN: Evaluasi rasio PNS (${summary?.totalPns || 0}) vs PPPK (${summary?.totalPppk || 0}) serta jenjang jabatan fungsional.
5. REKOMENDASI KEBIJAKAN STRATEGIS:
   - Prioritas usulan formasi CASN / PPPK untuk Dinas Pendidikan & BKN
   - Penataan beban mengajar minimum 24 jam tatap muka per minggu
6. KESIMPULAN & LANGKAH TINDAK LANJUT.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      analysis: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('AI Analysis error:', error);
    res.status(500).json({
      error: error.message || 'Terjadi kesalahan saat memproses analisis AI.',
    });
  }
});

// Setup Vite development server or serve static build files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Peta Jabatan berjalan di http://localhost:${PORT}`);
  });
}

startServer();
