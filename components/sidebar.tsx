'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getGroupsByMusicianId } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Home,
  Search,
  Users,
  Newspaper,
  MapPin,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: '/feed', label: 'Лента', icon: Newspaper },
  { href: '/search', label: 'Поиск', icon: Search },
  { href: '/groups', label: 'Группы', icon: Users },
  { href: '/venues', label: 'Учреждения', icon: MapPin },
  { href: '/ai-tags', label: 'Теги ИИ', icon: Sparkles },
  { href: '/recommendations', label: 'Рекомендации', icon: Star },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  
  const userGroups = currentUser ? getGroupsByMusicianId(currentUser.id) : [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-0 h-screen lg:h-[calc(100vh-4rem)] w-[280px] bg-sidebar border-r border-sidebar-border p-4 overflow-y-auto transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Mobile close button */}
        <div className="flex justify-end lg:hidden mb-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User profile shortcut */}
        <Link
          href="/profile"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors mb-4"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.instruments.join(', ')}
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1 mb-6">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              pathname === '/'
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Главная</span>
          </Link>
          
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-sidebar-border my-4" />

        {/* User's groups */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Мои группы
          </h3>
          {userGroups.length > 0 ? (
            <div className="space-y-1">
              {userGroups.map(group => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === `/groups/${group.id}`
                      ? 'bg-sidebar-accent'
                      : 'hover:bg-sidebar-accent'
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {group.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-sidebar-foreground truncate">{group.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-3 text-sm text-muted-foreground">
              Вы ещё не состоите в группах
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
