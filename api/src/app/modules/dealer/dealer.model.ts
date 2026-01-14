import mongoose, { Schema, Document } from "mongoose";

export interface IDealer extends Document {
  name: string;
  manufacturer: "KIA" | "Seat" | "Opel" | "Other";
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DealerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
      default: "Unknown Dealer",
    },
    manufacturer: {
      type: String,
      enum: ["KIA", "Seat", "Opel", "Other"],
      required: false,
      default: "Other",
    },
    address: {
      street: {
        type: String,
        required: false,
        default: "",
      },
      city: {
        type: String,
        required: false,
        default: "",
      },
      postalCode: {
        type: String,
        required: false,
        default: "",
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
        required: false,
        validate: {
          validator: function (v: number[]) {
            if (!v || v.length === 0) return true; // Allow empty coordinates
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message:
            "Coordinates must be [longitude, latitude] with valid ranges",
        },
      },
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
DealerSchema.index({ location: "2dsphere" });

// Index for postal code searches
DealerSchema.index({ "address.postalCode": 1 });
DealerSchema.index({ "address.city": 1 });

export default mongoose.model<IDealer>("Dealer", DealerSchema);
