import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddResourceDialog from "../../components/community/AddResourceDialog";

// Mock the strapi lib
jest.mock("../../lib/strapi", () => ({
  createResource: jest.fn(),
}));

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock dialog component to render simply without portals/radix side-effects
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children }) => <p>{children}</p>,
  DialogFooter: ({ children }) => <div>{children}</div>,
  DialogClose: ({ render }) => render || null,
}));

// Mock select component
jest.mock("@/components/ui/select", () => ({
  Select: ({ children }) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: ({ children }) => <span>{children}</span>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <div data-value={value}>{children}</div>,
}));

describe("AddResourceDialog Validation Tests", () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSuccess = jest.fn();
  const communityDocumentId = "community-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders step 1 inputs correctly", () => {
    render(
      <AddResourceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        communityDocumentId={communityDocumentId}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(
      screen.getByPlaceholderText("resources.name_placeholder"),
    ).toBeInTheDocument();
    expect(screen.getByText(/resources\.upload_file/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "resources.next" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors when next is clicked with empty fields", () => {
    render(
      <AddResourceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        communityDocumentId={communityDocumentId}
        onSuccess={mockOnSuccess}
      />,
    );

    const nextBtn = screen.getByRole("button", { name: "resources.next" });
    fireEvent.click(nextBtn);

    expect(screen.getByText("resources.name_required")).toBeInTheDocument();
    expect(screen.getByText("resources.file_required")).toBeInTheDocument();
  });

  it("clears name validation error dynamically as name is typed", () => {
    render(
      <AddResourceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        communityDocumentId={communityDocumentId}
        onSuccess={mockOnSuccess}
      />,
    );

    const nextBtn = screen.getByRole("button", { name: "resources.next" });
    fireEvent.click(nextBtn);

    expect(screen.getByText("resources.name_required")).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText("resources.name_placeholder");
    fireEvent.change(nameInput, { target: { value: "My Resource" } });

    expect(
      screen.queryByText("resources.name_required"),
    ).not.toBeInTheDocument();
  });

  it("clears file validation error when file is uploaded, and transitions to step 2 when both are provided", () => {
    const { container } = render(
      <AddResourceDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        communityDocumentId={communityDocumentId}
        onSuccess={mockOnSuccess}
      />,
    );

    const nextBtn = screen.getByRole("button", { name: "resources.next" });
    fireEvent.click(nextBtn);

    expect(screen.getByText("resources.file_required")).toBeInTheDocument();

    const file = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });
    const fileInput = container.querySelector('input[type="file"]');

    expect(fileInput).toBeInTheDocument();
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      screen.queryByText("resources.file_required"),
    ).not.toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText("resources.name_placeholder");
    fireEvent.change(nameInput, { target: { value: "My Resource" } });

    fireEvent.click(screen.getByRole("button", { name: "resources.next" }));

    expect(screen.getByText("resources.choose_topic")).toBeInTheDocument();
  });
});
