import type { CSSProperties } from 'react';

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'scatter' | 'composed';

export interface ChartDataPoint {
  [key: string]: string | number | null;
}

export interface ChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  type?: 'line' | 'bar' | 'area';
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  strokeDasharray?: string;
  dot?: boolean;
  activeDot?: boolean;
  label?: boolean;
  stackId?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  series?: ChartSeries[];
  type?: ChartType;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated' | 'minimal' | 'neon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  height?: number;
  width?: number | string;
  glow?: boolean;
  pulse?: boolean;
  glass?: boolean;
  gradient?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
  subtitle?: string;
  xAxisKey?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showCartesianGrid?: boolean;
  animate?: boolean;
  animationDuration?: number;
  onClick?: (data: ChartDataPoint) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  colors?: string[];
  curved?: boolean;
  stacked?: boolean;
  percentage?: boolean;
  showValues?: boolean;
  responsive?: boolean;
  innerRadius?: number;
  centerLabel?: string | { label: string; value: string | number };
  'data-testid'?: string;
}