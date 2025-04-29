import { Card, CardContent } from "@/components/ui/card";
import { ModeToggle } from "@/features/settings/components/mode-toggle.tsx";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsLayout() {
  const { t, i18n } = useTranslation();

  const supportedLanguages = [
    { code: "en", label: "English" },
    { code: "zh", label: "简体中文" },
    { code: "zh-Hant", label: "繁體中文" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "es", label: "Español" },
    { code: "ru", label: "Русский" },
    { code: "fr", label: "Français" },
    { code: "pt", label: "Português" },
    { code: "tr", label: "Türkçe" },
  ];

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <p>{t("settings.theme")}</p>
          </div>
          <ModeToggle />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <p>{t("settings.language")}</p>
          </div>
          <Select
            value={i18n.language}
            onValueChange={(lang) => i18n.changeLanguage(lang)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
