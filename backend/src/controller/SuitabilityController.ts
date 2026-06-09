import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Suitability } from "../entity/Suitability";


export class SuitabilityController {
    private suitabilityRepository = AppDataSource.getRepository(Suitability);


    async findAll(req: Request, res: Response) {
        const suitabilityItems = await this.suitabilityRepository.find({
        });
        return res.json(suitabilityItems);
    }


}