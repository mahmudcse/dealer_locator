import { Response } from "express";
import { IDealer } from "../models/Dealer.js";
export declare const exportToCSV: (res: Response, dealers?: IDealer[]) => Promise<void>;
export declare const exportToExcel: (res: Response, dealers?: IDealer[]) => Promise<void>;
//# sourceMappingURL=exportUtils.d.ts.map