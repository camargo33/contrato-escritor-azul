
import UserMenu from "./UserMenu";
import CnetLogo from "./CnetLogo";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-slate-50 to-white border-b border-border shadow-elegant backdrop-blur-sm">
      <div className="container mx-auto px-6 flex items-center justify-between h-20">
        <div className="flex items-center gap-4">
          <CnetLogo size="md" className="transition-transform hover:scale-105" />
          <div className="border-l border-border/50 pl-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Analisador de Contratos
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Powered by AI • GPT-4o-mini
            </p>
          </div>
        </div>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
