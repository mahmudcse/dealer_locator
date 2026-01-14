import mongoose, { Document } from "mongoose";
export interface ITest extends Document {
    name: string;
    message: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<ITest, {}, {}, {}, mongoose.Document<unknown, {}, ITest, {}, mongoose.DefaultSchemaOptions> & ITest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITest>;
export default _default;
//# sourceMappingURL=Test.d.ts.map