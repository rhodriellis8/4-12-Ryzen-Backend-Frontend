import * as React from "react";
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
    view?: string;
    icon: React.ReactNode;
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
    onNavigate: (view: string) => void;
    onLogout: () => void;
}

export default function ProfileDropdown({
    data = SAMPLE_PROFILE_DATA,
    className,
    onNavigate,
    onLogout,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems: MenuItem[] = [
        {
            label: "Profile",
            view: "profile",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Subscription",
            view: "subscription",
            value: data.subscription,
            icon: <CreditCard className="w-4 h-4" />,
        },
        {
            label: "Settings",
            view: "settings",
            icon: <Settings className="w-4 h-4" />,
        },
    ];

    const handleItemClick = (item: MenuItem) => {
        if (item.view) {
            onNavigate(item.view);
        }
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)} {...props} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-lg bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full text-left"
            >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white dark:bg-zinc-900 shrink-0">
                    <img 
                        src={data.avatar} 
                        alt={data.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`;
                        }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                        {data.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate leading-tight mt-0.5">
                        {data.email}
                    </div>
                </div>
                
                {/* Bending line indicator (simplified as chevron) */}
                <div className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")}>
                   <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-zinc-400">
                       <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-xl shadow-zinc-900/5 dark:shadow-zinc-950/20 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-bottom-left">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleItemClick(item)}
                                className="w-full flex items-center p-3 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/50"
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    {item.icon}
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight whitespace-nowrap group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
                                        {item.label}
                                    </span>
                                </div>
                                {item.value && (
                                    <span className={cn(
                                        "text-xs font-medium rounded-md py-1 px-2 tracking-tight",
                                        "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 border border-purple-500/10"
                                    )}>
                                        {item.value}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="my-3 bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800 h-px" />

                    <button
                        type="button"
                        onClick={() => {
                            onLogout();
                            setIsOpen(false);
                        }}
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
    );
}
