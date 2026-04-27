// tests/integration/components/ui/Avatar.test.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { describe, expect, it, vi } from "vitest";

import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@/tests/__setup__/test-utils";

const mockImageLoad = () => {
  const originalImage = global.Image;
  global.Image = class MockImage extends originalImage {
    constructor() {
      super();
      // Имитируем асинхронную загрузку
      setTimeout(() => {
        if (this.src?.includes("broken")) {
          this.onerror?.(new Event("error"));
        } else {
          this.onload?.(new Event("load"));
        }
      }, 0);
    }
  } as unknown as typeof HTMLImageElement;

  return () => {
    global.Image = originalImage;
  };
};

describe("Avatar", () => {
  it("отображает fallback по умолчанию", () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>,
    );

    //  Проверяем, что виден fallback (буква)
    const fallback = screen.getByText("U");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toBeVisible();
  });

  it("отображает изображение после успешной загрузки", async () => {
    const restore = mockImageLoad();

    render(
      <Avatar>
        <AvatarImage
          src="https://example.com/avatar.jpg"
          alt="User"
          data-testid="avatar-image"
        />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>,
    );

    // Ждём появления img с нужным src
    const image = await screen.findByTestId("avatar-image");
    await waitFor(() => {
      expect(image).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    restore();
  });
});
