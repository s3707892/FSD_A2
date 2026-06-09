import { AppDataSource } from './data-source';
import { Venue } from './entity/Venue';
import { User } from './entity/User';
import { Booking } from './entity/Booking';

const venueRepo = () => AppDataSource.getRepository(Venue);
const userRepo = () => AppDataSource.getRepository(User);
const bookingRepo = () => AppDataSource.getRepository(Booking);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const resolvers = {
  Query: {
    venues: async () => {
      const venues = await venueRepo().find({ relations: ['user'] });
      return venues.map(v => ({
        ...v,
        vendorEmail: v.user?.email || null,
      }));
    },

    venue: async (_: any, { venueId }: { venueId: number }) => {
      const v = await venueRepo().findOne({ where: { venueId }, relations: ['user'] });
      if (!v) return null;
      return { ...v, vendorEmail: v.user?.email || null };
    },

    vendors: async () => {
      return userRepo().find({ where: { roleId: 2 } });
    },

    topVenues: async () => {
      const bookings = await bookingRepo().find({ relations: ['venue', 'bookingStatus'] });

      const venueMap = new Map<number, { name: string; bookings: Date[] }>();
      for (const b of bookings) {
        if (!b.venue) continue;
        if (!venueMap.has(b.venueId)) {
          venueMap.set(b.venueId, { name: b.venue.name, bookings: [] });
        }
        venueMap.get(b.venueId)!.bookings.push(new Date(b.startDateTime));
      }

      const results = Array.from(venueMap.entries()).map(([venueId, data]) => {
        const dayCounts = new Map<number, number>();
        const hourCounts = new Map<number, number>();

        for (const dt of data.bookings) {
          const day = dt.getDay();
          const hour = dt.getHours();
          dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        }

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

      return results.sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 3);
    },

    topApplicants: async () => {
      const bookings = await bookingRepo().find({ relations: ['user', 'bookingStatus'] });

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

    deleteVenue: async (_: any, { venueId }: { venueId: number }) => {
      await venueRepo().delete({ venueId });
      return true;
    },

    assignVendor: async (_: any, { venueId, userId }: { venueId: number; userId: number }) => {
      const venue = await venueRepo().findOne({ where: { venueId }, relations: ['user'] });
      if (!venue) return null;
      venue.userId = userId;
      const saved = await venueRepo().save(venue);
      const user = await userRepo().findOne({ where: { userId } });
      return { ...saved, vendorEmail: user?.email || null };
    },

    setFeatured: async (_: any, { venueId, featured }: { venueId: number; featured: boolean }) => {
      const venue = await venueRepo().findOne({ where: { venueId } });
      if (!venue) return null;
      venue.featured = featured;
      return venueRepo().save(venue);
    },
  },
};
