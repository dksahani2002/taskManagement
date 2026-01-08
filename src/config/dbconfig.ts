import mongoose from "mongoose";
import {env} from "./env.js";
const url=env.mongo.mongoUri;

const connectDB = async () => {

    try {
        await mongoose.connect(url,{
            maxPoolSize: 10,        
            minPoolSize: 2,        
            serverSelectionTimeoutMS: 5000,
            }
        );
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;