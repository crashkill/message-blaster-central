const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:8080');
    
    // Aguardar carregamento
    await page.waitForTimeout(3000);
    
    // Capturar título e elementos principais
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    
    console.log('🎯 NAVEGAÇÃO REAL NA APLICAÇÃO:');
    console.log('📄 Título:', title);
    console.log('📝 Conteúdo (primeiros 500 chars):', bodyText);
    
    await browser.close();
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
})();
