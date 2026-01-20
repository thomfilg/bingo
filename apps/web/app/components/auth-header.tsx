"use client";

import type { JSX } from "react";
import Link from "next/link";
import { useAuth, useSocialLogin } from "@repo/auth/hooks";
import { UserAvatar } from "@repo/ui/user-avatar";
import { Button } from "@repo/ui/form/Button";
import { Text } from "@repo/ui/typography/Text";
import { Skeleton } from "@repo/ui/layout/Skeleton";
import styles from "./auth-header.module.css";

export function AuthHeader(): JSX.Element {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useSocialLogin();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Bingo
        </Link>

        <nav className={styles.nav}>
          {isLoading ? (
            <Skeleton variant="circular" width={32} height={32} />
          ) : isAuthenticated && user ? (
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <UserAvatar src={user.image} name={user.name} size="sm" />
                <Text size="sm" weight="medium">{user.name}</Text>
              </div>
              <Button
                variant="ghost"
                color="neutral"
                size="sm"
                onClick={() => logout("/")}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              variant="solid"
              color="primary"
              size="sm"
              onClick={() => window.location.href = '/login'}
            >
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
