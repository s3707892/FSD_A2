import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Blockouts } from "../entity/Blockouts";

const blockoutRepo = () => AppDataSource.getRepository(Blockouts);

export class BlockoutsController {

    async getByVenue(req: Request, res: Response) {
        try {
            const venueId = parseInt(req.params.venueId);
            const blockouts = await blockoutRepo().find({
                where: { venue: { venueId } },
                relations: ["venue"],
            });
            return res.json(blockouts.map(b => ({
                blockoutId: b.blockoutId,
                venueId: b.venue?.venueId,
                startDate: b.startDate,
                endDate: b.endDate,
            })));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch blockouts" });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { venueId, startDate, endDate } = req.body;

            if (!venueId || !startDate || !endDate)
                return res.status(400).json({ error: 'Venue, start date and end date are required.' });
            if (isNaN(parseInt(venueId)))
                return res.status(400).json({ error: 'Invalid venue ID.' });
            if (new Date(startDate) >= new Date(endDate))
                return res.status(400).json({ error: 'End date must be after start date.' });

            const blockout = blockoutRepo().create({
                venue: { venueId: parseInt(venueId) } as any,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
            const saved = await blockoutRepo().save(blockout);
            return res.status(201).json({ message: "Blockout created", blockoutId: saved.blockoutId });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to create blockout" });
        }
    }

    async remove(req: Request, res: Response) {
        try {
            const blockoutId = parseInt(req.params.id);
            const blockout = await blockoutRepo().findOne({ where: { blockoutId } });
            if (!blockout) return res.status(404).json({ error: "Blockout not found" });
            await blockoutRepo().remove(blockout);
            return res.json({ message: "Blockout removed" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to remove blockout" });
        }
    }
}
