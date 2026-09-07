// Navbar.jsx - Responsive Sidebar & Mobile Accordion Navigation (Refactored Clean Code)
import React, { useState, useEffect } from "react";
import { ChevronDown, List, Box, Sun, Moon, X } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { NAV_CATEGORIES, getCategoryFromView } from "../../constants/navigationConfig";

function NavItem({ item, isActive, onClick, isMobile = false }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
        isActive
          ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-xs"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
      }`}
    >
      <div className={`rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0 ${isMobile ? "p-1 rounded-md" : "p-2"}`}>
        <Icon className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold">{item.label}</span>
        {!isMobile && item.desc && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">{item.desc}</span>}
      </div>
    </button>
  );
}

function NavGroup({ item, view, isOpen, onToggle, onSelect, isMobile = false }) {
  const Icon = item.icon;
  return (
    <div>
      <button onClick={onToggle} className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-2.5">
          <div className={`rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00753A] dark:text-emerald-400 shrink-0 ${isMobile ? "p-1 rounded-md" : "p-2"}`}>
            <Icon className={isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold">{item.label}</span>
            {!isMobile && item.desc && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">{item.desc}</span>}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#00753A]" : ""}`} />
      </button>
      {isOpen && (
        <div className="ml-4 pl-3 py-1 space-y-1 text-xs border-l-2 border-emerald-500/20 dark:border-emerald-500/30 my-1">
          {item.subItems.map((sub) => {
            const isActive = view === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-start gap-2 transition-all cursor-pointer ${
                  isActive ? "bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#00753A] dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:text-[#00753A]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isActive ? "bg-[#00753A] dark:bg-emerald-400" : "bg-slate-300 dark:bg-slate-600"}`} />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-xs leading-tight">{sub.label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">{sub.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Navbar({
  view,
  setView,
  startNewDocument,
  printers = [],
  computers = [],
  buildingLands = [],
  buildingSewas = [],
  isSidebarOpen,
  setIsSidebarOpen,
  setLandFilter,
  setSewaFilter,
  setComputerFilter,
  setPrinterFilter,
  setPrinterSearch,
  setComputerSearch,
  setLandSearch,
  setSewaSearch,
}) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const userRole = (user?.role || "officer").toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "administrator";

  const [activeRailCategory, setActiveRailCategory] = useState(getCategoryFromView(view));
  const [openGroups, setOpenGroups] = useState({ spk: true, sopp: true });
  const [openMobileCategories, setOpenMobileCategories] = useState({
    home: true,
    surat: true,
    master: false,
    inventaris: false,
    bangunan: false,
    settings: false,
  });

  useEffect(() => {
    const currentCat = getCategoryFromView(view);
    setActiveRailCategory(currentCat);
    setOpenMobileCategories((prev) => ({ ...prev, [currentCat]: true }));
  }, [view]);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleMobileCategory = (cat) => {
    setOpenMobileCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const closeMenu = () => setIsSidebarOpen(false);

  const resetFilters = () => {
    if (setLandFilter) setLandFilter("");
    if (setSewaFilter) setSewaFilter("");
    if (setComputerFilter) setComputerFilter("Semua");
    if (setPrinterFilter) setPrinterFilter("Semua");
  };

  const handleNavClick = (targetView) => {
    resetFilters();
    setView(targetView);
    if (window.innerWidth < 768) {
      closeMenu();
    }
  };

  const handleStartNew = () => {
    resetFilters();
    if (startNewDocument) startNewDocument();
    if (window.innerWidth < 768) {
      closeMenu();
    }
  };

  const activeCategoryConfig = NAV_CATEGORIES.find((c) => c.id === activeRailCategory) || NAV_CATEGORIES[0];

  const renderNavItems = (items, isMobile = false) => {
    return items.map((item) => {
      if (item.adminOnly && !isAdmin) return null;

      if (item.isGroup) {
        return <NavGroup key={item.id} item={item} view={view} isOpen={!!openGroups[item.id]} onToggle={() => toggleGroup(item.id)} onSelect={handleNavClick} isMobile={isMobile} />;
      }

      const isActive = item.isActive ? item.isActive(view) : view === item.id;
      const onClick = item.isStartNew ? handleStartNew : () => handleNavClick(item.id);

      return <NavItem key={item.id} item={item} isActive={isActive} onClick={onClick} isMobile={isMobile} />;
    });
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-30 print:hidden shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center">
            <List className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Box className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">LogistikKu</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-500 dark:text-amber-400 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
          <NotificationBell
            printers={printers}
            computers={computers}
            buildingLands={buildingLands}
            buildingSewas={buildingSewas}
            setView={setView}
            setPrinterSearch={setPrinterSearch}
            setComputerSearch={setComputerSearch}
            setLandSearch={setLandSearch}
            setSewaSearch={setSewaSearch}
            setPrinterFilter={setPrinterFilter}
            setComputerFilter={setComputerFilter}
            setLandFilter={setLandFilter}
            setSewaFilter={setSewaFilter}
            isMobile={true}
          />
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40 print:hidden transition-opacity" onClick={closeMenu} />}

      {/* NARROW ICON RAIL (DESKTOP SISI PALING KIRI - HIJAU PEGADAIAN) */}
      <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-20 bg-[#00753A] text-white flex-col items-center py-4 z-50 print:hidden shadow-md border-r border-[#005c2e]">
        {/* Toggle Hamburger Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 text-emerald-100 hover:text-white hover:bg-[#005c2e] rounded-xl transition-all cursor-pointer mb-6 active:scale-95"
          title={isSidebarOpen ? "Sembunyikan Menu" : "Tampilkan Menu"}
        >
          <List className="w-6 h-6" />
        </button>

        {/* Rail Menu Items Vertical Stack */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {NAV_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeRailCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveRailCategory(cat.id);
                  if (cat.id === "home") handleNavClick("dashboard");
                  if (!isSidebarOpen) setIsSidebarOpen(true);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold gap-1 transition-all cursor-pointer w-16 py-2.5 ${
                  isSelected ? "bg-white text-[#00753A] shadow-md font-extrabold scale-105" : "text-emerald-100/90 hover:text-white hover:bg-[#005c2e]"
                }`}
                title={cat.label}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] leading-tight text-center">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN SUB-MENU SIDEBAR PANEL (DRAWER MOBILE & DESKTOP) */}
      <aside
        className={`fixed top-0 left-0 md:left-20 h-screen w-72 md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 print:hidden flex flex-col z-50 md:z-40 shadow-2xl md:shadow-xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:-translate-x-full"
        }`}
      >
        {/* Header Drawer LogistikKu */}
        <div className="flex items-center justify-between px-5 h-16 md:h-20 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#00753A] text-white p-1.5 rounded-lg">
              <Box className="w-5 h-5 shrink-0" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">LogistikKu</span>
          </div>

          <button onClick={closeMenu} className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-menu Content Scrollable */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar text-xs font-semibold">
          {/* TAMPILAN MOBILE: ACCORDION VERTICAL (md:hidden) */}
          <div className="md:hidden space-y-2.5">
            {NAV_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isOpen = !!openMobileCategories[cat.id];
              return (
                <div key={cat.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs">
                  <button onClick={() => toggleMobileCategory(cat.id)} className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#00753A] dark:text-emerald-400 shrink-0" />
                      <span className="text-xs">{cat.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#00753A]" : ""}`} />
                  </button>
                  {isOpen && <div className="p-2 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">{renderNavItems(cat.items, true)}</div>}
                </div>
              );
            })}
          </div>

          {/* TAMPILAN DESKTOP: SINGLE CATEGORY PANEL (hidden md:block) */}
          <div className="hidden md:block">
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00753A] dark:text-emerald-400">{activeCategoryConfig.categoryTitle}</div>
              {renderNavItems(activeCategoryConfig.items, false)}
            </div>
          </div>
        </nav>

        {/* Bottom Section Drawer (Footer) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium">© 2026 Departemen Logistik</p>
        </div>
      </aside>
    </>
  );
}
