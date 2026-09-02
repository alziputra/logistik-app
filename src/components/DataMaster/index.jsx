import React from "react";
import MasterBarang from "./MasterBarang";
import MasterOutlet from "./MasterOutlet";
import MasterVendor from "./MasterVendor";
import MasterSpkPks from "./MasterSpkPks";

export default function DataMaster(props) {
  if (props.activeMenu === "master_barang") {
    return (
      <MasterBarang
        inventory={props.inventory || []}
        vendors={props.vendors || []}
        spkList={props.spkPksList || props.spkHistory || []}
        userRole={props.userRole}
        loadAllData={props.loadAllData}
      />
    );
  }

  if (props.activeMenu === "master_spk_pks") {
    return (
      <MasterSpkPks
        spkList={props.spkPksList || props.spkHistory || []}
        vendors={props.vendors || []}
        inventory={props.inventory || []}
        userRole={props.userRole}
        loadAllData={props.loadAllData}
      />
    );
  }

  if (props.activeMenu === "master_outlet") {
    return (
      <MasterOutlet
        outlets={props.outlets || []}
        userRole={props.userRole}
        loadAllData={props.loadAllData}
      />
    );
  }

  if (props.activeMenu === "master_vendor") {
    return (
      <MasterVendor
        vendors={props.vendors || []}
        userRole={props.userRole}
        loadAllData={props.loadAllData}
      />
    );
  }

  return null;
}
