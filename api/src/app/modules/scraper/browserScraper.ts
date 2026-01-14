import { chromium, Browser, Page } from "playwright";

interface ScrapedDealer {
  name: string;
  manufacturer: "KIA" | "Seat" | "Opel";
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

// Helper to geocode address
const geocodeAddress = async (
  address: string,
  city: string,
  postalCode: string
): Promise<[number, number] | null> => {
  try {
    const axios = (await import("axios")).default;
    const query = encodeURIComponent(`${address}, ${postalCode} ${city}, Germany`);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "DealerLocator/1.0",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const { lon, lat } = response.data[0];
      return [parseFloat(lon), parseFloat(lat)];
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
};

// Scrape KIA dealers using browser automation
export const scrapeKIADealers = async (postalCode: string): Promise<ScrapedDealer[]> => {
  let browser: Browser | null = null;
  const dealers: ScrapedDealer[] = [];

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set viewport for better rendering
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to KIA dealer search
    await page.goto(`https://www.kia.com/de/haendlersuche/#/`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for page to fully load and JavaScript to execute
    await page.waitForTimeout(3000);
    
    // Handle cookie consent banner (OneTrust) - this is blocking clicks
    try {
      // Wait for cookie consent to appear
      const cookieBanner = page.locator('#onetrust-consent-sdk, #onetrust-button-group-parent, [id*="onetrust"]').first();
      if (await cookieBanner.isVisible({ timeout: 5000 })) {
        console.log("Cookie consent banner detected, accepting...");
        
        // Try to find and click "Accept All" or similar button
        const acceptButtons = [
          'button[id*="accept"]',
          'button:has-text("Akzeptieren")',
          'button:has-text("Accept")',
          'button:has-text("Alle akzeptieren")',
          'button:has-text("Accept All")',
          '#onetrust-accept-btn-handler',
          '.ot-sdk-button:has-text("Accept")',
        ];
        
        for (const selector of acceptButtons) {
          try {
            const btn = page.locator(selector).first();
            if (await btn.isVisible({ timeout: 2000 })) {
              await btn.click({ force: true });
              await page.waitForTimeout(1000);
              console.log("Cookie consent accepted");
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        // Alternative: Hide the cookie banner with JavaScript
        await page.evaluate(() => {
          const banner = document.getElementById('onetrust-consent-sdk');
          if (banner) {
            banner.style.display = 'none';
            banner.style.visibility = 'hidden';
            banner.style.pointerEvents = 'none';
          }
        });
      }
    } catch (e) {
      console.log("No cookie banner or already dismissed");
    }

    // Wait for the dealer search component to be visible
    await page.waitForTimeout(2000);
    
    // Try to find the dealer search input - look for inputs that are NOT the header search
    // The dealer search is usually in a specific container
    let searchInput;
    
    try {
      // Try to find input in main content area first
      searchInput = page.locator('main input[type="text"], .dealer-search input, [class*="search"] input:not(#header_search_input)').first();
      if (!(await searchInput.isVisible({ timeout: 3000 }))) {
        // Fallback: find any visible input that's not the header search
        searchInput = page.locator('input[type="text"]:not(#header_search_input):not([name="keyword"])').filter({ hasNot: page.locator('#header_search_input') }).first();
      }
    } catch (e) {
      // Last resort: use any text input
      searchInput = page.locator('input[type="text"]').filter({ hasNot: page.locator('#header_search_input') }).first();
    }

    // Fill in the postal code
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill(postalCode);
    await page.waitForTimeout(1000);

    // Find and click the search button - use force click to bypass overlays
    try {
      const searchButton = page.locator('button:has-text("SUCHE"), button[type="submit"][title="Suche"], button[aria-label*="Suche"]').first();
      if (await searchButton.isVisible({ timeout: 5000 })) {
        // Use force click to bypass any overlays
        await searchButton.click({ force: true, timeout: 5000 });
        await page.waitForTimeout(2000);
      } else {
        // Try pressing Enter as fallback
        await searchInput.press("Enter");
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      // If button click fails, try Enter key
      console.log("Button click failed, trying Enter key");
      await searchInput.press("Enter");
      await page.waitForTimeout(2000);
    }

    // Wait for results to load - KIA might need more time
    await page.waitForTimeout(5000);
    
    // Try scrolling to trigger lazy loading if results are paginated
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);
    
    // Scroll back up
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Wait for results to fully render
    await page.waitForTimeout(3000);

    // Try to extract all dealer information from the page
    // KIA shows dealers in a list, so we'll try multiple approaches
    let dealerElements: any[] = [];

    try {
      // Method 1: Look for the dealer results container first
      // KIA usually shows results in a specific container
      const resultsContainer = await page.locator('[class*="result"], [class*="list"], [class*="dealer"], ul, ol').first();
      
      // Method 2: Extract from all possible dealer elements
      dealerElements = await page.evaluate((postalCode) => {
        const dealers: any[] = [];
        const seenNames = new Set<string>();
        
        // Get all elements that might contain dealer info
        const allElements = Array.from(document.querySelectorAll('*'));
        
        for (const el of allElements) {
          const text = el.textContent || "";
          
          // Skip if too short, is a script/style, or contains navigation/cookie text
          if (
            text.length < 40 || 
            el.tagName === 'SCRIPT' || 
            el.tagName === 'STYLE' ||
            text.includes("Cookie") || 
            text.includes("Datenschutz") || 
            text.includes("Impressum") ||
            text.includes("Navigation") ||
            text.includes("Menu")
          ) {
            continue;
          }
          
          // Look for patterns that indicate a dealer entry
          // Must have postal code (5 digits) and some text that looks like a name
          const postalCodeMatch = text.match(/\b(\d{5})\b/);
          if (!postalCodeMatch) continue;
          
          const foundPostalCode = postalCodeMatch[1];
          // Check if postal code is close to the search postal code (within same area)
          const searchArea = postalCode.substring(0, 2);
          const foundArea = foundPostalCode.substring(0, 2);
          
          // Also look for phone pattern or address pattern
          const hasPhone = /(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4})/.test(text);
          const hasAddressPattern = /[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*,\s*\d{5}/.test(text);
          const hasNamePattern = /[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*(?:\s+GmbH|\s+AG|\s+KG|\s+OHG|\s+e\.K\.|Autohaus|Center|Händler)/i.test(text);
          
          if ((hasPhone || hasAddressPattern || hasNamePattern) && text.length > 50) {
            // Extract name - look for company-like names
            let name = "";
            
            // Try heading first
            const nameEl = el.querySelector("h2, h3, h4, h5, strong, [class*='name'], [class*='title']");
            if (nameEl) {
              name = nameEl.textContent?.trim() || "";
            }
            
            // If no heading, try to extract from text
            if (!name || name.length < 3) {
              const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 5);
              // First line that looks like a company name
              for (const line of lines) {
                if (/[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*(?:\s+GmbH|\s+AG|\s+KG|\s+OHG|\s+e\.K\.|Autohaus|Center|Händler)?/i.test(line) && 
                    line.length > 5 && line.length < 100) {
                  name = line;
                  break;
                }
              }
            }
            
            name = name.replace(/^\d+\.\s*/, "").trim();
            
            // Skip if we've seen this name before or it's too short
            if (name.length < 3 || seenNames.has(name.toLowerCase())) {
              continue;
            }
            seenNames.add(name.toLowerCase());
            
            // Extract full text for parsing
            const fullText = text;
            
            // Extract address - look for street, postal code, city pattern
            let address = "";
            const addressPatterns = [
              /([A-ZÄÖÜ][a-zäöüß\s]+(?:\d+[a-z]?)?(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*,\s*\d{5}\s+[A-ZÄÖÜ][a-zäöüß\s]+)/,
              /([A-ZÄÖÜ][a-zäöüß\s]+,\s*\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+)/,
              /(\d{5}\s+[A-ZÄÖÜ][a-zäöüß\s]+)/,
            ];
            
            for (const pattern of addressPatterns) {
              const match = fullText.match(pattern);
              if (match) {
                address = match[1];
                break;
              }
            }
            
            // Extract phone
            const phoneMatch = fullText.match(/(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4})/);
            const phone = phoneMatch ? phoneMatch[1].replace(/[^\d+\s-()]/g, "") : "";
            
            // Extract email
            const emailEl = el.querySelector("a[href^='mailto:']");
            const email = emailEl?.getAttribute("href")?.replace("mailto:", "") || "";
            
            // Extract website
            const websiteEl = el.querySelector("a[href*='http']:not([href*='kia.com/de'])");
            const website = websiteEl?.getAttribute("href") || "";
            
            dealers.push({
              name,
              address,
              phone,
              email,
              website,
              fullText,
              postalCode: foundPostalCode,
            });
          }
        }
        
        return dealers;
      }, postalCode);
      
      console.log(`Found ${dealerElements.length} potential dealers from KIA page`);
      
      // If we found very few, try waiting longer and scrolling more
      if (dealerElements.length < 5) {
        console.log("Found few dealers, trying to load more by scrolling...");
        
        // Scroll down multiple times to trigger lazy loading
        for (let i = 0; i < 5; i++) {
          await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
          });
          await page.waitForTimeout(1000);
        }
        
        // Try extraction again
        const moreDealers = await page.evaluate((postalCode) => {
          const dealers: any[] = [];
          const seenNames = new Set<string>();
          
          const allElements = Array.from(document.querySelectorAll('*'));
          
          for (const el of allElements) {
            const text = el.textContent || "";
            
            if (text.length < 40 || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
            
            const postalCodeMatch = text.match(/\b(\d{5})\b/);
            if (!postalCodeMatch) continue;
            
            const hasPhone = /(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4})/.test(text);
            const hasAddressPattern = /[A-ZÄÖÜ][a-zäöüß]+,\s*\d{5}/.test(text);
            
            if ((hasPhone || hasAddressPattern) && text.length > 50) {
              const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 5);
              let name = lines.find(l => /[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*/i.test(l)) || "";
              name = name.replace(/^\d+\.\s*/, "").trim();
              
              if (name.length < 3 || seenNames.has(name.toLowerCase())) continue;
              seenNames.add(name.toLowerCase());
              
              const addressMatch = text.match(/([A-ZÄÖÜ][a-zäöüß\s]+,\s*\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+)/);
              const phoneMatch = text.match(/(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4})/);
              
              dealers.push({
                name,
                address: addressMatch ? addressMatch[1] : "",
                phone: phoneMatch ? phoneMatch[1].replace(/[^\d+\s-()]/g, "") : "",
                email: "",
                website: "",
                fullText: text,
                postalCode: postalCodeMatch[1],
              });
            }
          }
          
          return dealers;
        }, postalCode);
        
        // Merge results, avoiding duplicates
        const existingNames = new Set(dealerElements.map(d => d.name.toLowerCase()));
        for (const dealer of moreDealers) {
          if (!existingNames.has(dealer.name.toLowerCase())) {
            dealerElements.push(dealer);
          }
        }
        
        console.log(`After scrolling, found ${dealerElements.length} total dealers`);
      }
    } catch (e) {
      console.log("Error extracting dealers:", e);
    }

    // Process and format dealers
    for (const dealerData of dealerElements) {
      if (!dealerData.name || dealerData.name.length < 3) continue;

      // Parse address more carefully
      let street = "";
      let city = "";
      let extractedPostalCode = postalCode;

      if (dealerData.address) {
        const addressParts = dealerData.address.split(",").map((s) => s.trim());
        if (addressParts.length >= 2) {
          street = addressParts[0] || "";
          const cityPart = addressParts[addressParts.length - 1] || "";
          const postalMatch = cityPart.match(/(\d{5})\s*(.+)/);
          if (postalMatch) {
            extractedPostalCode = postalMatch[1];
            city = postalMatch[2] || "";
          } else {
            city = cityPart;
          }
        } else {
          // Try to extract from full text
          const fullText = dealerData.fullText || "";
          const streetMatch = fullText.match(/([A-ZÄÖÜ][a-zäöüß\s]+(?:\d+[a-z]?)?)/);
          const cityMatch = fullText.match(/(\d{5})\s+([A-ZÄÖÜ][a-zäöüß\s]+)/);
          
          if (streetMatch) street = streetMatch[1].trim();
          if (cityMatch) {
            extractedPostalCode = cityMatch[1];
            city = cityMatch[2].trim();
          }
        }
      }

      // Ensure we have at least some address data - make everything optional
      if (!street) {
        street = city || `Area ${postalCode}` || "";
      }
      if (!city) {
        city = `Area ${extractedPostalCode}` || "";
      }
      if (!extractedPostalCode) {
        extractedPostalCode = postalCode;
      }

      // Try to geocode, but don't fail if it doesn't work
      let coords: [number, number] | null = null;
      if (street || city) {
        try {
          coords = await geocodeAddress(street, city, extractedPostalCode);
        } catch (e) {
          console.log(`Geocoding failed for ${dealerData.name}, continuing without coordinates`);
        }
      }

      // Save dealer even with minimal data
      dealers.push({
        name: dealerData.name || "KIA Dealer",
        manufacturer: "KIA",
        address: {
          street: street || "",
          city: city || "",
          postalCode: extractedPostalCode || postalCode,
          country: "Germany",
        },
        location: coords
          ? {
              type: "Point",
              coordinates: coords,
            }
          : undefined,
        contact: {
          phone: dealerData.phone || undefined,
          email: dealerData.email || undefined,
          website: dealerData.website || undefined,
        },
      });
    }

    return dealers;
  } catch (error: any) {
    console.error("Error scraping KIA dealers:", error.message);
    // Return empty array instead of throwing to allow other manufacturers to be scraped
    // This way, if KIA fails, Seat and Opel can still be scraped
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Scrape Seat dealers
export const scrapeSeatDealers = async (postalCode: string): Promise<ScrapedDealer[]> => {
  let browser: Browser | null = null;
  const dealers: ScrapedDealer[] = [];

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto(`https://www.seat.de/kontakt/haendlersuche`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Handle cookie consent
    try {
      const cookieBanner = page.locator('[id*="onetrust"], [id*="cookie"], button:has-text("Akzeptieren"), button:has-text("Accept")').first();
      if (await cookieBanner.isVisible({ timeout: 5000 })) {
        const acceptBtn = page.locator('button[id*="accept"], button:has-text("Akzeptieren"), button:has-text("Accept")').first();
        if (await acceptBtn.isVisible({ timeout: 2000 })) {
          await acceptBtn.click({ force: true });
          await page.waitForTimeout(1000);
        }
      }
    } catch (e) {
      console.log("No cookie banner on Seat page");
    }

    await page.waitForTimeout(2000);

    // Find and fill search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="PLZ"], input[name*="postal"], input[placeholder*="Postleitzahl"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill(postalCode);
    await page.waitForTimeout(1000);

    // Click search button
    try {
      const searchButton = page.locator('button:has-text("Suchen"), button[type="submit"], button[aria-label*="Suche"]').first();
      if (await searchButton.isVisible({ timeout: 5000 })) {
        await searchButton.click({ force: true });
      } else {
        await searchInput.press("Enter");
      }
    } catch (e) {
      await searchInput.press("Enter");
    }

    await page.waitForTimeout(5000);

    // Extract dealers using improved method (similar to KIA)
    const dealerElements = await page.evaluate((postalCode) => {
      const dealers: any[] = [];
      const seenNames = new Set<string>();
      const allElements = Array.from(document.querySelectorAll('*'));

      for (const el of allElements) {
        const text = el.textContent || "";
        if (text.length < 40 || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;

        const postalCodeMatch = text.match(/\b(\d{5})\b/);
        if (!postalCodeMatch) continue;

        const hasPhone = /(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4})/.test(text);
        const hasAddressPattern = /[A-ZÄÖÜ][a-zäöüß]+,\s*\d{5}/.test(text);
        const hasNamePattern = /[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*(?:\s+GmbH|\s+AG|Autohaus|Center|Händler)/i.test(text);

        if ((hasPhone || hasAddressPattern || hasNamePattern) && text.length > 50) {
          let name = "";
          const nameEl = el.querySelector("h2, h3, h4, strong, [class*='name'], [class*='title']");
          if (nameEl) {
            name = nameEl.textContent?.trim() || "";
          }
          if (!name || name.length < 3) {
            const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 5);
            for (const line of lines) {
              if (/[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*/i.test(line) && line.length > 5 && line.length < 100) {
                name = line;
                break;
              }
            }
          }
          name = name.replace(/^\d+\.\s*/, "").trim();
          if (name.length < 3 || seenNames.has(name.toLowerCase())) continue;
          seenNames.add(name.toLowerCase());

          const addressMatch = text.match(/([A-ZÄÖÜ][a-zäöüß\s]+,\s*\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+)/);
          const phoneMatch = text.match(/(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4})/);
          const emailEl = el.querySelector("a[href^='mailto:']");
          const websiteEl = el.querySelector("a[href*='http']:not([href*='seat.de'])");

          dealers.push({
            name,
            address: addressMatch ? addressMatch[1] : "",
            phone: phoneMatch ? phoneMatch[1].replace(/[^\d+\s-()]/g, "") : "",
            email: emailEl?.getAttribute("href")?.replace("mailto:", "") || "",
            website: websiteEl?.getAttribute("href") || "",
            fullText: text,
            postalCode: postalCodeMatch[1],
          });
        }
      }
      return dealers;
    }, postalCode);

    console.log(`Found ${dealerElements.length} potential dealers from Seat page`);

    // Process dealers
    for (const dealerData of dealerElements) {
      if (!dealerData.name || dealerData.name.length < 3) continue;

      let street = "";
      let city = "";
      let extractedPostalCode = dealerData.postalCode || postalCode;

      if (dealerData.address) {
        const addressParts = dealerData.address.split(",").map((s) => s.trim());
        if (addressParts.length >= 2) {
          street = addressParts[0] || "";
          const cityPart = addressParts[addressParts.length - 1] || "";
          const postalMatch = cityPart.match(/(\d{5})\s*(.+)/);
          if (postalMatch) {
            extractedPostalCode = postalMatch[1];
            city = postalMatch[2] || "";
          } else {
            city = cityPart;
          }
        }
      }

      if (!street) street = city || `Area ${postalCode}` || "";
      if (!city) city = `Area ${extractedPostalCode}` || "";

      let coords: [number, number] | null = null;
      if (street || city) {
        try {
          coords = await geocodeAddress(street, city, extractedPostalCode);
        } catch (e) {
          console.log(`Geocoding failed for ${dealerData.name}`);
        }
      }

      dealers.push({
        name: dealerData.name || "Seat Dealer",
        manufacturer: "Seat",
        address: {
          street: street || "",
          city: city || "",
          postalCode: extractedPostalCode || postalCode,
          country: "Germany",
        },
        location: coords ? { type: "Point", coordinates: coords } : undefined,
        contact: {
          phone: dealerData.phone || undefined,
          email: dealerData.email || undefined,
          website: dealerData.website || undefined,
        },
      });
    }

    return dealers;
  } catch (error: any) {
    console.error("Error scraping Seat dealers:", error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Scrape Opel dealers
export const scrapeOpelDealers = async (postalCode: string): Promise<ScrapedDealer[]> => {
  let browser: Browser | null = null;
  const dealers: ScrapedDealer[] = [];

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto(`https://www.opel.de/tools/haendlersuche.html`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Handle cookie consent
    try {
      const cookieBanner = page.locator('[id*="onetrust"], [id*="cookie"], button:has-text("Akzeptieren"), button:has-text("Accept")').first();
      if (await cookieBanner.isVisible({ timeout: 5000 })) {
        const acceptBtn = page.locator('button[id*="accept"], button:has-text("Akzeptieren"), button:has-text("Accept")').first();
        if (await acceptBtn.isVisible({ timeout: 2000 })) {
          await acceptBtn.click({ force: true });
          await page.waitForTimeout(1000);
        }
      }
    } catch (e) {
      console.log("No cookie banner on Opel page");
    }

    await page.waitForTimeout(2000);

    // Find and fill search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="PLZ"], input[name*="postal"], input[placeholder*="Postleitzahl"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill(postalCode);
    await page.waitForTimeout(1000);

    // Click search button
    try {
      const searchButton = page.locator('button:has-text("Suchen"), button[type="submit"], button[aria-label*="Suche"]').first();
      if (await searchButton.isVisible({ timeout: 5000 })) {
        await searchButton.click({ force: true });
      } else {
        await searchInput.press("Enter");
      }
    } catch (e) {
      await searchInput.press("Enter");
    }

    await page.waitForTimeout(5000);

    // Extract dealers using improved method (similar to KIA and Seat)
    const dealerElements = await page.evaluate((postalCode) => {
      const dealers: any[] = [];
      const seenNames = new Set<string>();
      const allElements = Array.from(document.querySelectorAll('*'));

      for (const el of allElements) {
        const text = el.textContent || "";
        if (text.length < 40 || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;

        const postalCodeMatch = text.match(/\b(\d{5})\b/);
        if (!postalCodeMatch) continue;

        const hasPhone = /(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4})/.test(text);
        const hasAddressPattern = /[A-ZÄÖÜ][a-zäöüß]+,\s*\d{5}/.test(text);
        const hasNamePattern = /[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*(?:\s+GmbH|\s+AG|Autohaus|Center|Händler)/i.test(text);

        if ((hasPhone || hasAddressPattern || hasNamePattern) && text.length > 50) {
          let name = "";
          const nameEl = el.querySelector("h2, h3, h4, strong, [class*='name'], [class*='title']");
          if (nameEl) {
            name = nameEl.textContent?.trim() || "";
          }
          if (!name || name.length < 3) {
            const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 5);
            for (const line of lines) {
              if (/[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*/i.test(line) && line.length > 5 && line.length < 100) {
                name = line;
                break;
              }
            }
          }
          name = name.replace(/^\d+\.\s*/, "").trim();
          if (name.length < 3 || seenNames.has(name.toLowerCase())) continue;
          seenNames.add(name.toLowerCase());

          const addressMatch = text.match(/([A-ZÄÖÜ][a-zäöüß\s]+,\s*\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+)/);
          const phoneMatch = text.match(/(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4})/);
          const emailEl = el.querySelector("a[href^='mailto:']");
          const websiteEl = el.querySelector("a[href*='http']:not([href*='opel.de'])");

          dealers.push({
            name,
            address: addressMatch ? addressMatch[1] : "",
            phone: phoneMatch ? phoneMatch[1].replace(/[^\d+\s-()]/g, "") : "",
            email: emailEl?.getAttribute("href")?.replace("mailto:", "") || "",
            website: websiteEl?.getAttribute("href") || "",
            fullText: text,
            postalCode: postalCodeMatch[1],
          });
        }
      }
      return dealers;
    }, postalCode);

    console.log(`Found ${dealerElements.length} potential dealers from Opel page`);

    // Process dealers
    for (const dealerData of dealerElements) {
      if (!dealerData.name || dealerData.name.length < 3) continue;

      let street = "";
      let city = "";
      let extractedPostalCode = dealerData.postalCode || postalCode;

      if (dealerData.address) {
        const addressParts = dealerData.address.split(",").map((s) => s.trim());
        if (addressParts.length >= 2) {
          street = addressParts[0] || "";
          const cityPart = addressParts[addressParts.length - 1] || "";
          const postalMatch = cityPart.match(/(\d{5})\s*(.+)/);
          if (postalMatch) {
            extractedPostalCode = postalMatch[1];
            city = postalMatch[2] || "";
          } else {
            city = cityPart;
          }
        }
      }

      if (!street) street = city || `Area ${postalCode}` || "";
      if (!city) city = `Area ${extractedPostalCode}` || "";

      let coords: [number, number] | null = null;
      if (street || city) {
        try {
          coords = await geocodeAddress(street, city, extractedPostalCode);
        } catch (e) {
          console.log(`Geocoding failed for ${dealerData.name}`);
        }
      }

      dealers.push({
        name: dealerData.name || "Opel Dealer",
        manufacturer: "Opel",
        address: {
          street: street || "",
          city: city || "",
          postalCode: extractedPostalCode || postalCode,
          country: "Germany",
        },
        location: coords ? { type: "Point", coordinates: coords } : undefined,
        contact: {
          phone: dealerData.phone || undefined,
          email: dealerData.email || undefined,
          website: dealerData.website || undefined,
        },
      });
    }

    return dealers;
  } catch (error: any) {
    console.error("Error scraping Opel dealers:", error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Unified scraping function
export const scrapeDealers = async (
  manufacturer: "KIA" | "Seat" | "Opel" | "All",
  postalCode: string
): Promise<ScrapedDealer[]> => {
  const allDealers: ScrapedDealer[] = [];

  if (manufacturer === "KIA" || manufacturer === "All") {
    try {
      const kiaDealers = await scrapeKIADealers(postalCode);
      allDealers.push(...kiaDealers);
    } catch (error) {
      console.error("Failed to scrape KIA:", error);
    }
  }

  if (manufacturer === "Seat" || manufacturer === "All") {
    try {
      const seatDealers = await scrapeSeatDealers(postalCode);
      allDealers.push(...seatDealers);
    } catch (error) {
      console.error("Failed to scrape Seat:", error);
    }
  }

  if (manufacturer === "Opel" || manufacturer === "All") {
    try {
      const opelDealers = await scrapeOpelDealers(postalCode);
      allDealers.push(...opelDealers);
    } catch (error) {
      console.error("Failed to scrape Opel:", error);
    }
  }

  return allDealers;
};
