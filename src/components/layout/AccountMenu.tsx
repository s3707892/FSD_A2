import React, { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// dropdown in the navbar for account related actions
const AccountMenu = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const { currentUser, signOut } = useAuth()
    const email = currentUser?.email || 'User'

    const navigate = useNavigate()

    const toggleMenu = () => setIsOpen((value) => !value)
    const closeMenu = () => setIsOpen(false)

    const handleSignOut = () => {
       signOut();
       navigate('/signin', { state: { signedOut: true } });
    };

    // close the menu if user clicks outside or escape
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeMenu()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenu()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    return (
        <div ref={menuRef} className="relative inline-block text-left">
            <button
                type="button"
                onClick={toggleMenu}
                aria-haspopup="true"
                aria-expanded={isOpen}
                className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-100 hover:bg-gray-50"
            >
                Account
                <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
            </button>
            {/* Show dropdown menu if isOpen */}
            {isOpen && (
                <div
                    role="menu"
                    aria-orientation="vertical"
                    aria-label="Account options"
                    className="absolute left-0 z-10 mt-2 w-56 divide-y divide-gray-100 rounded-md bg-gray-200 shadow-xl outline-1 outline-black/5"
                >
                    <div className="px-4 py-3 text-sm text-gray-700">
                        Signed in as
                        <div className="font-semibold text-gray-900 truncate">{email}</div>
                    </div>

                    <div className="py-1">
                        {currentUser?.role === 'hirer' && (
                            <Link
                                to="/account"
                                onClick={closeMenu}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            >
                                View Account
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                closeMenu()
                                handleSignOut()
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
export default AccountMenu;