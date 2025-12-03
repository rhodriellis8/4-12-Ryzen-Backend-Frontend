import puppeteer, { type PDFOptions } from 'puppeteer';

const defaultPdfOptions: PDFOptions = {
  format: 'A4',
  margin: {
    top: '20mm',
    bottom: '20mm',
    left: '15mm',
    right: '15mm',
  },
  printBackground: true,
};

export const renderHtmlToPdf = async (html: string, options: PDFOptions = {}): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ ...defaultPdfOptions, ...options });
    await page.close();
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

