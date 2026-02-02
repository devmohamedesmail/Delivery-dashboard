import I18nProvider from "@/context/i18n-provider";
import AppCookiesProvider from "@/components/providers/cookies-provider";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import { AuthProvider } from "@/context/auth-provider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class">
            <AppCookiesProvider>
                <ReactQueryProvider>
                    <AuthProvider>
                        <I18nProvider>
                            {children}
                            <Toaster />
                        </I18nProvider>
                    </AuthProvider>
                </ReactQueryProvider>
            </AppCookiesProvider>
        </ThemeProvider>
    );
}