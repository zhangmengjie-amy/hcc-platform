import puppeteer from "puppeteer";

export async function GET(request) {
  const host = request.headers.get("host");
  const baseUrl = `http://${host}`;
  
  // 获取请求路径
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",  // 防止 `/dev/shm` 不足
      "--single-process",  // 某些环境需要
    ],
  });

  try {
    const page = await browser.newPage();
    
    // 构建目标URL
    const targetUrl = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    
    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: 30000, // 30秒超时
    });

    await page.waitForSelector(".echarts-for-react ");

    // 生成PDF
    const fullHeight = await page.evaluate(() => document.body.scrollHeight);
    
    const pdf = await page.pdf({
      width: "210mm",
      height: `${Math.floor(fullHeight * 0.264583)}mm`,
      printBackground: true,
      pageRanges: "1",
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${path.split("/").pop() || "export"}.pdf`,
      },
    });

  } catch (error) {
    console.error("PDF生成失败:", error);
    if (browser) await browser.close();
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}