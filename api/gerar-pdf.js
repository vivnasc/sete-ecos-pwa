// api/gerar-pdf.js
// API Route para gerar PDF com Puppeteer no Vercel

import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

// URL do Chromium hospedado (usa o oficial do sparticuz)
const CHROMIUM_URL = 'https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar';

export const config = {
  api: {
    bodyParser: true,
    responseLimit: '10mb',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planoId, baseUrl } = req.body;

  if (!planoId || !baseUrl) {
    return res.status(400).json({ error: 'planoId e baseUrl são obrigatórios' });
  }

  let browser = null;

  try {
    // Configurar Chromium para serverless
    const executablePath = await chromium.executablePath(CHROMIUM_URL);

    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
      defaultViewport: {
        width: 794,  // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      },
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Navegar para a página do plano
    const planoUrl = `${baseUrl}/vitalis/plano-pdf?id=${planoId}`;
    
    await page.goto(planoUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Esperar que o conteúdo carregue
    await page.waitForSelector('#pdf-ready', { timeout: 15000 });

    // Gerar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    // Definir headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Vitalis_Plano.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return res.status(500).json({ 
      error: 'Erro ao gerar PDF', 
      details: error.message 
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
