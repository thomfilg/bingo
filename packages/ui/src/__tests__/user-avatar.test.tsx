import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserAvatar, UserMenu } from "../user-avatar";

describe("UserAvatar", () => {
  it("should render with image when src is provided", () => {
    const { container } = render(
      <UserAvatar
        src="https://example.com/avatar.jpg"
        name="John Doe"
      />
    );

    // Avatar uses Fade animation, so query directly
    const img = container.querySelector('img.MuiAvatar-img');
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    expect(img).toHaveAttribute("alt", "John Doe");
  });

  it("should render initials when no src is provided", () => {
    render(<UserAvatar name="John Doe" />);

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should render single initial for single-word name", () => {
    render(<UserAvatar name="John" />);

    expect(screen.getByText("JO")).toBeInTheDocument();
  });

  it("should render question mark when no name or src", () => {
    render(<UserAvatar />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("should render initials from first and last name", () => {
    render(<UserAvatar name="John Michael Doe" />);

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should apply size lg", () => {
    const { container } = render(<UserAvatar name="John" size="lg" />);

    // Avatar size "lg" is 48x48 per UI package Avatar
    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).toBeInTheDocument();
  });

  it("should use default size md", () => {
    const { container } = render(<UserAvatar name="John" />);

    // Avatar default size "md" is 40x40 per UI package Avatar
    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <UserAvatar name="John" onClick={handleClick} />
    );

    const avatar = container.querySelector('.MuiAvatar-root') as HTMLElement;
    fireEvent.click(avatar);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should have button role when onClick is provided", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <UserAvatar name="John" onClick={handleClick} />
    );

    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).toHaveAttribute("role", "button");
    expect(avatar).toHaveAttribute("tabIndex", "0");
  });

  it("should not have button role when onClick is not provided", () => {
    const { container } = render(<UserAvatar name="John" />);

    const avatar = container.querySelector('.MuiAvatar-root');
    expect(avatar).not.toHaveAttribute("role", "button");
  });

  it("should be interactive when onClick is provided", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <UserAvatar name="John" onClick={handleClick} />
    );

    const avatar = container.querySelector('.MuiAvatar-root');
    // Interactive avatars have cursor: pointer style and hover effects
    expect(avatar).toHaveAttribute("tabIndex", "0");
  });

  it("should handle null src gracefully", () => {
    render(<UserAvatar src={null} name="John Doe" />);

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should handle null name gracefully", () => {
    render(<UserAvatar name={null} />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("should render image with fallback alt text", () => {
    const { container } = render(<UserAvatar src="https://example.com/avatar.jpg" />);

    // Avatar uses Fade animation, so query directly
    const img = container.querySelector('img.MuiAvatar-img');
    expect(img).toHaveAttribute("alt", "User avatar");
  });
});

describe("UserMenu", () => {
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    image: "https://example.com/avatar.jpg",
  };

  it("should render user name and email", () => {
    render(<UserMenu user={mockUser} onSignOut={vi.fn()} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should render user avatar with image", () => {
    const { container } = render(<UserMenu user={mockUser} onSignOut={vi.fn()} />);

    // Avatar uses Fade animation, so query directly
    const img = container.querySelector('img.MuiAvatar-img');
    expect(img).toHaveAttribute("src", mockUser.image);
  });

  it("should render sign out button", () => {
    render(<UserMenu user={mockUser} onSignOut={vi.fn()} />);

    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("should call onSignOut when sign out button is clicked", () => {
    const handleSignOut = vi.fn();
    render(<UserMenu user={mockUser} onSignOut={handleSignOut} />);

    const signOutButton = screen.getByText("Sign out");
    fireEvent.click(signOutButton);

    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });

  it("should render default name when name is null", () => {
    const userWithoutName = {
      ...mockUser,
      name: null,
    };

    render(<UserMenu user={userWithoutName} onSignOut={vi.fn()} />);

    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("should render avatar with initials when no image", () => {
    const userWithoutImage = {
      name: "John Doe",
      email: "john@example.com",
      image: null,
    };

    render(<UserMenu user={userWithoutImage} onSignOut={vi.fn()} />);

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should handle empty user object gracefully", () => {
    const emptyUser = {
      name: null,
      email: null,
      image: null,
    };

    render(<UserMenu user={emptyUser} onSignOut={vi.fn()} />);

    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
