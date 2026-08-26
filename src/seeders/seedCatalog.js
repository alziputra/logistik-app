import { computersCatalog } from './catalogs/computersCatalog';
import { laptopsCatalog } from './catalogs/laptopsCatalog';
import { printersCatalog } from './catalogs/printersCatalog';
import { outletsCatalog } from './catalogs/outletsCatalog';
import { inventoryCatalog } from './catalogs/inventoryCatalog';
import { vendorsCatalog } from './catalogs/vendorsCatalog';
import { usersCatalog } from './catalogs/usersCatalog';
import { masterCatalog } from './catalogs/masterCatalog';

export const SEED_CATALOG = [
  computersCatalog,
  printersCatalog,
  laptopsCatalog,
  outletsCatalog,
  inventoryCatalog,
  vendorsCatalog,
  usersCatalog,
  ...masterCatalog,
];
