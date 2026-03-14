import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DatasetUploadForm } from "@/features/datasets/components/DatasetUploadForm";

// SchemaSelector をモック
vi.mock("@/features/dataset/components/CsvSchemaSelector", () => ({
  CsvSchemaSelector: () => <div>Schema Selector</div>,
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("DatasetUploadForm", () => {
  test("CSVを選択するとSchemaSelectorが表示される", async () => {
    renderWithQueryClient(<DatasetUploadForm />);

    const file = new File(["time,value\n2024-01-01,10"], "test.csv", {
      type: "text/csv",
    });

    const input = screen.getByLabelText("CSVファイル");

    await userEvent.upload(input, file);

    expect(await screen.findByText("Schema Selector")).toBeInTheDocument();
  });
});
