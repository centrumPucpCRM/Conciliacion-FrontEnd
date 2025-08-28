import React, { useMemo, useCallback } from 'react';

const DEFAULT_TABS = [
  { id: 'solicitudes',   label: 'Solicitudes' },
  { id: 'mesConciliado', label: 'Conciliación' },
  { id: 'mesesPasados',  label: 'Revisión' }
];

const Tabs = ({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  className = '',
}) => {
  const visibleTabs = useMemo(() => tabs.filter(t => !t.hidden), [tabs]);

  const currentIndex = useMemo(
    () => Math.max(0, visibleTabs.findIndex(t => t.id === activeTab)),
    [visibleTabs, activeTab]
  );

  const focusTabByIndex = useCallback((idx) => {
    const btn = document.querySelector(`[data-tab-idx="${idx}"]`);
    if (btn) btn.focus();
  }, []);

  const move = useCallback((dir) => {
    if (!visibleTabs.length) return;
    let i = currentIndex;
    for (let step = 0; step < visibleTabs.length; step++) {
      i = (i + dir + visibleTabs.length) % visibleTabs.length;
      if (!visibleTabs[i].disabled) {
        onTabChange?.(visibleTabs[i].id);
        focusTabByIndex(i);
        break;
      }
    }
  }, [currentIndex, visibleTabs, onTabChange, focusTabByIndex]);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const first = visibleTabs.findIndex(t => !t.disabled);
      if (first !== -1) {
        onTabChange?.(visibleTabs[first].id);
        focusTabByIndex(first);
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = [...visibleTabs].reverse().findIndex(t => !t.disabled);
      if (last !== -1) {
        const idx = visibleTabs.length - 1 - last;
        onTabChange?.(visibleTabs[idx].id);
        focusTabByIndex(idx);
      }
    }
  }, [move, visibleTabs, onTabChange, focusTabByIndex]);

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-12 mt-4 ${className}`}>
      <div className="overflow-x-auto">
        <div
          role="tablist"
          aria-label="Pestañas"
          className="inline-flex bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
          onKeyDown={onKeyDown}
        >
          {visibleTabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const base =
              'px-6 py-2 text-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white';
            const state = tab.disabled
              ? 'text-gray-300 cursor-not-allowed'
              : isActive
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50';
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                data-tab-idx={idx}
                onClick={() => !tab.disabled && onTabChange?.(tab.id)}
                className={`${base} ${state}`}
                title={tab.title || tab.label}
              >
                <span className="inline-flex items-center gap-2">
                  {tab.icon && <span className="inline-flex">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {typeof tab.badge === 'number' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tabs;
