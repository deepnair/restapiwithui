import cookieParser from "cookie-parser";
import express from "express"
import deserializeUser from "../middleware/deserializeUser"
import routes from "../routes"
import cors from "cors"
import config from "config"

const createServer = () => {
    const app = express();

    app.use(cors({
        origin: config.get<string>("origin"),
        credentials: true
    }))

    app.use(cookieParser());

    app.use(express.json());    
    
    app.use(deserializeUser);

    routes(app);

    return app;
}

export default createServer;