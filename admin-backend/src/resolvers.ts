// handles all graphql queries and mutations using typeorm repositories
import { AppDataSource } from './data-source';
import { Venue } from './entity/Venue';
import { User } from './entity/User';
import { Booking } from './entity/Booking';

// shorthand repo getters so we don't repeat AppDataSource.getRepository everywhere
const venueRepo = () => AppDataSource.getRepository(Venue);
const userRepo = () => AppDataSource.getRepository(User);
const bookingRepo = () => AppDataSource.getRepository(Booking);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const resolvers = {
  Query: {
    // get all venues and attach vendor email from the linked user
    venues: async () => {
      const venues = await venueRepo().find({ relations: ['user'] });
      return venues.map(v => ({
        ...v,
        vendorEmail: v.user?.email || null,
      }));
    },

    // get a single venue by id with its vendor email
    venue: async (_: any, { venueId }: { venueId: number }) => {
      const v = await venueRepo().findOne({ where: { venueId }, relations: ['user'] });
      if (!v) return null;
      return { ...v, vendorEmail: v.user?.email || null };
    },

    // get all users with roleId 2 which means they are vendors
    vendors: async () => {
      return userRepo().find({ where: { roleId: 2 } });
    },

    // find the top 3 venues ranked by total booking count
    topVenues: async () => {
      const bookings = await bookingRepo().find({ relations: ['venue', 'bookingStatus'] });

      // group bookings by venue and collect their start datetimes
      const venueMap = new Map<number, { name: string; bookings: Date[] }>();
      for (const b of bookings) {
        if (!b.venue) continue;
        if (!venueMap.has(b.venueId)) {
          venueMap.set(b.venueId, { name: b.venue.name, bookings: [] });
        }
        venueMap.get(b.venueId)!.bookings.push(new Date(b.startDateTime));
      }

      const results = Array.from(venueMap.entries()).map(([venueId, data]) => {
        // count how many bookings fall on each day and hour
        const dayCounts = new Map<number, number>();
        const hourCounts = new Map<number, number>();

        for (const dt of data.bookings) {
          const day = dt.getDay();
          const hour = dt.getHours();
          dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        }

        // pick the day and hour with the highest count
        const popularDay = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0];
        const popularHour = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0];

        const timeSlot = popularHour
          ? `${popularHour[0]}:00 - ${popularHour[0] + 2}:00`
          : null;

        return {
          venueId,
          name: data.name,
          bookingCount: data.bookings.length,
          popularDay: popularDay ? DAYS[popularDay[0]] : null,
          popularTimeSlot: timeSlot,
        };
      });

      // return only the top 3 sorted by booking count descending
      return results.sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 3);
    },

    // find the top 3 hirers by total applications submitted
    topApplicants: async () => {
      const bookings = await bookingRepo().find({ relations: ['user', 'bookingStatus'] });

      // tally total and approved bookings per user
      const userMap = new Map<number, { email: string; total: number; successful: number }>();
      for (const b of bookings) {
        if (!b.user) continue;
        if (!userMap.has(b.userId)) {
          userMap.set(b.userId, { email: b.user.email, total: 0, successful: 0 });
        }
        const entry = userMap.get(b.userId)!;
        entry.total++;
        if (b.bookingStatus?.statusName === 'Approved') entry.successful++;
      }

      return [...userMap.entries()]
        .map(([userId, data]) => ({
          userId,
          email: data.email,
          totalApplications: data.total,
          successfulBookings: data.successful,
        }))
        .sort((a, b) => b.totalApplications - a.totalApplications)
        .slice(0, 3);
    },
  },

  Mutation: {
    // create a new venue defaulting active to true and featured to false
    createVenue: async (_: any, args: any) => {
      const venue = venueRepo().create({
        name: args.name,
        addressLine1: args.addressLine1,
        addressLine2: args.addressLine2 || null,
        suburb: args.suburb,
        postcode: args.postcode,
        capacity: args.capacity,
        hourlyPrice: args.hourlyPrice,
        description: args.description,
        userId: args.userId,
        active: true,
        featured: false,
      });
      return venueRepo().save(venue);
    },

    // merge only the provided fields so unset args are ignored
    updateVenue: async (_: any, args: any) => {
      const venue = await venueRepo().findOne({ where: { venueId: args.venueId } });
      if (!venue) return null;
      Object.assign(venue, {
        ...(args.name !== undefined && { name: args.name }),
        ...(args.addressLine1 !== undefined && { addressLine1: args.addressLine1 }),
        ...(args.addressLine2 !== undefined && { addressLine2: args.addressLine2 }),
        ...(args.suburb !== undefined && { suburb: args.suburb }),
        ...(args.postcode !== undefined && { postcode: args.postcode }),
        ...(args.capacity !== undefined && { capacity: args.capacity }),
        ...(args.hourlyPrice !== undefined && { hourlyPrice: args.hourlyPrice }),
        ...(args.description !== undefined && { description: args.description }),
        ...(args.active !== undefined && { active: args.active }),
      });
      return venueRepo().save(venue);
    },

    // hard delete the venue row from the database
    deleteVenue: async (_: any, { venueId }: { venueId: number }) => {
      await venueRepo().delete({ venueId });
      return true;
    },

    // link an existing vendor user to an existing venue
    assignVendor: async (_: any, { venueId, userId }: { venueId: number; userId: number }) => {
      const venue = await venueRepo().findOne({
        where: { venueId },
        relations: ['user'],
      });

      if (!venue) return null;

      const user = await userRepo().findOne({ where: { userId } });
      if (!user) return null;

      venue.user = user;

      const saved = await venueRepo().save(venue);

      // return the saved venue with vendor email attached
      return {
        ...saved,
        vendorEmail: user.email,
      };
    },

    // toggle the featured flag on a venue
    setFeatured: async (_: any, { venueId, featured }: { venueId: number; featured: boolean }) => {
      const venue = await venueRepo().findOne({ where: { venueId } });
      if (!venue) return null;
      venue.featured = featured;
      return venueRepo().save(venue);
    },
  },
};
