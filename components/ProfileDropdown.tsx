import React, { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { Settings, CreditCard, LogOut, User } from "lucide-react";

interface Profile {
    name: string;
    email: string;
    avatar: string;
    subscription?: string;
    model?: string;
}

interface MenuItem {
    label: string;
    value?: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
    action?: () => void;
}

const SAMPLE_PROFILE_DATA: Profile = {
    name: "Eugene An",
    email: "eugene@kokonutui.com",
    avatar: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/profile-mjss82WnWBRO86MHHGxvJ2TVZuyrDv.jpeg",
    subscription: "PRO",
    model: "Gemini 2.0 Flash",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: Profile;
    onLogout?: () => void;
}

export default function ProfileDropdown({
    data = SAMPLE_PROFILE_DATA,
    className,
    onLogout,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const menuItems: MenuItem[] = [
        {
            label: "Profile",
            href: "#",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Subscription",
            value: data.subscription,
            href: "#",
            icon: <CreditCard className="w-4 h-4" />,
        },
        {
            label: "Settings",
            href: "#",
            icon: <Settings className="w-4 h-4" />,
        },
    ];

    return (
        <div className={cn("relative", className)} {...props} ref={dropdownRef}>
             <div className="group relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                    className="flex w-full items-center gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 hover:shadow-sm transition-all duration-200 focus:outline-none"
                >
                    <div className="text-left flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight truncate">
                            {data.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 tracking-tight leading-tight truncate">
                            {data.email}
                        </div>
                    </div>
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900">
                                <img
                                    src={data.avatar}
                                    alt={data.name}
                                    width={36}
                                    height={36}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </button>

                {/* Bending line indicator on the right */}
                <div
                    className={cn(
                        "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none",
                        isOpen
                            ? "opacity-100"
                            : "opacity-60 group-hover:opacity-100"
                    )}
                >
                    <svg
                        width="12"
                        height="24"
                        viewBox="0 0 12 24"
                        fill="none"
                        className={cn(
                            "transition-all duration-200",
                            isOpen
                                ? "text-blue-500 dark:text-blue-400 scale-110"
                                : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                        )}
                        aria-hidden="true"
                    >
                        <path
                            d="M2 4C6 8 6 16 2 20"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </svg>
                </div>

                {isOpen && (
                    <div
                        className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-xl shadow-zinc-900/5 dark:shadow-zinc-950/20 z-50 origin-bottom-left animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200"
                    >
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center p-3 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/50"
                                    target={item.external ? "_blank" : undefined}
                                    rel={item.external ? "noopener noreferrer" : undefined}
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        {item.icon}
                                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight whitespace-nowrap group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className="flex-shrink-0 ml-auto">
                                        {item.value && (
                                            <span
                                                className={cn(
                                                    "text-xs font-medium rounded-md py-1 px-2 tracking-tight",
                                                    item.label === "Model"
                                                        ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border border-blue-500/10"
                                                        : "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 border border-purple-500/10"
                                                )}
                                            >
                                                {item.value}
                                            </span>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>

                        <div className="my-3 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

                        <button
                            type="button"
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 p-3 duration-200 bg-red-500/10 rounded-xl hover:bg-red-500/20 cursor-pointer border border-transparent hover:border-red-500/30 hover:shadow-sm transition-all group"
                        >
                            <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                            <span className="text-sm font-medium text-red-500 group-hover:text-red-600">
                                Sign Out
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
