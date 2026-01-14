import { Request, Response } from "express";
export declare const getAllDealers: (_req: Request, res: Response) => Promise<Response>;
export declare const getDealerById: (req: Request, res: Response) => Promise<Response>;
export declare const searchByPostalCode: (req: Request, res: Response) => Promise<Response>;
export declare const searchByPlace: (req: Request, res: Response) => Promise<Response>;
export declare const searchByRadius: (req: Request, res: Response) => Promise<Response>;
export declare const filterByManufacturer: (req: Request, res: Response) => Promise<Response>;
export declare const createDealer: (req: Request, res: Response) => Promise<Response>;
export declare const updateDealer: (req: Request, res: Response) => Promise<Response>;
export declare const deleteDealer: (req: Request, res: Response) => Promise<Response>;
export declare const exportDealersCSV: (req: Request, res: Response) => Promise<void>;
export declare const exportDealersExcel: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=dealerController.d.ts.map