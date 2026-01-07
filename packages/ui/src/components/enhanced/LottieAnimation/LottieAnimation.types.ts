// Types for LottieAnimation component
export type LottieSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface LottieAnimationProps {
  src: string | object; // Path to .json animation file or JSON object
  size?: LottieSize;
  autoplay?: boolean;
  loop?: boolean;
  onComplete?: () => void;
  speed?: number;
  direction?: 1 | -1;
  className?: string;
  style?: React.CSSProperties;
  background?: 'glass' | 'solid' | 'none';
  glow?: boolean;
  interactive?: boolean;
  onSegmentComplete?: (segment: number) => void;
  segments?: [number, number];
}
