import React from "react";
import { X } from "lucide-react";
import { VIEW_TITLES, PERMANENT_TABS } from "../../constants/tabConfig";

export default function TabBar({ tabs, activeTab, setActiveTab, setTabs }) {
  if (!activeTab || activeTab === "dashboard" || activeTab.startsWith("dashboard_")) {
    return null;
  }

  const handleTabClick = (tabId) => setActiveTab(tabId);

  const closeTab = (e, tabId) => {
    e.stopPropagation();
    const newTabs = tabs.filter((t) => t.id !== tabId);
    if (newTabs.length === 0) {
      setTabs([{ id: "dashboard", title: VIEW_TITLES.dashboard }]);
      setActiveTab("dashboard");
    } else {
      if (activeTab === tabId) setActiveTab(newTabs[newTabs.length - 1].id);
      setTabs(newTabs);
    }
  };

  return (
    <div
      className="sticky z-20 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 flex gap-1 overflow-x-auto custom-scrollbar print:hidden shrink-0 transition-colors"
      style={{ top: "var(--tabbar-top, 128px)" }}
    >
      <style>{`
        :root { --tabbar-top: 64px; }
        @media (min-width: 768px) { :root { --tabbar-top: 80px; } }
      `}</style>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`group flex items-center gap-2 px-4 py-2 min-w-max border-t border-x rounded-t-xl cursor-pointer transition-all select-none ${
            activeTab === tab.id
              ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
              : "bg-slate-50 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <span className="text-xs">{tab.title}</span>
          {!PERMANENT_TABS.includes(tab.id) && (
            <button
              onClick={(e) => closeTab(e, tab.id)}
              className={`p-0.5 rounded-md transition-colors ${
                activeTab === tab.id
                  ? "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
