import puppeteer from "puppeteer";

export async function POST(request) {
  let browser;

  try {
    const { html, css, options } = await request.json();

    if (!html) {
      return new Response(JSON.stringify({ error: "缺少HTML内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 启动浏览器
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-features=TranslateUI",
      ],
    });

    const page = await browser.newPage();

    // 设置页面内容
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${css || ""}
            
            /* 确保body根据内容自动调整大小 */
            body {
              margin: 0 !important;
              padding: 0 !important;
              display: inline-block !important;
              background: white !important;
            }
            
            /* 打印优化 */
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    await page.setContent(fullHtml, {
      waitUntil: ["networkidle0", "load"],
      timeout: 30000,
    });

    // 等待资源加载
    await page.evaluate(async () => {
      const promises = [];

      // 等待字体
      if (document.fonts && document.fonts.ready) {
        promises.push(document.fonts.ready);
      }

      // 等待图片
      const images = Array.from(document.images);
      images.forEach((img) => {
        if (!img.complete) {
          promises.push(
            new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            }),
          );
        }
      });

      await Promise.all(promises);
    });

    // 获取内容的实际尺寸
    const contentSize = await page.evaluate(() => {
      const body = document.body;
      return {
        width: Math.ceil(body.scrollWidth),
        height: Math.ceil(body.scrollHeight),
      };
    });

    // 设置视口为内容大小（加一点边距）
    await page.setViewport({
      width: contentSize.width + 40, // 左右各加20px边距
      height: contentSize.height + 40, // 上下各加20px边距
      deviceScaleFactor: 2, // 提高清晰度
    });

    // 等待视图调整
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 重新计算调整后的尺寸
    const finalSize = await page.evaluate(() => {
      const body = document.body;
      return {
        width: Math.ceil(body.scrollWidth),
        height: Math.ceil(body.scrollHeight),
      };
    });

    console.log(`PDF尺寸: ${finalSize.width}px x ${finalSize.height}px`);

    // 生成PDF - 使用内容实际尺寸
    const pdf = await page.pdf({
      width: `${finalSize.width}px`,
      height: `${finalSize.height}px`,
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      displayHeaderFooter: false,
      preferCSSPageSize: false, // 不使用CSS页面尺寸
      timeout: 60000,
      scale: 1,
    });

    await browser.close();

    // 返回PDF
    const filename = options?.filename || `document_${Date.now()}.pdf`;

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdf.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF生成失败:", error);

    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("关闭浏览器失败:", e);
      }
    }

    return new Response(
      JSON.stringify({
        error: "PDF生成失败",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// 可选：支持根据内容动态调整边距的版本
export async function POST2(request) {
  let browser;

  try {
    const { html, css, options } = await request.json();

    if (!html) {
      return new Response(JSON.stringify({ error: "缺少HTML内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 启动浏览器
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // 设置页面内容 - 添加边距容器
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${css || ""}
            
            /* 边距容器 */
            .pdf-margin-container {
              padding: 20px;
              margin: 0;
              background: white;
              display: inline-block;
            }
            
            /* 内容容器 */
            .pdf-content {
              display: inline-block;
            }
            
            /* 打印优化 */
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="pdf-margin-container">
            <div class="pdf-content">
              ${html}
            </div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(fullHtml, {
      waitUntil: ["networkidle0", "load"],
      timeout: 30000,
    });

    // 等待资源加载
    await page.evaluate(async () => {
      const promises = [];

      if (document.fonts && document.fonts.ready) {
        promises.push(document.fonts.ready);
      }

      const images = Array.from(document.images);
      images.forEach((img) => {
        if (!img.complete) {
          promises.push(
            new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            }),
          );
        }
      });

      await Promise.all(promises);
    });

    // 获取内容+边距的总尺寸
    const totalSize = await page.evaluate(() => {
      const container = document.querySelector(".pdf-margin-container");
      return {
        width: Math.ceil(container.scrollWidth),
        height: Math.ceil(container.scrollHeight),
      };
    });

    // 设置视口
    await page.setViewport({
      width: totalSize.width,
      height: totalSize.height,
      deviceScaleFactor: 2,
    });

    // 等待渲染
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 生成PDF
    const pdf = await page.pdf({
      width: `${totalSize.width}px`,
      height: `${totalSize.height}px`,
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      displayHeaderFooter: false,
      preferCSSPageSize: false,
      timeout: 60000,
    });

    await browser.close();

    const filename = options?.filename || `document_${Date.now()}.pdf`;

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdf.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF生成失败:", error);

    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("关闭浏览器失败:", e);
      }
    }

    return new Response(
      JSON.stringify({
        error: "PDF生成失败",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
