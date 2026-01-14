import Dealer from "../models/Dealer.js";
import { exportToCSV, exportToExcel } from "../utils/exportUtils.js";
// Get all dealers
export const getAllDealers = async (_req, res) => {
    try {
        const dealers = await Dealer.find();
        return res.json({
            success: true,
            count: dealers.length,
            data: dealers,
        });
    }
    catch (error) {
        console.error("Error fetching dealers:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch dealers",
        });
    }
};
// Get dealer by ID
export const getDealerById = async (req, res) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({
                success: false,
                error: "Dealer not found",
            });
        }
        return res.json({
            success: true,
            data: dealer,
        });
    }
    catch (error) {
        console.error("Error fetching dealer:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch dealer",
        });
    }
};
// Search dealers by postal code
export const searchByPostalCode = async (req, res) => {
    try {
        const { postalCode } = req.query;
        if (!postalCode || typeof postalCode !== "string") {
            return res.status(400).json({
                success: false,
                error: "Postal code is required",
            });
        }
        const dealers = await Dealer.find({
            "address.postalCode": postalCode,
        });
        return res.json({
            success: true,
            count: dealers.length,
            data: dealers,
        });
    }
    catch (error) {
        console.error("Error searching by postal code:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to search dealers",
        });
    }
};
// Search dealers by place name (city)
export const searchByPlace = async (req, res) => {
    try {
        const { place } = req.query;
        if (!place || typeof place !== "string") {
            return res.status(400).json({
                success: false,
                error: "Place name is required",
            });
        }
        const dealers = await Dealer.find({
            $or: [
                { "address.city": { $regex: place, $options: "i" } },
                { "address.postalCode": place },
            ],
        });
        return res.json({
            success: true,
            count: dealers.length,
            data: dealers,
        });
    }
    catch (error) {
        console.error("Error searching by place:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to search dealers",
        });
    }
};
// Search dealers by radius (requires coordinates)
export const searchByRadius = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: "Latitude and longitude are required",
            });
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusKm = parseFloat(radius);
        if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
            return res.status(400).json({
                success: false,
                error: "Invalid coordinates or radius",
            });
        }
        const dealers = await Dealer.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: radiusKm * 1000, // Convert km to meters
                },
            },
        });
        return res.json({
            success: true,
            count: dealers.length,
            radius: radiusKm,
            center: { lat: latitude, lng: longitude },
            data: dealers,
        });
    }
    catch (error) {
        console.error("Error searching by radius:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to search dealers by radius",
        });
    }
};
// Filter by manufacturer
export const filterByManufacturer = async (req, res) => {
    try {
        const { manufacturer } = req.query;
        if (!manufacturer || typeof manufacturer !== "string") {
            return res.status(400).json({
                success: false,
                error: "Manufacturer is required",
            });
        }
        const validManufacturers = ["KIA", "Seat", "Opel", "Other"];
        if (!validManufacturers.includes(manufacturer)) {
            return res.status(400).json({
                success: false,
                error: "Invalid manufacturer. Must be one of: KIA, Seat, Opel, Other",
            });
        }
        const dealers = await Dealer.find({ manufacturer });
        return res.json({
            success: true,
            count: dealers.length,
            manufacturer,
            data: dealers,
        });
    }
    catch (error) {
        console.error("Error filtering by manufacturer:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to filter dealers",
        });
    }
};
// Create a new dealer
export const createDealer = async (req, res) => {
    try {
        const dealerData = req.body;
        // Validate required fields
        if (!dealerData.name || !dealerData.manufacturer || !dealerData.address || !dealerData.location) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: name, manufacturer, address, location",
            });
        }
        const dealer = new Dealer(dealerData);
        const savedDealer = await dealer.save();
        return res.status(201).json({
            success: true,
            message: "Dealer created successfully",
            data: savedDealer,
        });
    }
    catch (error) {
        console.error("Error creating dealer:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to create dealer",
        });
    }
};
// Update a dealer
export const updateDealer = async (req, res) => {
    try {
        const dealer = await Dealer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!dealer) {
            return res.status(404).json({
                success: false,
                error: "Dealer not found",
            });
        }
        return res.json({
            success: true,
            message: "Dealer updated successfully",
            data: dealer,
        });
    }
    catch (error) {
        console.error("Error updating dealer:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to update dealer",
        });
    }
};
// Delete a dealer
export const deleteDealer = async (req, res) => {
    try {
        const dealer = await Dealer.findByIdAndDelete(req.params.id);
        if (!dealer) {
            return res.status(404).json({
                success: false,
                error: "Dealer not found",
            });
        }
        return res.json({
            success: true,
            message: "Dealer deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting dealer:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete dealer",
        });
    }
};
// Export dealers to CSV
export const exportDealersCSV = async (req, res) => {
    try {
        const { postalCode, place, manufacturer } = req.query;
        let dealers;
        // If filters are provided, get filtered dealers
        if (postalCode || place || manufacturer) {
            const query = {};
            if (postalCode)
                query["address.postalCode"] = postalCode;
            if (place) {
                query.$or = [
                    { "address.city": { $regex: place, $options: "i" } },
                    { "address.postalCode": place },
                ];
            }
            if (manufacturer)
                query.manufacturer = manufacturer;
            dealers = await Dealer.find(query);
        }
        await exportToCSV(res, dealers);
    }
    catch (error) {
        console.error("Error exporting to CSV:", error);
        res.status(500).json({
            success: false,
            error: "Failed to export dealers to CSV",
        });
    }
};
// Export dealers to Excel
export const exportDealersExcel = async (req, res) => {
    try {
        const { postalCode, place, manufacturer } = req.query;
        let dealers;
        // If filters are provided, get filtered dealers
        if (postalCode || place || manufacturer) {
            const query = {};
            if (postalCode)
                query["address.postalCode"] = postalCode;
            if (place) {
                query.$or = [
                    { "address.city": { $regex: place, $options: "i" } },
                    { "address.postalCode": place },
                ];
            }
            if (manufacturer)
                query.manufacturer = manufacturer;
            dealers = await Dealer.find(query);
        }
        await exportToExcel(res, dealers);
    }
    catch (error) {
        console.error("Error exporting to Excel:", error);
        res.status(500).json({
            success: false,
            error: "Failed to export dealers to Excel",
        });
    }
};
//# sourceMappingURL=dealerController.js.map