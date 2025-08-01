
import UserMenu from "./UserMenu";
import CnetLogo from "./CnetLogo";

const Header = () => {
  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <CnetLogo size="sm" className="transition-transform hover:scale-105" />
          <h1 className="text-lg font-semibold text-foreground">
            Analisador Ortográfico de Contratos
          </h1>
        </div>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
