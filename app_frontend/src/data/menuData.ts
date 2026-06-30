import { 
  Home,
  BarChart3,
  FileText, 
  Users,
  Settings,
  Code,
  Folder,
  Mail,
  Package,
  Shield,
  Bell,
  HelpCircle,
  Keyboard
} from "lucide-react";
import type { LucideProps } from 'lucide-react';

export interface MenuItem {
  id: string;
  icon: React.ComponentType<LucideProps>;
  label: string;
  submenu?: MenuItem[];
}

export const menuItems = [
  {
    id: 'dashboard',
    icon: Home,
    label: 'Dashboard',
    submenu: [
      { id: 'overview', icon: BarChart3, label: 'Overview' },
      { id: 'analytics', icon: BarChart3, label: 'Analytics' },
      {
        id: 'reports',
        icon: FileText,
        label: 'Reports',
        submenu: [
          { id: 'sales-reports', icon: BarChart3, label: 'Sales Reports' },
          { id: 'user-reports', icon: Users, label: 'User Reports' },
          { id: 'custom-reports', icon: FileText, label: 'Custom Reports' }
        ]
      }
    ]
  },
  {
    id: 'users',
    icon: Users,
    label: 'Users',
    submenu: [
      { id: 'all-users', icon: Users, label: 'All Users' },
      { id: 'permissions', icon: Settings, label: 'Permissions' },
      {
        id: 'teams',
        icon: Users,
        label: 'Teams',
        submenu: [
          { id: 'engineering', icon: Code, label: 'Engineering' },
          { id: 'design', icon: Folder, label: 'Design' },
          { id: 'marketing', icon: Mail, label: 'Marketing' }
        ]
      }
    ]
  },
  {
    id: 'content',
    icon: FileText,
    label: 'Content',
    submenu: [
      { id: 'posts', icon: FileText, label: 'Posts' },
      { id: 'media', icon: Package, label: 'Media' },
      { id: 'pages', icon: FileText, label: 'Pages' }
    ]
  },
  {
    id: 'messages',
    icon: Mail,
    label: 'Messages',
    submenu: [
      { id: 'inbox', icon: Mail, label: 'Inbox' },
      { id: 'sent', icon: Mail, label: 'Sent' },
      { id: 'drafts', icon: FileText, label: 'Drafts' }
    ]
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    submenu: [
      { id: 'general', icon: Settings, label: 'General' },
      { id: 'security', icon: Shield, label: 'Security' },
      { id: 'notifications', icon: Bell, label: 'Notifications' }
    ]
  }
];

export const footerMenuItems = [
  { id: 'preferences', icon: Settings, label: 'Preferences' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  { id: 'shortcuts', icon: Keyboard, label: 'Keyboard Shortcuts' }
];