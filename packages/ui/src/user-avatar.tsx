"use client";

import * as React from 'react';
import { Box, Stack } from '@mui/material';
import { Avatar } from './components/data-display/Avatar';
import { Button } from './components/form/Button';
import { Text } from './components/typography/Text';
import { Card } from './components/layout/Card';

/**
 * Generate initials from a name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0]?.substring(0, 2).toUpperCase() ?? "";
  }
  return (
    (parts[0]?.charAt(0) ?? "") + (parts[parts.length - 1]?.charAt(0) ?? "")
  ).toUpperCase();
}

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * User avatar using UI package Avatar component
 */
export function UserAvatar({
  src,
  name,
  size = 'md',
  onClick,
  interactive = false,
}: UserAvatarProps): React.ReactElement {
  const fallbackText = name ? getInitials(name) : "?";

  return (
    <Avatar
      src={src ?? undefined}
      alt={name ?? "User avatar"}
      fallback={fallbackText}
      size={size}
      variant="circle"
      interactive={interactive || !!onClick}
      onClick={onClick}
    />
  );
}

export interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
}

/**
 * User menu with avatar, info, and sign out button
 */
export function UserMenu({ user, onSignOut }: UserMenuProps): React.ReactElement {
  return (
    <Card variant="elevated" borderRadius="md">
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <UserAvatar
            src={user.image}
            name={user.name}
            size="md"
          />

          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            <Text weight="semibold" size="sm">
              {user.name ?? "User"}
            </Text>
            {user.email && (
              <Text color="secondary" size="xs">
                {user.email}
              </Text>
            )}
          </Stack>

          <Button
            variant="outline"
            color="danger"
            size="sm"
            onClick={onSignOut}
          >
            Sign out
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}
