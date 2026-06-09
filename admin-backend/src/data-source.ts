import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Venue } from './entity/Venue';
import { User } from './entity/User';
import { Booking } from './entity/Booking';
import { BookingStatus } from './entity/BookingStatus';
import { State } from './entity/State';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  options: { encrypt: false },
  synchronize: false,
  logging: false,
  entities: [Venue, User, Booking, BookingStatus, State],
});
