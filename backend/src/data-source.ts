// connects to the aws rds mssql instance using hardcoded credentials
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Blockouts } from "./entity/Blockouts";
import { Person } from "./entity/Person"
import { Vendor } from "./entity/Vendor"
import { Venue } from "./entity/Venue"
import { Image } from "./entity/Image"
import { Suitability } from "./entity/Suitability"
import { VenueSuitability } from "./entity/VenueSuitability"
import { Booking } from "./entity/Booking"
import { Review } from "./entity/Review"
import { Shortlist } from "./entity/Shortlist"
import { Role } from "./entity/Role"
import { State } from "./entity/State"
import { BookingStatus } from "./entity/BookingStatus"

export const AppDataSource = new DataSource({
  type: "mssql",
  host: "dipto-database.cn2ems8y2mfe.ap-southeast-2.rds.amazonaws.com",
  username: "s3707892",
  password: "Fgfdbcz*",
  database: "s3707892",
      options: {
        encrypt: false, // Use this for Azure SQL Database
        //trustedConnection: false // Use this for Windows Authentication (if applicable)
    },
  // synchronize: true will automatically create database tables based on entity definitions
  // and update them when entity definitions change. This is useful during development
  // but should be disabled in production to prevent accidental data loss.
  synchronize: false,
  logging: true,
  entities: [User, Person, Vendor, Venue, Image, Suitability, VenueSuitability, Booking, Review, Shortlist, Role, BookingStatus, Blockouts, State],
  migrations: [],
  subscribers: [],
});
