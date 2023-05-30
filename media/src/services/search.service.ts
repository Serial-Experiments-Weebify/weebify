import { Service, Inject } from "typedi";
import { ConfigService } from "./config.service";

import { MeiliSearch } from "meilisearch";

@Service()
export class SearchService {
    protected meili: MeiliSearch;

    constructor(@Inject() cfg: ConfigService) {
        this.meili = new MeiliSearch({
            host: cfg.vars.SEARCH_HOST,
            apiKey: cfg.vars.SEARCH_KEY,
        });
    }

    public async updateSingle(indexUID: string, update: Record<string, any>) {
        const index = await this.meili.getIndex(indexUID);
        return index.updateDocuments([update], {
            primaryKey: "id",
        });
    }
}
