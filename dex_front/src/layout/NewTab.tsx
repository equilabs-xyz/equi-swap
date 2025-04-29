import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

import SettingsLayout from "@/features/settings/Settings.tsx";
import SwapLayout from "@/features/swap/Swap.tsx";
import WalletLayout from "@/features/wallet/Wallet.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const TAB_STORAGE_KEY = "lastActiveTab";

export default function TabbedLayout() {
    const [tab, setTab] = useState("swap");
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
        if (savedTab) setTab(savedTab);
    }, []);

    const handleTabChange = (value: string) => {
        setTab(value);
        localStorage.setItem(TAB_STORAGE_KEY, value);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
        <Tabs value={tab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-screen">
        {isMobile ? <MobileTabBar /> : <DesktopTabBar />}

        <div className={`${
        isMobile ? "flex-1 px-4 pt-6 pb-24 space-y-6" : "max-w-2xl mx-auto px-4 pt-10 space-y-6"
    }`}>
    <TabsContent value="swap">
        <SwapLayout />
        </TabsContent>
        <TabsContent value="wallet">
        <WalletLayout />
        </TabsContent>
        <TabsContent value="settings">
        <SettingsLayout />
        </TabsContent>
        </div>
        </Tabs>
        </div>
);
}

function MobileTabBar() {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] items-center">
        <div className="rounded-2xl shadow-md bg-white dark:bg-zinc-900 border p-2.5 items-center">
        <TabsList className="grid grid-cols-3 w-full bg-white dark:bg-zinc-900 rounded-xl">
        <TabsTrigger value="swap" className="items-center rounded-xl px-3 py-2 data-[state=active]:bg-muted">Swap</TabsTrigger>
        <TabsTrigger value="wallet" className="items-center rounded-xl px-3 py-2 data-[state=active]:bg-muted">Wallet</TabsTrigger>
        <TabsTrigger value="settings" className="items-center rounded-xl px-3 py-2 data-[state=active]:bg-muted">Settings</TabsTrigger>
        </TabsList>
        </div>
        </div>
);
}

function DesktopTabBar() {
    return (
        <div className="max-w-2xl mx-auto px-4 pt-10 space-y-6">
        <TabsList className="grid grid-cols-3 w-full bg-white dark:bg-zinc-900 rounded-xl mb-6">
        <TabsTrigger value="swap" className="items-center rounded-xl px-3 py-2 data-[state=active]:bg-muted">Swap</TabsTrigger>
        <TabsTrigger value="wallet" className="items-center rounded-xl px-3 py-2 data-[state=active]:bg-muted">Wallet</TabsTrigger>
        <TabsTrigger value="settings" className="items-center rounded-xl px-3 py-2 data-[state=active]:bg-muted">Settings</TabsTrigger>
        </TabsList>
        </div>
);
}
