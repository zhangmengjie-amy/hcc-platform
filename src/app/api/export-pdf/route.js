import puppeteer from 'puppeteer';

export async function GET(request) {
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_API_URL;
  
  // 获取请求路径
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // 构建目标URL
    const targetUrl = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    
    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000 // 30秒超时
    });

    await page.waitForSelector('.echarts-for-react ');

    // 生成PDF
    const fullHeight = await page.evaluate(() => document.body.scrollHeight);
    
    const pdf = await page.pdf({
      width: '210mm',
      height: `${Math.floor(fullHeight * 0.264583)}mm`,
      printBackground: true,
      pageRanges: '1'
    }, );

    await browser.close();

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${path.split('/').pop() || 'export'}.pdf`
      }
    });

  } catch (error) {
    console.error('PDF生成失败:', error);
    if (browser) await browser.close();
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}