import { Response } from "express";
import XLSX from "xlsx";
import Dealer, { IDealer } from "../modules/dealer/dealer.model.js";

// Export dealers to CSV
export const exportToCSV = async (res: Response, dealers?: IDealer[]): Promise<void> => {
  try {
    let data: IDealer[];
    if (dealers) {
      data = dealers;
    } else {
      data = await Dealer.find();
    }

    // Convert to CSV format
    const csvRows: string[] = [];
    
    // Header row
    csvRows.push("Name,Manufacturer,Street,City,Postal Code,Country,Phone,Email,Website,Latitude,Longitude");

    // Data rows
    data.forEach((dealer) => {
      const row = [
        `"${dealer.name}"`,
        dealer.manufacturer,
        `"${dealer.address.street}"`,
        `"${dealer.address.city}"`,
        dealer.address.postalCode,
        dealer.address.country,
        dealer.contact.phone || "",
        dealer.contact.email || "",
        dealer.contact.website || "",
        dealer.location.coordinates[1], // latitude
        dealer.location.coordinates[0], // longitude
      ].join(",");
      csvRows.push(row);
    });

    const csvContent = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=dealers.csv");
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export dealers to CSV",
    });
  }
};

// Export dealers to Excel
export const exportToExcel = async (res: Response, dealers?: IDealer[]): Promise<void> => {
  try {
    let data: IDealer[];
    if (dealers) {
      data = dealers;
    } else {
      data = await Dealer.find();
    }

    // Prepare data for Excel
    const excelData = data.map((dealer) => ({
      Name: dealer.name,
      Manufacturer: dealer.manufacturer,
      Street: dealer.address.street,
      City: dealer.address.city,
      "Postal Code": dealer.address.postalCode,
      Country: dealer.address.country,
      Phone: dealer.contact.phone || "",
      Email: dealer.contact.email || "",
      Website: dealer.contact.website || "",
      Latitude: dealer.location.coordinates[1],
      Longitude: dealer.location.coordinates[0],
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dealers");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=dealers.xlsx");
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export dealers to Excel",
    });
  }
};
