import { useState } from 'react'
import type { ReactNode } from 'react'
import './Tabs.css'

// Generic, reusable tab component. Pass it a list of tabs (each with a
// unique key, a label for the button, and the content to show when that tab
// is active). It manages which tab is selected internally, always starting
// on the first one. The optional `onChange` callback is only needed by
// pages that want to react to the user switching tabs (e.g. to cancel an
// in-progress edit on the tab they're leaving).

export interface TabItem {
  key: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  onChange?: (key: string) => void
}

function Tabs({ tabs, onChange }: TabsProps) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key)

  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0]

  function handleTabButtonClick(key: string) {
    setActiveKey(key)
    onChange?.(key)
  }

  return (
    <div className="tabs">
      <div className="tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={tab.key === activeTab?.key}
            className={`tab-button ${tab.key === activeTab?.key ? 'active' : ''}`}
            onClick={() => handleTabButtonClick(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel">
        {activeTab?.content}
      </div>
    </div>
  )
}

export default Tabs
