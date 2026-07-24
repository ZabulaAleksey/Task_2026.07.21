import { FinancePage } from "./components/FinancePage";
import { ErrorBoundary } from "react-error-boundary";

function Fallback() {
  return <h2>Произошла ошибка</h2>;
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <FinancePage />
    </ErrorBoundary>
  );
}