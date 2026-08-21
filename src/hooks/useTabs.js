import { useState } from "react";
import { INITIAL_TABS, VIEW_TITLES } from "../constants/tabConfig";

export function useTabs() {
  const [tabs, setTabs]           = useState(INITIAL_TABS);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleSetView = (viewId) => {
    const isOpen = tabs.some((t) => t.id === viewId);
    if (!isOpen) {
      setTabs((prev) => [
        ...prev,
        { id: viewId, title: VIEW_TITLES[viewId] || viewId },
      ]);
    }
    setActiveTab(viewId);
  };

  return { tabs, setTabs, activeTab, setActiveTab, handleSetView };
}
