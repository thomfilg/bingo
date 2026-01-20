import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  SocialLoginButton,
  SocialLoginContainer,
  type SocialProvider,
} from "../social-login-button";

describe("SocialLoginButton", () => {
  const providers: SocialProvider[] = ["google", "facebook", "apple"];

  describe.each(providers)("%s provider", (provider) => {
    it(`should render ${provider} button with correct text`, () => {
      render(<SocialLoginButton provider={provider} />);

      const expectedTexts: Record<SocialProvider, string> = {
        google: "Continue with Google",
        facebook: "Continue with Facebook",
        apple: "Continue with Apple",
      };

      expect(screen.getByText(expectedTexts[provider])).toBeInTheDocument();
    });

    it(`should call onClick when ${provider} button is clicked`, () => {
      const handleClick = vi.fn();
      render(<SocialLoginButton provider={provider} onClick={handleClick} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it(`should show loading state for ${provider}`, () => {
      const { container } = render(<SocialLoginButton provider={provider} loading />);

      // When loading, Button shows CircularProgress spinner
      expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
    });

    it(`should be disabled when loading for ${provider}`, () => {
      render(<SocialLoginButton provider={provider} loading />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it(`should be disabled when disabled prop is true for ${provider}`, () => {
      render(<SocialLoginButton provider={provider} disabled />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  it("should apply fullWidth style by default", () => {
    render(<SocialLoginButton provider="google" />);

    const button = screen.getByRole("button");
    // MUI Button with fullWidth prop applies width: 100%
    expect(button).toHaveClass('MuiButton-fullWidth');
  });

  it("should not have fullWidth class when fullWidth is false", () => {
    render(<SocialLoginButton provider="google" fullWidth={false} />);

    const button = screen.getByRole("button");
    expect(button).not.toHaveClass('MuiButton-fullWidth');
  });

  it("should not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <SocialLoginButton provider="google" onClick={handleClick} disabled />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should render correct SVG icon for each provider", () => {
    const { container: googleContainer } = render(
      <SocialLoginButton provider="google" />
    );
    expect(googleContainer.querySelector("svg")).toBeInTheDocument();

    const { container: facebookContainer } = render(
      <SocialLoginButton provider="facebook" />
    );
    expect(facebookContainer.querySelector("svg")).toBeInTheDocument();

    const { container: appleContainer } = render(
      <SocialLoginButton provider="apple" />
    );
    expect(appleContainer.querySelector("svg")).toBeInTheDocument();
  });
});

describe("SocialLoginContainer", () => {
  it("should render children", () => {
    render(
      <SocialLoginContainer>
        <span>Child content</span>
      </SocialLoginContainer>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("should render default title", () => {
    render(
      <SocialLoginContainer>
        <span>Content</span>
      </SocialLoginContainer>
    );

    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
  });

  it("should render custom title", () => {
    render(
      <SocialLoginContainer title="Welcome Back">
        <span>Content</span>
      </SocialLoginContainer>
    );

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
  });

  it("should not render title when title is empty", () => {
    render(
      <SocialLoginContainer title="">
        <span>Content</span>
      </SocialLoginContainer>
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("should render divider when showDivider is true", () => {
    render(
      <SocialLoginContainer showDivider>
        <span>Content</span>
      </SocialLoginContainer>
    );

    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("should not render divider by default", () => {
    render(
      <SocialLoginContainer>
        <span>Content</span>
      </SocialLoginContainer>
    );

    expect(screen.queryByText("or")).not.toBeInTheDocument();
  });

  it("should render custom divider text", () => {
    render(
      <SocialLoginContainer showDivider dividerText="or continue with email">
        <span>Content</span>
      </SocialLoginContainer>
    );

    expect(screen.getByText("or continue with email")).toBeInTheDocument();
  });

  it("should render multiple buttons", () => {
    render(
      <SocialLoginContainer>
        <SocialLoginButton provider="google" />
        <SocialLoginButton provider="facebook" />
        <SocialLoginButton provider="apple" />
      </SocialLoginContainer>
    );

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with Facebook")).toBeInTheDocument();
    expect(screen.getByText("Continue with Apple")).toBeInTheDocument();
  });
});
