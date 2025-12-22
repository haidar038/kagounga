import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const languages = [
    { code: "en", name: "English", flagUrl: "https://flagsapi.com/US/flat/64.png" },
    { code: "id", name: "Indonesia", flagUrl: "https://flagsapi.com/ID/flat/64.png" },
];

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
    };

    const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline-flex items-center gap-2">
                        <img src={currentLang.flagUrl} alt={currentLang.name} className="h-4 w-6 rounded object-cover" />
                        {currentLang.name}
                    </span>
                    <span className="sm:hidden">
                        <img src={currentLang.flagUrl} alt={currentLang.name} className="h-4 w-6 rounded object-cover" />
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem key={lang.code} onClick={() => changeLanguage(lang.code)} className={`cursor-pointer ${i18n.language === lang.code ? "bg-accent/50" : ""}`}>
                        <img src={lang.flagUrl} alt={lang.name} className="h-4 w-6 rounded object-cover mr-2" />
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
