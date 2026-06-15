// handles creating, fetching, updating and reviewing bookings
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Booking } from "../entity/Booking";
import { BookingStatus } from "../entity/BookingStatus";
import { Review } from "../entity/Review";
import { Venue } from "../entity/Venue";

const bookingRepo = () => AppDataSource.getRepository(Booking);
const statusRepo = () => AppDataSource.getRepository(BookingStatus);
const reviewRepo = () => AppDataSource.getRepository(Review);
const venueRepo = () => AppDataSource.getRepository(Venue);

// convert a filter string like week or month into a start and end date range
const getDateRange = (filter: string): { start: Date; end: Date } => {
    const now = new Date();
    switch (filter) {
        case 'week': {
            const start = new Date(now);
            start.setDate(now.getDate() - 7);
            return { start, end: now };
        }
        case 'month': {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start, end: now };
        }
        case 'lastmonth': {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { start, end };
        }
        // default to all time if no filter is given
        default:
            return { start: new Date(0), end: now };
    }
};



// build a readable booking object from the raw entity and its loaded relations
const formatBooking = (b: Booking) => ({
    bookingId: b.bookingId,
    userId: b.user?.userId,
    hirerName: b.user?.person ? `${b.user.person.firstName} ${b.user.person.lastName}` : b.user?.email || '',
    hirerEmail: b.user?.email || '',
    venueId: b.venue?.venueId,
    venueName: b.venue?.name || '',
    status: b.bookingStatus?.statusName || 'Pending',
    statusId: b.bookingStatus?.statusId,
    startDateTime: b.startDateTime,
    eventName: b.eventName,
    guests: b.guests,
    duration: b.duration,
    abn: b.abn || '',
    licensePhoto: b.licensePhoto || '',
    liabilityDoc: b.liabilityDoc || '',
    abnDoc: b.abnDoc || '',
    dateSubmitted: b.dateSubmitted,
    review: b.review ? { rating: b.review.rating, comment: b.review.comment } : null,
});

export class BookingController {


    async getVendorStats(req: Request, res: Response) {
        try {
            const vendorId = parseInt(req.params.vendorId);
            const filter = (req.query.filter as string) || 'all';
            const { start, end } = getDateRange(filter);

            const venues = await venueRepo().find({
                where: { userId: vendorId },
            });

            const venueIds = venues.map(v => v.venueId);
            if (venueIds.length === 0) {
                return res.json({ perVenueData: [], totalPerHirer: [], utilizationOverTime: [] });
            }

            const bookings = await bookingRepo()
                .createQueryBuilder("booking")
                .leftJoinAndSelect("booking.user", "user")
                .leftJoinAndSelect("user.person", "person")
                .leftJoinAndSelect("booking.venue", "venue")
                .leftJoinAndSelect("booking.bookingStatus", "bookingStatus")
                .where("venue.userId = :vendorId", { vendorId })
                .andWhere("booking.dateSubmitted >= :start", { start })
                .andWhere("booking.dateSubmitted <= :end", { end })
                .getMany();

            // group bookings by venue then tally how many times each hirer appears
            const venueMap = new Map<number, { venueId: number; venueName: string; hirers: Map<number, { hirerId: number; hirerName: string; count: number }> }>();
            for (const v of venues) {
                venueMap.set(v.venueId, { venueId: v.venueId, venueName: v.name, hirers: new Map() });
            }

            for (const b of bookings) {
                const userId = b.user?.userId;
                const venueId = b.venue?.venueId;
                if (!userId || !venueId) continue;
                const hirerName = b.user.person ? `${b.user.person.firstName} ${b.user.person.lastName}` : b.user.email;
                const venueEntry = venueMap.get(venueId);
                if (!venueEntry) continue;
                const existing = venueEntry.hirers.get(userId);
                if (existing) {
                    existing.count++;
                } else {
                    venueEntry.hirers.set(userId, { hirerId: userId, hirerName, count: 1 });
                }
            }

            const perVenueData = Array.from(venueMap.values()).map(v => ({
                venueId: v.venueId,
                venueName: v.venueName,
                hirers: Array.from(v.hirers.values()),
            }));

            // Chart 3: total per hirer across all venues
            const hirerTotals = new Map<number, { hirerId: number; hirerName: string; total: number }>();
            for (const b of bookings) {
                const userId = b.user?.userId;
                if (!userId) continue;
                const hirerName = b.user.person ? `${b.user.person.firstName} ${b.user.person.lastName}` : b.user.email;
                const existing = hirerTotals.get(userId);
                if (existing) {
                    existing.total++;
                } else {
                    hirerTotals.set(userId, { hirerId: userId, hirerName, total: 1 });
                }
            }
            const totalPerHirer = Array.from(hirerTotals.values()).sort((a, b) => b.total - a.total);

            // group bookings by submission date for the utilization line chart
            const dateMap = new Map<string, number>();
            for (const b of bookings) {
                const dateKey = new Date(b.dateSubmitted).toISOString().split('T')[0];
                dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
            }
            const utilizationOverTime = Array.from(dateMap.entries())
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date));

            return res.json({ perVenueData, totalPerHirer, utilizationOverTime });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch stats" });
        }
    }

    async create(req: Request, res: Response) {
        const { userId, venueId, startDateTime, eventName, guests, duration, abn, licensePhoto, liabilityDoc, abnDoc } = req.body;

        if (!userId || !venueId || !startDateTime || !eventName || !guests || !duration)
            return res.status(400).json({ error: 'Missing required booking fields.' });
        if (parseInt(guests) <= 0) return res.status(400).json({ error: 'Guests must be a positive number.' });
        if (parseFloat(duration) <= 0) return res.status(400).json({ error: 'Duration must be positive.' });
        if (new Date(startDateTime) <= new Date()) return res.status(400).json({ error: 'Booking date must be in the future.' });
        if (abn && abn.length !== 10) return res.status(400).json({ error: 'ABN must be exactly 10 characters.' });

        try {

            // find or create the pending status row so new bookings always have a status
            let pendingStatus = await statusRepo().findOne({ where: { statusName: 'Pending' } });
            if (!pendingStatus) {
                pendingStatus = await statusRepo().save(statusRepo().create({ statusName: 'Pending' }));
            }

            const booking = bookingRepo().create({
                user: { userId: parseInt(userId) } as any,
                venue: { venueId: parseInt(venueId) } as any,
                bookingStatus: pendingStatus,
                startDateTime: new Date(startDateTime),
                eventName,
                guests: parseInt(guests),
                duration: parseInt(duration),
                abn: abn || null,
                licensePhoto: licensePhoto || null,
                liabilityDoc: liabilityDoc || null,
                abnDoc: abnDoc || null,
            });

            const saved = await bookingRepo().save(booking);
            return res.status(201).json({ message: "Booking created", bookingId: saved.bookingId });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to create booking" });
        }
    }

    async getByUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);
            const bookings = await bookingRepo().find({
                where: { user: { userId } },
                relations: ["user", "user.person", "venue", "bookingStatus", "review"],
                order: { dateSubmitted: "DESC" },
            });
            return res.json(bookings.map(formatBooking));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch bookings" });
        }
    }

    async getByVendor(req: Request, res: Response) {
        try {
            const vendorId = parseInt(req.params.vendorId);
            const bookings = await bookingRepo()
                .createQueryBuilder("booking")
                .leftJoinAndSelect("booking.user", "user")
                .leftJoinAndSelect("user.person", "person")
                .leftJoinAndSelect("booking.venue", "venue")
                .leftJoinAndSelect("booking.bookingStatus", "bookingStatus")
                .leftJoinAndSelect("booking.review", "review")
                .where("venue.userId = :vendorId", { vendorId })
                .orderBy("booking.dateSubmitted", "DESC")
                .getMany();
            return res.json(bookings.map(formatBooking));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch vendor bookings" });
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const bookingId = parseInt(req.params.id);
            const { statusName } = req.body;

            const booking = await bookingRepo().findOne({
                where: { bookingId },
                relations: ["bookingStatus"],
            });
            if (!booking) return res.status(404).json({ error: "Booking not found" });

            let status = await statusRepo().findOne({ where: { statusName } });
            if (!status) {
                status = await statusRepo().save(statusRepo().create({ statusName }));
            }

            booking.bookingStatus = status;
            await bookingRepo().save(booking);
            return res.json({ message: "Status updated" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to update booking status" });
        }
    }

    async addReview(req: Request, res: Response) {
        try {
            const bookingId = parseInt(req.params.id);
            const { rating, comment } = req.body;

            const booking = await bookingRepo().findOne({ where: { bookingId } });
            if (!booking) return res.status(404).json({ error: "Booking not found" });

            const review = reviewRepo().create({
                booking,
                rating: parseFloat(rating),
                comment: comment || null,
            });
            await reviewRepo().save(review);
            return res.status(201).json({ message: "Review added" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to add review" });
        }
    }
}
