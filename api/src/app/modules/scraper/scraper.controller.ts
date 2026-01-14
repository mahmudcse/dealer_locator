import { Request, Response } from "express";
import { scrapeDealers } from "./browserScraper.js";
import Dealer from "../dealer/dealer.model.js";

// Scrape dealers from manufacturer websites
export const scrapeDealersFromWeb = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { postalCode, manufacturer = "All" } = req.query;

    if (!postalCode || typeof postalCode !== "string") {
      return res.status(400).json({
        success: false,
        error: "Postal code is required",
      });
    }

    const validManufacturers = ["KIA", "Seat", "Opel", "All"];
    if (!validManufacturers.includes(manufacturer as string)) {
      return res.status(400).json({
        success: false,
        error: "Invalid manufacturer. Must be one of: KIA, Seat, Opel, All",
      });
    }

    // Scrape dealers from websites
    const scrapedDealers = await scrapeDealers(
      manufacturer as "KIA" | "Seat" | "Opel" | "All",
      postalCode
    );

    // Save scraped dealers to database
    const savedDealers = [];
    for (const dealerData of scrapedDealers) {
      try {
        // Only skip if completely empty (no name at all)
        if (!dealerData.name || dealerData.name.trim().length === 0) {
          console.warn(`Skipping dealer with no name`);
          continue;
        }

        // Ensure we have at least some address data
        if (!dealerData.address.street) {
          dealerData.address.street = dealerData.address.city || `Area ${postalCode}`;
        }
        if (!dealerData.address.city) {
          dealerData.address.city = `Area ${postalCode}`;
        }
        if (!dealerData.address.postalCode) {
          dealerData.address.postalCode = postalCode;
        }

        // Check if dealer already exists (by name and address)
        const existingDealer = await Dealer.findOne({
          name: dealerData.name,
          "address.postalCode": dealerData.address.postalCode,
          "address.street": dealerData.address.street,
        });

        if (!existingDealer) {
          const dealer = new Dealer(dealerData);
          const saved = await dealer.save();
          savedDealers.push(saved);
        } else {
          savedDealers.push(existingDealer);
        }
      } catch (error: any) {
        console.error(`Error saving dealer ${dealerData.name || "Unknown"}:`, error.message);
      }
    }

    return res.json({
      success: true,
      message: `Scraped ${scrapedDealers.length} dealers, saved ${savedDealers.length} new dealers`,
      scraped: scrapedDealers.length,
      saved: savedDealers.length,
      data: savedDealers,
    });
  } catch (error: any) {
    console.error("Error scraping dealers:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to scrape dealers",
    });
  }
};

// Scrape and return without saving
export const scrapeDealersPreview = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { postalCode, manufacturer = "All" } = req.query;

    if (!postalCode || typeof postalCode !== "string") {
      return res.status(400).json({
        success: false,
        error: "Postal code is required",
      });
    }

    const validManufacturers = ["KIA", "Seat", "Opel", "All"];
    if (!validManufacturers.includes(manufacturer as string)) {
      return res.status(400).json({
        success: false,
        error: "Invalid manufacturer. Must be one of: KIA, Seat, Opel, All",
      });
    }

    // Scrape dealers from websites (preview only, don't save)
    const scrapedDealers = await scrapeDealers(
      manufacturer as "KIA" | "Seat" | "Opel" | "All",
      postalCode
    );

    return res.json({
      success: true,
      message: `Found ${scrapedDealers.length} dealers`,
      count: scrapedDealers.length,
      data: scrapedDealers,
    });
  } catch (error: any) {
    console.error("Error scraping dealers:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to scrape dealers",
    });
  }
};
