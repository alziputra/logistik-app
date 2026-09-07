import { computersCatalog } from "./catalogs/computersCatalog.js";
import { laptopsCatalog } from "./catalogs/laptopsCatalog.js";
import { printersCatalog } from "./catalogs/printersCatalog.js";
import { outletsCatalog } from "./catalogs/outletsCatalog.js";
import { inventoryCatalog } from "./catalogs/inventoryCatalog.js";
import { vendorsCatalog } from "./catalogs/vendorsCatalog.js";
import { usersCatalog } from "./catalogs/usersCatalog.js";
import { masterCatalog } from "./catalogs/masterCatalog.js";

export const SEED_CATALOG = [computersCatalog, printersCatalog, laptopsCatalog, outletsCatalog, inventoryCatalog, vendorsCatalog, usersCatalog, ...masterCatalog];
