
import asyncio
import logging
import sys
from pathlib import Path

# Add server to path
sys.path.insert(0, str(Path(__file__).parent / "server"))

from scrapers.indeed_scraper import IndeedScraper
from scrapers.linkedin_scraper import LinkedInScraper
from scrapers.wttj_scraper import WTTJScraper

logging.basicConfig(level=logging.INFO)

async def test_scrapers():
    keywords = ["support informatique"]
    
    scrapers = [
        IndeedScraper(),
        LinkedInScraper(),
        WTTJScraper(),
    ]
    
    for scraper in scrapers:
        print(f"\n--- Testing {scraper.PLATFORM} ---")
        try:
            results = await scraper.scrape(keywords, max_results=5)
            print(f"Found {len(results)} results")
            for i, res in enumerate(results):
                print(f"{i+1}. {res['title']} @ {res['company']} ({res['location']})")
        except Exception as e:
            print(f"Error testing {scraper.PLATFORM}: {e}")

if __name__ == "__main__":
    asyncio.run(test_scrapers())
