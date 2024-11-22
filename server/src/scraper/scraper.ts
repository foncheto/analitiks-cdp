const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

// Use Puppeteer stealth plugin to bypass bot detection
puppeteer.use(StealthPlugin());

export const scrapeVtigerSales = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    // Set a realistic user-agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
    );

    // Go to vtiger CRM login page
    await page.goto("https://crmaccess.vtiger.com/log-in/", {
      waitUntil: "networkidle2",
    });

    // Wait for the login form to appear
    await page.waitForSelector("form#com-form-login", { visible: true });

    // Fill in the email and password fields
    await page.type("input[name='username']", process.env.VTIGER_USERNAME, {
      delay: 100, // Simulate human typing
    });
    await page.type("input[name='password']", process.env.VTIGER_PASSWORD, {
      delay: 100,
    });

    // Click the "Sign in" button
    await page.click("button[type='submit']");

    await page.waitForSelector(
      'a[href="view/list?module=Dashboard&app=ESSENTIALS"].text-nowrap.text-dark-0.text-decoration-none.text-primary-hover',
      { visible: true, timeout: 10000 }
    );

    // Navigate to the sales page or handle additional steps as needed
    await page.goto(
      "https://alfredomatuscomerteccl.od2.vtiger.com/view/list?module=Potentials",
      { waitUntil: "networkidle2" }
    );

    console.log("Login successful and navigated to the sales page.");

    await browser.close();
  } catch (error: any) {
    console.error("Error during scraping:", error.message);
    if (browser) await browser.close();
  }
};
