/**
 * Style configuration for Bingo Card components.
 * Used to define custom themes for premium styling.
 */
export interface BingoCardStyleConfig {
  /** Unique identifier for the style */
  id: string;
  /** Display name for the style */
  name: string;
  /** Card container styles */
  card: {
    /** Background color or gradient */
    background: string;
    /** Border radius value */
    borderRadius: string;
    /** Box shadow value */
    shadow: string;
    /** Gap between cells */
    gap: string;
  };
  /** Cell styles */
  cell: {
    /** Background color for unmarked cells */
    background: string;
    /** Background color for marked cells */
    backgroundMarked: string;
    /** Border color */
    borderColor: string;
    /** Border radius value */
    borderRadius: string;
    /** Text color for unmarked cells */
    textColor: string;
    /** Text color for marked cells */
    textColorMarked: string;
    /** Font size */
    fontSize: string;
    /** Font weight */
    fontWeight: string;
  };
  /** Free space cell styles */
  freeSpace: {
    /** Background color */
    background: string;
    /** Text color */
    textColor: string;
    /** Label text (e.g., "FREE", "⭐", "GRÁTIS") */
    label: string;
  };
}
