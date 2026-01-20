import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock the hooks before importing the component
const mockUseAuth = vi.fn();
const mockUseSocialLogin = vi.fn();
const mockUseDeviceDetection = vi.fn();

vi.mock("@repo/auth/hooks", () => ({
  useAuth: () => mockUseAuth(),
  useSocialLogin: () => mockUseSocialLogin(),
  useDeviceDetection: () => mockUseDeviceDetection(),
}));

vi.mock("@repo/ui/social-login-button", () => ({
  SocialLoginButton: ({ provider, onClick, loading, disabled }: {
    provider: string;
    onClick: () => void;
    loading: boolean;
    disabled: boolean;
  }) => (
    <button
      data-testid={`social-login-${provider}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "Loading..." : `Continue with ${provider}`}
    </button>
  ),
  SocialLoginContainer: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="social-login-container">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock("@repo/ui/data-display/Alert", () => ({
  Alert: ({ title, description, closable, onClose }: {
    title: string;
    description: string;
    closable?: boolean;
    onClose?: () => void;
  }) => (
    <div role="alert" data-testid="alert">
      <strong>{title}</strong>
      <span>{description}</span>
      {closable && onClose && (
        <button aria-label="Close alert" onClick={onClose}>×</button>
      )}
    </div>
  ),
}));

vi.mock("@repo/ui/data-display/LoadingState", () => ({
  LoadingState: ({ message }: { message?: string }) => (
    <div data-testid="loading-state">{message || "Loading..."}</div>
  ),
}));

vi.mock("@repo/ui/layout/Container", () => ({
  Container: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="container">{children}</div>
  ),
}));

vi.mock("@repo/ui/layout/Spacer", () => ({
  Spacer: () => <div data-testid="spacer" />,
}));

vi.mock("@repo/ui/typography/Text", () => ({
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

// Import after mocks are set up
import LoginPage from "../login/page";

describe("LoginPage", () => {
  const mockRouter = { push: vi.fn() };
  const mockSearchParams = { get: vi.fn().mockReturnValue(null) };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset navigation mocks
    vi.doMock("next/navigation", () => ({
      useRouter: () => mockRouter,
      useSearchParams: () => mockSearchParams,
    }));

    // Default mock implementations
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    mockUseSocialLogin.mockReturnValue({
      loginWithGoogle: vi.fn(),
      loginWithFacebook: vi.fn(),
      loginWithApple: vi.fn(),
      isLoading: null,
      error: null,
      clearError: vi.fn(),
    });

    mockUseDeviceDetection.mockReturnValue({
      isAppleDevice: false,
      isHydrated: true,
    });
  });

  describe("Loading state", () => {
    it("should show loading spinner when session is loading", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      render(<LoginPage />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Social login buttons", () => {
    it("should render Google and Facebook buttons", () => {
      render(<LoginPage />);

      expect(screen.getByTestId("social-login-google")).toBeInTheDocument();
      expect(screen.getByTestId("social-login-facebook")).toBeInTheDocument();
    });

    it("should call loginWithGoogle when Google button is clicked", () => {
      const loginWithGoogle = vi.fn();
      mockUseSocialLogin.mockReturnValue({
        loginWithGoogle,
        loginWithFacebook: vi.fn(),
        loginWithApple: vi.fn(),
        isLoading: null,
        error: null,
        clearError: vi.fn(),
      });

      render(<LoginPage />);

      fireEvent.click(screen.getByTestId("social-login-google"));
      expect(loginWithGoogle).toHaveBeenCalledWith("/");
    });

    it("should call loginWithFacebook when Facebook button is clicked", () => {
      const loginWithFacebook = vi.fn();
      mockUseSocialLogin.mockReturnValue({
        loginWithGoogle: vi.fn(),
        loginWithFacebook,
        loginWithApple: vi.fn(),
        isLoading: null,
        error: null,
        clearError: vi.fn(),
      });

      render(<LoginPage />);

      fireEvent.click(screen.getByTestId("social-login-facebook"));
      expect(loginWithFacebook).toHaveBeenCalledWith("/");
    });

    it("should disable other buttons when one is loading", () => {
      mockUseSocialLogin.mockReturnValue({
        loginWithGoogle: vi.fn(),
        loginWithFacebook: vi.fn(),
        loginWithApple: vi.fn(),
        isLoading: "google",
        error: null,
        clearError: vi.fn(),
      });

      render(<LoginPage />);

      expect(screen.getByTestId("social-login-facebook")).toBeDisabled();
    });
  });

  describe("Apple Sign-In visibility", () => {
    it("should show Apple button on Apple devices", () => {
      mockUseDeviceDetection.mockReturnValue({
        isAppleDevice: true,
        isHydrated: true,
      });

      render(<LoginPage />);

      expect(screen.getByTestId("social-login-apple")).toBeInTheDocument();
    });

    it("should hide Apple button on non-Apple devices after hydration", () => {
      mockUseDeviceDetection.mockReturnValue({
        isAppleDevice: false,
        isHydrated: true,
      });

      render(<LoginPage />);

      expect(screen.queryByTestId("social-login-apple")).not.toBeInTheDocument();
    });

    it("should show Apple button before hydration to avoid layout shift", () => {
      mockUseDeviceDetection.mockReturnValue({
        isAppleDevice: false,
        isHydrated: false,
      });

      render(<LoginPage />);

      expect(screen.getByTestId("social-login-apple")).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("should display error message when error occurs", () => {
      mockUseSocialLogin.mockReturnValue({
        loginWithGoogle: vi.fn(),
        loginWithFacebook: vi.fn(),
        loginWithApple: vi.fn(),
        isLoading: null,
        error: "Something went wrong",
        clearError: vi.fn(),
      });

      render(<LoginPage />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("should call clearError when error box close button is clicked", () => {
      const clearError = vi.fn();
      mockUseSocialLogin.mockReturnValue({
        loginWithGoogle: vi.fn(),
        loginWithFacebook: vi.fn(),
        loginWithApple: vi.fn(),
        isLoading: null,
        error: "Test error",
        clearError,
      });

      render(<LoginPage />);

      const closeButton = screen.getByLabelText("Close alert");
      fireEvent.click(closeButton);

      expect(clearError).toHaveBeenCalled();
    });

    it("should have accessible error box with role alert", () => {
      mockUseSocialLogin.mockReturnValue({
        loginWithGoogle: vi.fn(),
        loginWithFacebook: vi.fn(),
        loginWithApple: vi.fn(),
        isLoading: null,
        error: "Test error",
        clearError: vi.fn(),
      });

      render(<LoginPage />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Terms and Privacy links", () => {
    it("should render Terms of Service link", () => {
      render(<LoginPage />);

      expect(screen.getByText("Terms of Service")).toHaveAttribute("href", "/terms");
    });

    it("should render Privacy Policy link", () => {
      render(<LoginPage />);

      expect(screen.getByText("Privacy Policy")).toHaveAttribute("href", "/privacy");
    });
  });
});
