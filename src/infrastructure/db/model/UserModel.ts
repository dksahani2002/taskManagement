import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
});

export const UserModel = mongoose.model("User", UserSchema);