// src/lib/puppeteer.js  
import puppeteer from "puppeteer";

export async function scanCSP(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const cspHeader = await page.evaluate(() => {
    return document.querySelector("meta[http-equiv='Content-Security-Policy']")?.content;
  });

  await browser.close();
  return cspHeader || "Ingen CSP hittades";
}