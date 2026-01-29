import type { Meta, StoryObj } from '@storybook/react'
import { Button } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['default', 'primary', 'dashed', 'link', 'text'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'middle', 'large'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Primary: Story = {
  args: {
    type: 'primary',
    children: 'Primary Button',
  },
}

export const WithIcon: Story = {
  args: {
    type: 'primary',
    icon: <PlusOutlined />,
    children: 'Ajouter',
  },
}

export const Loading: Story = {
  args: {
    type: 'primary',
    loading: true,
    children: 'Loading...',
  },
}

export const Danger: Story = {
  args: {
    type: 'primary',
    danger: true,
    children: 'Delete',
  },
}
