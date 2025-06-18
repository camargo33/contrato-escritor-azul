
import Header from '../components/Header';
import ContractsBaseSection from '../components/ContractsBaseSection';
import ContractAnalysisSection from '../components/ContractAnalysisSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/5">
            <ContractsBaseSection />
          </div>
          <div className="lg:w-3/5">
            <ContractAnalysisSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
