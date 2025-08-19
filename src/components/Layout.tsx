import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();

    // Map routes to sidebar activeView
    const getActiveView = () => {
        const path = location.pathname;
        if (path === "/home") return "home";
        if (path === "/") return "dashboard";
        if (path === "/shopee") return "shopee";
        if (path === "/lazada") return "lazada";
        if (path === "/facebook-file") return "facebook-file";
        if (path === "/facebook-live" || path === "/facebook-ads-api") return "facebook-live";
        if (path === "/planning") return "planning";
        if (path === "/workspace") return "workspace";
        if (path === "/import") return "import";
        if (path === "/connect") return "connect";
        return "dashboard";
    };

    const handleNavigate = (view: string) => {
        const routes: Record<string, string> = {
            home: "/home",
            dashboard: "/",
            shopee: "/shopee",
            lazada: "/lazada",
            "facebook-file": "/facebook-file",
            "facebook-live": "/facebook-live",
            planning: "/planning",
            workspace: "/workspace",
            import: "/import",
            connect: "/connect"
        };

        const route = routes[view];
        if (route) {
            window.location.href = route;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex">
                <Sidebar
                    activeView={getActiveView()}
                    onNavigate={handleNavigate}
                    onImportClick={() => window.location.href = "/import"}
                />
                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}