import dotenv from "dotenv"
dotenv.config()

export const port = process.env.PORT || 8000;
export const mongo_uri = process.env.MONGO_URI || "mongodb://localhost:27107";