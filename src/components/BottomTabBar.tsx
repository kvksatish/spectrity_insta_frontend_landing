'use client';

import { Waves, Search, Sparkles, Bell, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TabItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const tabs: TabItem[] = [
  {
    icon: Search,
    label: 'Explore',
    href: '/spectrity/explore',
  },
  {
    icon: Waves,
    label: 'Flow',
    href: '/spectrity/flow',
  },
  {
    icon: Sparkles,
    label: 'Essence',
    href: '/spectrity/essence',
  },
  {
    icon: Bell,
    label: 'Activity',
    href: '/spectrity/activity',
  },
  {
    icon: User,
    label: 'Profile',
    href: '/spectrity/profile',
  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                'hover:text-foreground',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-all',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                'text-xs font-medium',
                isActive && 'font-semibold'
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
