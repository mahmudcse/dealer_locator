import mongoose, { Document } from "mongoose";
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
        coordinates: [number, number];
    };
    contact: {
        phone?: string;
        email?: string;
        website?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDealer, {}, {}, {}, mongoose.Document<unknown, {}, IDealer, {}, mongoose.DefaultSchemaOptions> & IDealer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDealer>;
export default _default;
//# sourceMappingURL=Dealer.d.ts.map