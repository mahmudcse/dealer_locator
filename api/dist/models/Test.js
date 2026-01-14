import mongoose, { Schema } from "mongoose";
const TestSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // This adds createdAt and updatedAt automatically
});
export default mongoose.model("Test", TestSchema);
//# sourceMappingURL=Test.js.map