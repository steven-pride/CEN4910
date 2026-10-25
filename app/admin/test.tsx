import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Home from "./page";


describe("Building Energy Tracker - Dashboard Unit Tests", () => {

  // Test 1: Dashboard Rendering
  it("should render the dashboard successfully", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Portfolio Overview" })
    ).toBeInTheDocument();
  });

  // Test 2: KPI Cards
  it("should display all four KPI metrics", () => {
    render(<Home />);

    expect(screen.getByText("Gross Floor Area")).toBeInTheDocument();
    expect(screen.getByText("Avg Portfolio Occupancy")).toBeInTheDocument();
    expect(screen.getByText("Avg Portfolio EUI")).toBeInTheDocument();
    expect(screen.getByText("Avg Energy Score")).toBeInTheDocument();
  });

  // Test 3: Property List
  it("should display all five managed properties", () => {
    render(<Home />);

    expect(screen.getByText("Empire State Building")).toBeInTheDocument();
    expect(screen.getByText("Midtown Commercial Tower")).toBeInTheDocument();
    expect(screen.getByText("Hudson Point Plaza")).toBeInTheDocument();
    expect(screen.getByText("Financial Center West")).toBeInTheDocument();
    expect(screen.getByText("Liberty Tech Park")).toBeInTheDocument();
  });

  // Test 4: Search by Property Name
  it("should filter properties by name", () => {
    render(<Home />);

    const searchInput = screen.getByPlaceholderText(
      "Search properties or city..."
    );

    fireEvent.change(searchInput, {
      target: { value: "Empire State" },
    });

    expect(screen.getByText("Empire State Building")).toBeInTheDocument();
    expect(screen.queryByText("Midtown Commercial Tower")).not.toBeInTheDocument();
  });

  // Test 5: Search by Address
  it("should filter properties by address or city", () => {
    render(<Home />);

    const searchInput = screen.getByPlaceholderText(
      "Search properties or city..."
    );

    fireEvent.change(searchInput, {
      target: { value: "Jersey City" },
    });

    expect(screen.getByText("Liberty Tech Park")).toBeInTheDocument();
    expect(screen.queryByText("Empire State Building")).not.toBeInTheDocument();
  });

});
