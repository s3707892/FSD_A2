// entry point for the main express api server with all routes registered
import express from 'express';
import "reflect-metadata";
import path from 'path';
import { AppDataSource } from "./data-source";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import shortlistRoutes from "./routes/shortlist.routes";
import venueRoutes from "./routes/venue.routes";
import bookingRoutes from "./routes/booking.routes";
import blockoutRoutes from "./routes/blockout.routes";
import suitabilityRoutes from "./routes/suitability.routes"
import stateRoutes from "./routes/state.routes"

const PORT = process.env.PORT || 3002;

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// serve uploaded images and docs as static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// mount all route groups under /api
app.use("/api", userRoutes);
app.use("/api", shortlistRoutes);
app.use("/api", venueRoutes);
app.use("/api", bookingRoutes);
app.use("/api", blockoutRoutes);
app.use("/api", suitabilityRoutes);
app.use("/api", stateRoutes);


// connect to the database before starting the http server
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );
