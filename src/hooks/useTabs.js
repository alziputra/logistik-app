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

  const closeTab = (tabId) => {
    const newTabs = tabs.filter((t) => t.id !== tabId);
    if (newTabs.length === 0) {
      setTabs([{ id: "dashboard", title: VIEW_TITLES.dashboard || "Dashboard" }]);
      setActiveTab("dashboard");
    } else {
      if (activeTab === tabId) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      }
      setTabs(newTabs);
    }
  };

  return { tabs, setTabs, activeTab, setActiveTab, handleSetView, closeTab };
}
