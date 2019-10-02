import { si } from "nyaapi";

export default class HorribleSubsUtils {
    static HORRIBLE_SUBS_USER = "HorribleSubs";
    static async search(show: string): Promise<SearchResult[]> {
        let results = await si.searchAllByUser(this.HORRIBLE_SUBS_USER, show);
        return results.map((ele: any) => {
            let result = new SearchResult()
            result.category = ele.category;
            results.fileSize = ele.fileSize;
            result.leechers = Number(ele.leechers);
            result.link = ele.links;
            result.name = ele.name;
            result.nbDownload = Number(ele.nbDownload);
            result.seeders = Number(ele.seeders);
            result.timestamp = new Date(ele.timestamp);
            result.episodeData = {
                episodeNumber: Number((result.name.match(/[0-9]+(\.[0-9]+)?(?=\s\[[0-9]+p\])/g) || [])[0]),
                seriesName: (result.name.match(/(?<=\[HorribleSubs\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
                quality: Number((result.name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s\[)[0-9]+(?=p)/g) || [])[0])
            };
            return result;
        });
    }
}

export class SearchResult {
    category!: {
        label: string;
        code: string;
    };
    fileSize!: string;
    leechers!: number;
    link!: {
        page: string;
        file: string;
        magnet: string;
    };
    name!: string;
    nbDownload!: number;
    seeders!: number;
    timestamp!: Date;
    episodeData!: EpisodeData;
}

class EpisodeData {
    episodeNumber!: number;
    seriesName!: string;
    quality!: number;
}