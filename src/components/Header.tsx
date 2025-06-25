
import UserMenu from "./UserMenu";

const Header = () => {
  return (
    <header className="bg-slate-800 text-white py-6 shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Analisador Ortográfico de Contratos
        </h1>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
