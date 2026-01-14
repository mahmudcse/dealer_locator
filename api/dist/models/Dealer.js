import mongoose, { Schema } from "mongoose";
const DealerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    manufacturer: {
        type: String,
        enum: ["KIA", "Seat", "Opel", "Other"],
        required: true,
    },
    address: {
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            default: "Germany",
        },
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: function (v) {
                    return (v.length === 2 &&
                        v[0] >= -180 &&
                        v[0] <= 180 &&
                        v[1] >= -90 &&
                        v[1] <= 90);
                },
                message: "Coordinates must be [longitude, latitude] with valid ranges",
            },
        },
    },
    contact: {
        phone: String,
        email: String,
        website: String,
    },
}, {
    timestamps: true,
});
// Create geospatial index for location-based queries
DealerSchema.index({ location: "2dsphere" });
// Index for postal code searches
DealerSchema.index({ "address.postalCode": 1 });
DealerSchema.index({ "address.city": 1 });
export default mongoose.model("Dealer", DealerSchema);
//# sourceMappingURL=Dealer.js.map