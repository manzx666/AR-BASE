import axios from 'axios';
import cheerio from 'cheerio';

export default const scraperExample = async (url) => {
    try {
        const { data } = await axios.get(url); 
        const $ = cheerio.load(data); 
        
        let results = [];
        $('.article-title').each((index, element) => {
            const title = $(element).text();
            const link = $(element).find('a').attr('href');
            results.push({ title, link });
        });

        return results; 
    } catch (error) {
        console.error('Error occurred while scraping:', error);
        return null;
    }
};

/* 
 * Example Usage 
 * Scraper Auto Loader 
 */

/* 
scrapers.scraperExample("https://akanebot.xyz")
  .then(console.log)
*/  