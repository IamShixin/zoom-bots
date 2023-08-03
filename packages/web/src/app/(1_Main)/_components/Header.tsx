'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import { siteConfig } from '@/config/site';
import { Icons } from '@/components/ui/icons';

const navigation = [
  { name: 'Translator', href: '/translator' },
  // { name: 'History', href: '/history' },
  { name: 'Billing', href: '/billing' },
];

export function Header({ userComponent }: any) {
  const pathname = usePathname();

  return (
    <header className="border-slate-6 bg-slate-1/5 border-b px-4 backdrop-blur-lg">
      <nav
        className="mx-auto flex items-center  justify-between px-6 py-3 lg:px-8 lg:py-0"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/translator" className="-m-1.5 p-1.5">
            <span className="sr-only">{siteConfig.name}</span>
            <div className="flex gap-2">
              <Icons.myLogo />
              <span className="body-semibold">{siteConfig.name}</span>
            </div>
          </Link>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'body  text-slate-11 py-3',
                pathname === item.href ? 'border-crimson-9 border-b' : '',
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-5">
          {userComponent}
        </div>
      </nav>
    </header>
  );
}
