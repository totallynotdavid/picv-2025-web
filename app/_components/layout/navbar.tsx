'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
      document.body.classList.remove('overflow-hidden');
    };

    handleRouteChange();
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.classList.toggle('overflow-hidden');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link className="flex items-center gap-2" href="/">
            <Image alt="Logo" height={32} priority src="/wave.svg" width={32} />
            <span className="text-xl font-bold text-gray-900">TSDHN</span>
          </Link>

          <div className="hidden md:flex md:space-x-8">
            <Link
              className="text-gray-700 hover:text-gray-900 transition-colors"
              href="/"
            >
              Inicio
            </Link>
          </div>

          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900"
              onClick={toggleMenu}
            >
              <svg
                className={clsx(
                  'h-6 w-6 transition-transform',
                  isOpen && 'rotate-180',
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                ) : (
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
