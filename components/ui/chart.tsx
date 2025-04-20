"use client"

import type * as React from "react"

interface ChartContainerProps {
  data: any[]
  xAxisKey: string
  categories: string[]
  colors: string[]
  yAxisWidth?: number
  showAnimation?: boolean
  children: React.ReactNode
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  xAxisKey,
  categories,
  colors,
  yAxisWidth = 40,
  showAnimation = false,
  children,
}) => {
  return <div>{children}</div>
}

export const ChartBars: React.FC = () => {
  return <div>ChartBars</div>
}

export const ChartBar: React.FC = () => {
  return <div>ChartBar</div>
}

export const ChartLine: React.FC = () => {
  return <div>ChartLine</div>
}

export const ChartTooltip: React.FC = () => {
  return <div>ChartTooltip</div>
}

export const ChartLegend: React.FC = () => {
  return <div>ChartLegend</div>
}

