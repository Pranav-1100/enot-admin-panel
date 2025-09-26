import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Brands', href: '/brands', icon: BuildingStorefrontIcon },
  { name: 'Orders', href: '/orders', icon: ShoppingBagIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Reviews', href: '/reviews', icon: ChatBubbleBottomCenterTextIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

function SidebarContent() {
  const router = useRouter();

  const isActive = (href) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 bg-blue-600">
        <div className="flex-shrink-0">
          <span className="text-2xl font-bold text-white">E°</span>
        </div>
        <div className="ml-3">
          <span className="text-white text-sm font-medium">ENOT Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              isActive(item.href)
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200'
            )}
          >
            <item.icon
              className={cn(
                isActive(item.href) ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                'mr-3 h-6 w-6 flex-shrink-0'
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 bg-gray-800 p-4">
        <div className="text-xs text-gray-400 text-center">
          E° ENOT Admin Panel v1.0.0
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <SidebarContent />
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}