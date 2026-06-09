import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Venue } from "../entity/Venue";
import { VenueSuitability } from "../entity/VenueSuitability";
import { Suitability } from "../entity/Suitability";
import { Image } from "../entity/Image";

const venueRepo = () => AppDataSource.getRepository(Venue);
const suitabilityRepo = () => AppDataSource.getRepository(Suitability);
const venueSuitabilityRepo = () => AppDataSource.getRepository(VenueSuitability);
const imageRepo = () => AppDataSource.getRepository(Image);

const formatVenue = (v: Venue) => ({
    venueId: v.venueId,
    name: v.name,
    addressLine1: v.addressLine1,
    addressLine2: v.addressLine2 || null,
    suburb: v.suburb,
    postcode: v.postcode,
    state: v.state?.state || null,
    stateId: v.state?.stateId || null,
    capacity: v.capacity,
    description: v.description,
    hourlyPrice: parseFloat(v.hourlyPrice as any),
    active: v.active,
    featured: v.featured || false,
    vendorId: v.userId || null,
    suitabilities: (v.venueSuitabilities || []).map(vs => vs.suitability?.name).filter(Boolean),
    imageUrl: (v.images && v.images.length > 0) ? v.images[0].path : null,
    blockouts: (v.blockouts || []).map(b => ({
        blockoutId: b.blockoutId,
        startDate: b.startDate,
        endDate: b.endDate,
    })),
});

export class VenueController {

    async getAll(req: Request, res: Response) {
        try {
            const venues = await venueRepo().find({
                relations: ["state", "venueSuitabilities", "venueSuitabilities.suitability", "images", "blockouts"],
                where: { active: true },
            });
            return res.json(venues.map(formatVenue));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch venues" });
        }
    }

    async getByVendor(req: Request, res: Response) {
        try {
            const vendorId = parseInt(req.params.vendorId);
            const venues = await venueRepo().find({
                where: { userId: vendorId },
                relations: ["state", "venueSuitabilities", "venueSuitabilities.suitability", "images", "blockouts"],
            });
            return res.json(venues.map(formatVenue));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch vendor venues" });
        }
    }

    async getOne(req: Request, res: Response) {
        try {
            const venue = await venueRepo().findOne({
                where: { venueId: parseInt(req.params.id) },
                relations: ["state", "venueSuitabilities", "venueSuitabilities.suitability", "images", "blockouts"],
            });
            if (!venue) return res.status(404).json({ error: "Venue not found" });
            return res.json(formatVenue(venue));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch venue" });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { name, addressLine1, addressLine2, stateId, suburb, postcode, capacity, description, hourlyPrice, vendorId, suitabilityNames, imageUrl } = req.body;

            if (!name || !addressLine1 || !suburb || !postcode || !capacity || !description || !hourlyPrice || !vendorId)
                return res.status(400).json({ error: 'Name, address, suburb, postcode, capacity, description, price and vendor are required.' });
            if (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0)
                return res.status(400).json({ error: 'Capacity must be a positive number.' });
            if (isNaN(parseFloat(hourlyPrice)) || parseFloat(hourlyPrice) <= 0)
                return res.status(400).json({ error: 'Hourly price must be a positive number.' });

            const venue = venueRepo().create({
                name, addressLine1, addressLine2, suburb, postcode,
                capacity: parseInt(capacity),
                description,
                hourlyPrice: parseFloat(hourlyPrice),
                active: true,
                userId: parseInt(vendorId),
                state: stateId ? { stateId: parseInt(stateId) } as any : undefined,
            });
            const saved = await venueRepo().save(venue);

            if (Array.isArray(suitabilityNames) && suitabilityNames.length > 0) {
                for (const name of suitabilityNames) {
                    let suit = await suitabilityRepo().findOne({ where: { name } });
                    if (!suit) {
                        suit = await suitabilityRepo().save(suitabilityRepo().create({ name }));
                    }
                    const vs = venueSuitabilityRepo().create({ venueId: saved.venueId, suitabilityId: suit.suitabilityId });
                    await venueSuitabilityRepo().save(vs);
                }
            }

            if (imageUrl) {
                const img = imageRepo().create({ venue: saved, path: imageUrl });
                await imageRepo().save(img);
            }

            return res.status(201).json({ message: "Venue created", venueId: saved.venueId });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to create venue" });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const venueId = parseInt(req.params.id);
            const { name, addressLine1, addressLine2, stateId, suburb, postcode, capacity, description, hourlyPrice, suitabilityNames, imageUrl } = req.body;

            if (isNaN(venueId)) return res.status(400).json({ error: 'Invalid venue ID.' });
            if (capacity !== undefined && (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0))
                return res.status(400).json({ error: 'Capacity must be a positive number.' });
            if (hourlyPrice !== undefined && (isNaN(parseFloat(hourlyPrice)) || parseFloat(hourlyPrice) <= 0))
                return res.status(400).json({ error: 'Hourly price must be a positive number.' });

            const venue = await venueRepo().findOne({ where: { venueId }, relations: ["venueSuitabilities", "images"] });
            if (!venue) return res.status(404).json({ error: "Venue not found" });

            venue.name = name ?? venue.name;
            venue.addressLine1 = addressLine1 ?? venue.addressLine1;
            venue.addressLine2 = addressLine2 ?? venue.addressLine2;
            venue.suburb = suburb ?? venue.suburb;
            venue.postcode = postcode ?? venue.postcode;
            if (capacity) venue.capacity = parseInt(capacity);
            venue.description = description ?? venue.description;
            if (hourlyPrice) venue.hourlyPrice = parseFloat(hourlyPrice);
            if (stateId) venue.state = { stateId: parseInt(stateId) } as any;

            await venueRepo().save(venue);

            if (Array.isArray(suitabilityNames)) {
                await venueSuitabilityRepo().delete({ venueId });
                for (const n of suitabilityNames) {
                    let suit = await suitabilityRepo().findOne({ where: { name: n } });
                    if (!suit) suit = await suitabilityRepo().save(suitabilityRepo().create({ name: n }));
                    const vs = venueSuitabilityRepo().create({ venueId, suitabilityId: suit.suitabilityId });
                    await venueSuitabilityRepo().save(vs);
                }
            }

            if (imageUrl) {
                await imageRepo().delete({ venue: { venueId } });
                const img = imageRepo().create({ venue, path: imageUrl });
                await imageRepo().save(img);
            }

            return res.json({ message: "Venue updated" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to update venue" });
        }
    }

    async remove(req: Request, res: Response) {
        try {
            const venueId = parseInt(req.params.id);
            const venue = await venueRepo().findOne({ where: { venueId } });
            if (!venue) return res.status(404).json({ error: "Venue not found" });
            venue.active = false;
            await venueRepo().save(venue);
            return res.json({ message: "Venue deactivated" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to delete venue" });
        }
    }
}
