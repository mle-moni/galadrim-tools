import { BaseCommand } from "@adonisjs/core/ace";
import type { CommandOptions } from "@adonisjs/core/types/ace";

export default class ForestRoomsPrune extends BaseCommand {
    static commandName = "forest:rooms:prune";
    static description = "Prune expired reservation command receipts (24h)";
    static options: CommandOptions = { startApp: true };
    async run() {
        const { forestRoomsService } = await import("#services/forest_rooms_service");
        const result = await forestRoomsService.prune();
        this.logger.info(`Pruned ${result.receipts} expired reservation command receipts`);
    }
}
