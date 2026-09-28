import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageList } from "./message-list";

describe("message dates", () => {
  it("separates the same calendar day in different years", () => {
    render(
      <MessageList
        listRef={createRef<HTMLDivElement>()}
        onScroll={() => {}}
        messages={[2025, 2026].map((year) => ({
          id: String(year),
          text: `Сообщение за ${year} год`,
          timestamp: new Date(year, 11, 25, 12).getTime(),
          outgoing: false,
          status: "delivered",
        }))}
      />,
    );

    expect(screen.getAllByText("25 декабря")).toHaveLength(2);
  });
});
