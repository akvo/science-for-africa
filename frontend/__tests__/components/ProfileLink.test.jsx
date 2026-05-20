import React from "react";
import { render, screen } from "@testing-library/react";
import ProfileLink from "@/components/shared/ProfileLink";

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({ children, href, className }) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("ProfileLink Component", () => {
  it("should render a link when userId is provided", () => {
    render(<ProfileLink userId="doc-123">John Doe</ProfileLink>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/profile/doc-123");
    expect(link).toHaveTextContent("John Doe");
  });

  it("should render children without a link when userId is missing", () => {
    render(<ProfileLink>John Doe</ProfileLink>);
    const link = screen.queryByRole("link");
    expect(link).not.toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <ProfileLink userId="doc-123" className="custom-class">
        John Doe
      </ProfileLink>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("custom-class");
    expect(link).toHaveAttribute("href", "/profile/doc-123");
  });
});
