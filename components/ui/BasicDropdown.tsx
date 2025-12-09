"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const ROTATION_ANGLE_OPEN = 180;

export type DropdownItem = {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
};

export type BasicDropdownProps = {
  label: string;
  items: DropdownItem[];
  onChange?: (item: DropdownItem) => void;
  className?: string;
  selectedValue?: string | number | null;
};

export default function BasicDropdown({
  label,
  items,
  onChange,
  className = "",
  selectedValue,
}: BasicDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DropdownItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync selectedValue with internal state
  useEffect(() => {
    if (selectedValue !== undefined) {
      if (selectedValue === "" || selectedValue === null) {
        setSelectedItem(null);
      } else {
        const item = items.find((i) => i.id === selectedValue);
        if (item) setSelectedItem(item);
      }
    }
  }, [selectedValue, items]);

  const handleItemSelect = (item: DropdownItem) => {
    setSelectedItem(item);
    setIsOpen(false);
    onChange?.(item);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="block truncate text-sm text-zinc-700 dark:text-zinc-300">
          {selectedItem ? (
            <span className="flex items-center gap-2">
              {selectedItem.icon && <span>{selectedItem.icon}</span>}
              {selectedItem.label}
            </span>
          ) : (
            label
          )}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? ROTATION_ANGLE_OPEN : 0 }}
          transition={{ duration: 0.2 }}
          className="text-zinc-500"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            className="absolute left-0 z-50 mt-1 w-full min-w-[140px] origin-top rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
            exit={{
              opacity: 0,
              y: -10,
              scaleY: 0.8,
              transition: { duration: 0.2 },
            }}
            initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
          >
            <ul aria-labelledby="dropdown-button" className="py-1 max-h-[240px] overflow-y-auto">
              {items.map((item) => (
                <motion.li
                  animate={{ opacity: 1, x: 0 }}
                  className="block"
                  exit={{ opacity: 0, x: -10 }}
                  initial={{ opacity: 0, x: -10 }}
                  key={item.id}
                  role="menuitem"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  whileHover={{ x: 5 }}
                >
                  <button
                    className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 ${
                      selectedItem?.id === item.id
                        ? "font-bold text-zinc-900 dark:text-white"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                    onClick={() => handleItemSelect(item)}
                    type="button"
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}

                    {selectedItem?.id === item.id && (
                      <motion.span
                        animate={{ scale: 1 }}
                        className="ml-auto"
                        initial={{ scale: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <svg
                          className="h-4 w-4 text-zinc-900 dark:text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <title>Selected</title>
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </motion.span>
                    )}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
