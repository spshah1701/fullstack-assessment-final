// Reusable Tabs component with animated transitions
import { motion } from "framer-motion";
import type { Tab } from "../../types/filters";

/*
Tab option interface for the Tabs component
value: Tab value ("Users" or "Posts")
label: optional display label (defaults to value if not provided)
*/
export interface TabOption {
    value: Tab;
    label?: string; // Optional - if not provided, uses value as label
}

interface TabsProps {
    activeTab: Tab;
    tabs: readonly TabOption[];
    onTabChange: (tab: Tab) => void;
    className?: string;
}

export function Tabs({
    activeTab,
    tabs,
    onTabChange,
    className = "",
}: TabsProps) {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const tabWidth = 100 / tabs.length;

    return (
        <div className={`flex w-full justify-center lg:justify-start ${className}`}>
            <div className="relative flex h-12 items-center bg-gray-200 rounded-xl w-full sm:max-w-[420px] sm:w-[420px] shadow-sm border border-gray-300 overflow-hidden">
                {/* Animated background slider */}
                <motion.div
                    className="absolute top-1 bottom-1 rounded-lg bg-blue-500 shadow-md"
                    initial={false}
                    animate={{
                        left: `${activeIndex * tabWidth}%`,
                        right: `${(tabs.length - activeIndex - 1) * tabWidth}%`,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
                />

                {/* Tab buttons */}
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => onTabChange(tab.value)}
                            className="relative z-10 flex-1 h-12 rounded-lg text-xl sm:text-2xl font-medium"
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="tabHighlight"
                                    className="absolute inset-0 rounded-lg bg-sky-700 shadow-md"
                                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
                                />
                            )}
                            <span
                                className={`relative z-10 transition-colors duration-150 delay-75 font-bold ${isActive ? "text-white" : "text-gray-700"
                                    }`}
                            >
                                {tab.label ?? tab.value}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

