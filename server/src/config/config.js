import dotenv from "dotenv"
dotenv.config()

export const port = process.env.PORT || 8000;
export const mongo_uri = process.env.MONGO_URI || "mongodb://localhost:27107";
export const serp_api_key = process.env.SERP_API_KEY || "";
export const redis_uri = process.env.REDIS_URI || "redis://localhost:6379";