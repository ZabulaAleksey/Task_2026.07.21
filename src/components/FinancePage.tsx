import { ApiKeyForm } from "./ApiKeyForm";
import { FinanceDashboard } from "./FinanceDashboard";
import { FinanceNavbar } from "./FinanceNavbar";
import { useFinanceData } from "../hooks/useFinanceData";
import { useTheme } from "../hooks/useTheme";

export function FinancePage() {
  const { theme, toggleTheme } = useTheme();
  const { data, error, isLoading, loadFinanceData } = useFinanceData();

  return (
    <main className="min-vh-100 bg-body-tertiary">
      <FinanceNavbar theme={theme} onToggleTheme={toggleTheme} />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9 col-xl-8">
            <ApiKeyForm error={error} isLoading={isLoading} onSubmit={loadFinanceData} />
            {data && <FinanceDashboard data={data} />}
          </div>
        </div>
      </div>
    </main>
  );
}