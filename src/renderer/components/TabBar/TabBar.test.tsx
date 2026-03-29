import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TabBar } from './index'
import { useTabsStore } from '@/features/tabs/tabs.store'

beforeEach(() => {
  useTabsStore.setState({ tabs: [], activeTabId: null })
})

describe('TabBar', () => {
  it('renders new tab button', () => {
    render(<TabBar />)
    // Plus button is always visible
    expect(document.querySelector('button')).toBeTruthy()
  })

  it('renders tabs from store', () => {
    useTabsStore.getState().openTab({ name: 'Get Users', method: 'GET' })
    render(<TabBar />)
    expect(screen.getByText('Get Users')).toBeTruthy()
    expect(screen.getByText('GET')).toBeTruthy()
  })

  it('opens a new tab on plus click', () => {
    render(<TabBar />)
    const plusBtn = document.querySelector('button')!
    fireEvent.click(plusBtn)
    expect(useTabsStore.getState().tabs).toHaveLength(1)
  })

  it('sets active tab on click', () => {
    useTabsStore.getState().openTab({ name: 'Tab 1' })
    useTabsStore.getState().openTab({ name: 'Tab 2' })
    const { tabs } = useTabsStore.getState()
    // Set first tab active
    useTabsStore.getState().setActiveTab(tabs[0].id)
    render(<TabBar />)
    expect(useTabsStore.getState().activeTabId).toBe(tabs[0].id)
  })
})
