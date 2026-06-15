// returns all available australian states from the database
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { State } from "../entity/State";

export class StateController {
    private stateRepository = AppDataSource.getRepository(State);

    async findAll(req: Request, res: Response) {
        const states = await this.stateRepository.find({ order: { state: "ASC" } });
        return res.json(states);
    }
}
