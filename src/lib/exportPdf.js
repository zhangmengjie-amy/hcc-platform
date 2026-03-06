/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

/**
 * 调用Puppeteer生成PDF并下载
 * @param {string} url - 要导出的完整页面URL
 * @param {string} [filename='export.pdf'] - 下载文件名
 */
export async function generatePDF(url, filename = "export.pdf") {
  try {
    // 1. 调用API路由
    const response = await fetch(`/api/export-pdf?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("生成失败");
  
    // 2. 获取PDF Blob并下载
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
      
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    a.click();
      
    // 3. 清理内存
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
  } catch (error) {
    console.error("PDF生成错误:", error);
    alert(error.message);
  }
}