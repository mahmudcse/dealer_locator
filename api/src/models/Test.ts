import mongoose, { Schema, Document } from "mongoose";

export interface ITest extends Document {
  name: string;
  message: string;
  createdAt: Date;
}

const TestSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  }
);

export default mongoose.model<ITest>("Test", TestSchema);
