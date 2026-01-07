import React from 'react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category?: string;
  action: () => void;
  keywords?: string[];
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
  width?: string;
  maxHeight?: string;
  showRecent?: boolean;
  recentCommands?: string[];
  onCommandExecute?: (command: Command) => void;
}
