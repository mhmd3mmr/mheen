import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation: Link, usePathname, useRouter, etc.
 * Use these instead of next/link and next/navigation for i18n routes.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
