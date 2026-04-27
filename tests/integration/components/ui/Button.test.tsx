// tests/integration/components/ui/Button.test.tsx

import { Button } from "@/components/ui/button";
import { fireEvent, render, screen } from "@/tests/__setup__/test-utils";
import { describe, it, expect, vi } from "vitest";

describe("Button", () => {
  it("рендерится с текстом", () => {
    render(<Button>Нажми меня</Button>);
    expect(
      screen.getByRole("button", { name: /нажми меня/i }),
    ).toBeInTheDocument();
  });

  it("вызывает onClick при клике", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled блокирует клик", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
