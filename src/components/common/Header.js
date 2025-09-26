import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function Header({ setSidebarOpen }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <h1 className="text-2xl font-semibold text-gray-900">
              E° ENOT Admin
            </h1>
          </div>
        </div>

        <div className="ml-4 flex items-center md:ml-6">
          {/* Notifications */}
          <button
            type="button"
            className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <Menu as="div" className="ml-3 relative">
            <div>
              <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">Open user menu</span>
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="ml-3 text-left">
                  <div className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.userType}
                  </div>
                </div>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={cn(
                        active ? 'bg-gray-100' : '',
                        'flex w-full px-4 py-2 text-sm text-gray-700 items-center'
                      )}
                    >
                      <UserCircleIcon className="mr-3 h-4 w-4" />
                      Your Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={cn(
                        active ? 'bg-gray-100' : '',
                        'flex w-full px-4 py-2 text-sm text-gray-700 items-center'
                      )}
                    >
                      <CogIcon className="mr-3 h-4 w-4" />
                      Settings
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={cn(
                        active ? 'bg-gray-100' : '',
                        'flex w-full px-4 py-2 text-sm text-gray-700 items-center'
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}