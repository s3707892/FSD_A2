// handles adding, removing and reordering venues in a hirer shortlist
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Role } from "../entity/Role";
import { Shortlist } from "../entity/Shortlist";
import { Booking } from "../entity/Booking";
import { Person } from "../entity/Person";
import { Vendor } from "../entity/Vendor";


export class ShortlistController {
    private shortlistRepository = AppDataSource.getRepository(Shortlist);

    async findAll(req: Request, res: Response) {
        const shortlistedItems = await this.shortlistRepository.find({
            where: { userId: parseInt(req.params.id) },
            order: { ranking: "ASC" },
        });
        return res.json(shortlistedItems.map(item => ({
            venueId: item.venueId,
            ranking: item.ranking,
        })));
    }

    async remove(req: Request, res: Response) {
        const { userId, venueId } = req.body;
        const parsedUserId = parseInt(userId);
        const parsedVenueId = parseInt(venueId);
        try {
            await AppDataSource.transaction(async (transactionalEntityManager) => {
                await transactionalEntityManager.delete(Shortlist, { userId: parsedUserId, venueId: parsedVenueId });

                const remainingItems = await transactionalEntityManager.find(Shortlist, {
                    where: { userId: parsedUserId },
                    order: { ranking: 'ASC' },
                });

                // re-index rankings sequentially so there are no gaps after deletion
                for (let index = 0; index < remainingItems.length; index += 1) {
                    const item = remainingItems[index];
                    if (item.ranking !== index) {
                        item.ranking = index;
                        await transactionalEntityManager.save(item);
                    }
                }
            });

            return res.json({ message: "Removed from shortlist" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to remove shortlist item" });
        }
    }




    async create(req: Request, res: Response) {
        const { userId, venueId, ranking } = req.body;
        try {
            const existing = await this.shortlistRepository.findOne({ where: { userId: parseInt(userId), venueId: parseInt(venueId) } });
            if (existing) return res.status(409).json({ message: "Already in shortlist" });
            const shortlist = new Shortlist();
            shortlist.userId = parseInt(userId);
            shortlist.venueId = parseInt(venueId);
            shortlist.ranking = ranking ?? 0;
            await this.shortlistRepository.save(shortlist);
            return res.status(201).json({ message: "Item added to shortlist" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to add item to shortlist" });
        }
    }


    async moveUp(req: Request, res: Response) {
        const { userId, venueId } = req.body;
        const parsedUserId = parseInt(userId);
        const parsedVenueId = parseInt(venueId);
        try {
            await AppDataSource.transaction(async (transactionalEntityManager) => {
                
                const item = await transactionalEntityManager.findOne(Shortlist, {
                    where: { userId: parsedUserId, venueId: parsedVenueId }
                });
                if (!item) throw new Error("Item not found");
                
                
                if (item.ranking === 0) throw new Error("Already at top");
                
                
                const targetItem = await transactionalEntityManager.findOne(Shortlist, {
                    where: { userId: parsedUserId, ranking: item.ranking - 1 }
                });
                if (!targetItem) throw new Error("Target item not found");
                
                
                // swap the two rankings to move this item one position up
                [item.ranking, targetItem.ranking] = [targetItem.ranking, item.ranking];
                await transactionalEntityManager.save([item, targetItem]);
            });

            return res.json({ message: "Moved up" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to move up" });
        }
    }


    async moveDown(req: Request, res: Response) {
        const { userId, venueId } = req.body;
        const parsedUserId = parseInt(userId);
        const parsedVenueId = parseInt(venueId);
        try {
            await AppDataSource.transaction(async (transactionalEntityManager) => {
                
                const item = await transactionalEntityManager.findOne(Shortlist, {
                    where: { userId: parsedUserId, venueId: parsedVenueId }
                });
                if (!item) throw new Error("Item not found");
                
                
                const targetItem = await transactionalEntityManager.findOne(Shortlist, {
                    where: { userId: parsedUserId, ranking: item.ranking + 1 }
                });
                if (!targetItem) throw new Error("Already at bottom");
                
                
                // swap the two rankings to move this item one position down
                [item.ranking, targetItem.ranking] = [targetItem.ranking, item.ranking];
                await transactionalEntityManager.save([item, targetItem]);
            });

            return res.json({ message: "Moved down" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to move down" });
        }
    }



}