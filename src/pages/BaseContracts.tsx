
import ContractsBaseSection from '../components/ContractsBaseSection';

const BaseContracts = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">Contratos Base</h1>
          <p className="text-muted-foreground">Gerencie sua biblioteca de contratos de referência</p>
        </div>
      </div>

      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <ContractsBaseSection />
        </div>
      </div>
    </div>
  );
};

export default BaseContracts;
