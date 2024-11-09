/*
 * Terimakasih Sudah Menggunakan Source Code Saya
 * Author : Arifzyn.
 * Github : https://github.com/Arifzyn19
 */

import { readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ScraperLoader {
  constructor() {
    this.scraper = new Map();
    this.scraperDir = resolve(__dirname, "../scrapers");
    this.load();
  }

  /**
   * Load all scraper modules
   */
  load() {
    try {
      this._loadDirectory(this.scraperDir);
      console.log(`✅ Loaded ${this.scraper.size} scrapers successfully`);
    } catch (error) {
      console.error("❌ Error loading scrapers:", error);
    }
  }

  /**
   * Load scraper modules from directory recursively
   * @param {string} dir Directory path
   * @param {string} namespace Namespace for nested modules
   */
  async _loadDirectory(dir, namespace = "") {
    const files = readdirSync(dir);

    for (const file of files) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursive loading for subdirectories
        await this._loadDirectory(fullPath, `${namespace}${file}.`);
        continue;
      }

      if (!file.endsWith(".js")) continue;

      try {
        const module = await import(`file://${fullPath}`);
        const scraperName = file.replace(/\.js$/, "");
        const key = namespace + scraperName;

        if (!module.default?.scrape) {
          console.warn(`⚠️ Skipping ${key}: No scrape method found`);
          continue;
        }

        this.scraper.set(key, module.default);
        console.log(`📥 Loaded scraper: ${key}`);
      } catch (error) {
        console.error(`❌ Failed to load ${file}:`, error);
      }
    }
  }

  /**
   * Get scraper by name
   * @param {string} name Scraper name
   * @returns {object|null} Scraper module or null if not found
   */
  call(name) {
    return this.scraper.get(name) || null;
  }

  /**
   * Get all scraper names
   * @returns {string[]} Array of scraper names
   */
  getScraperNames() {
    return Array.from(this.scraper.keys());
  }

  /**
   * Reload all scrapers
   */
  reload() {
    this.scraper.clear();
    this.load();
  }
}

export default new ScraperLoader();
