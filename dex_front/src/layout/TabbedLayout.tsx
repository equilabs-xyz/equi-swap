import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef } from "react";

import SettingsLayout from "@/features/settings/Settings.tsx";
import SwapLayout from "@/features/swap/Swap.tsx";
import WalletLayout from "@/features/wallet/Wallet.tsx";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

const TAB_STORAGE_KEY = "lastActiveTab";

export default function TabbedLayout() {
  const [tab, setTab] = useState("swap");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t } = useTranslation();

  // Container references for scrollable content
  const swapContentRef = useRef(null);
  const walletContentRef = useRef(null);
  const settingsContentRef = useRef(null);

  useEffect(() => {
    const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
    if (savedTab) setTab(savedTab);

  }, []);

  const handleTabChange = (value: string) => {
    setTab(value);
    localStorage.setItem(TAB_STORAGE_KEY, value);
  };

  return (
    <div
      className="fixed inset-0 w-full h-full bg-background text-foreground"
      style={{ height: "100vh"}}
    >
      {isMobile ? (
        <div className="flex flex-col h-full w-full md:hidden">
          <Tabs
            value={tab}
            onValueChange={handleTabChange}
            className="flex flex-col h-full w-full"
          >
            <div className="flex-1 px-4 pt-2">
              <TabsContent value="swap" className="h-full">
                <div ref={swapContentRef} className="scroll-container h-full overflow-y-auto">
                  <SwapLayout />
                </div>
              </TabsContent>
              <TabsContent value="wallet" className="h-full">
                <div ref={walletContentRef} className="scroll-container h-full overflow-y-auto">
                  <WalletLayout />
                </div>
              </TabsContent>
              <TabsContent value="settings" className="h-full">
                <div
                  ref={settingsContentRef}
                  className="scroll-container h-full overflow-y-auto"
                >
                  <SettingsLayout />
                </div>
              </TabsContent>
            </div>
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background">
              <div className="max-w-[600px] mx-auto p-2">
                <div className="rounded-2xl shadow-md bg-white dark:bg-zinc-900 border p-2">
                  <TabsList className="grid grid-cols-3 w-full bg-transparent">
                    <TabsTrigger value="swap" className="items-center">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 7.5 L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                        />
                      </svg>
                    </TabsTrigger>
                    <TabsTrigger value="wallet" className="items-center">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
                        />
                      </svg>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="items-center">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </div>

          </Tabs>

        </div>

        ) : (
        <div className="hidden md:block h-full w-full">
        <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6 h-full flex flex-col">
        <Tabs
        value={tab}
      onValueChange={handleTabChange}
              className="w-full flex flex-col h-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="swap">{t("swap.label")}</TabsTrigger>
                <TabsTrigger value="wallet">{t("wallet.label")}</TabsTrigger>
                <TabsTrigger value="settings">
                  {t("settings.label")}
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 h-full">
                <TabsContent value="swap" className="h-full">
                  <div ref={swapContentRef} className="scroll-container h-full">
                    <SwapLayout />
                  </div>
                </TabsContent>
                <TabsContent value="wallet" className="h-full">
                  <div
                    ref={walletContentRef}
                    className="scroll-container h-full"
                  >
                    <WalletLayout />
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="h-full">
                  <div
                    ref={settingsContentRef}
                    className="scroll-container h-full"
                  >
                    <SettingsLayout />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>


        </div>

      )}
    </div>
  );
}
