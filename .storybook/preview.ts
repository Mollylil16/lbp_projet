import type { Preview } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import frFR from 'antd/locale/fr_FR'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import '../src/index.css'
import '../src/styles/responsive.css'
import '../src/styles/dark-mode.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ConfigProvider locale={frFR}>
            <BrowserRouter>
              <Story />
            </BrowserRouter>
          </ConfigProvider>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  ],
}

export default preview
