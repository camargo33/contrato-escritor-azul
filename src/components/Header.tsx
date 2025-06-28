
import UserMenu from "./UserMenu";

const Header = () => {
  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <span className="text-sm font-bold">C</span>
          </div>
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
