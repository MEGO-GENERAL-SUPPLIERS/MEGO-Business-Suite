import { 
  Home, BarChart3, FileText, Users, Settings, Code, Folder,
  Mail, Shield, Bell, HelpCircle, Info, GitBranch
} from "lucide-react";
import type { LucideProps } from 'lucide-react';

export interface MenuItem {
  id: string;
  icon: React.ComponentType<LucideProps>;
  label: string;
  submenu?: MenuItem[];
  route?: string; 
}

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    icon: Home,
    label: 'Dashboard',
    submenu: [
      { id: 'overview', icon: BarChart3, label: 'Overview', route: '/dashboard/overview' },
      { id: 'analytics', icon: BarChart3, label: 'Analytics', route: '/dashboard/analytics' },
      {
        id: 'reports',
        icon: FileText,
        label: 'Reports',
        submenu: [
          { id: 'sales-reports', icon: BarChart3, label: 'Sales Reports', route: '/dashboard/reports/sales' },
          { id: 'user-reports', icon: Users, label: 'User Reports', route: '/dashboard/reports/users' },
          { id: 'custom-reports', icon: FileText, label: 'Custom Reports', route: '/dashboard/reports/custom' }
        ]
      }
    ]
  },
  {
    id: 'users',
    icon: Users,
    label: 'Users',
    submenu: [
      { id: 'all-users', icon: Users, label: 'All Users', route: '/users/all' },
      { id: 'permissions', icon: Settings, label: 'Permissions', route: '/users/permissions' },
      {
        id: 'teams',
        icon: Users,
        label: 'Teams',
        submenu: [
          { id: 'engineering', icon: Code, label: 'Engineering', route: '/users/teams/engineering' },
          { id: 'design', icon: Folder, label: 'Design', route: '/users/teams/design' },
          { id: 'marketing', icon: Mail, label: 'Marketing', route: '/users/teams/marketing' }
        ]
      }
    ]
  },
  {
    id: 'messages',
    icon: Mail,
    label: 'Messages',
    submenu: [
      { id: 'inbox', icon: Mail, label: 'Inbox', route: '/messages/inbox' },
      { id: 'sent', icon: Mail, label: 'Sent', route: '/messages/sent' },
      { id: 'drafts', icon: FileText, label: 'Drafts', route: '/messages/drafts' }
    ]
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    submenu: [
      {
        id: 'company', icon: Home, label: 'Company', submenu: [
          { id: 'company-info', icon: Home, label: 'Company Info', route: '/settings/company-info' },
          { id: 'company-branches', icon: GitBranch, label: 'Company Branches', route: '/settings/company-branches' }
        ]
      },
      { id: 'general', icon: Settings, label: 'General', route: '/settings/general' },
      { id: 'security', icon: Shield, label: 'Security', route: '/settings/security' },
      { id: 'notifications', icon: Bell, label: 'Notifications', route: '/settings/notifications' }
    ]
  }
];

export const footerMenuItems: MenuItem[] = [
  { id: 'preferences', icon: Settings, label: 'Preferences', route: '/settings/general/preferences' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support', route: '/help' },
  { id: 'about', icon: Info, label: 'About App', route: '/about' }
];

/**
 * Flattens menuItems/footerMenuItems (recursing into submenus) into a flat
 * list of leaf items only — items with a route, no submenu.
 */
function flattenLeaves(items: MenuItem[], acc: MenuItem[] = []): MenuItem[] {
  for (const item of items) {
    if (item.submenu && item.submenu.length > 0) {
      flattenLeaves(item.submenu, acc);
    } else if (item.route) {
      acc.push(item);
    }
  }
  return acc;
}

export const flatMenuItems: MenuItem[] = [
  ...flattenLeaves(menuItems),
  ...flattenLeaves(footerMenuItems),
];

// id -> route lookup, used by useAppNavigation
export const ROUTE_MAP: Record<string, string> = Object.fromEntries(
  flatMenuItems.map((item) => [item.id, item.route as string])
);