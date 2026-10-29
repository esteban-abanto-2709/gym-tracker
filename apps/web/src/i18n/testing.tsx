import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "./messages/es.json";
import { useErrorText } from "./errors";

function ErrorText() {
  useErrorText();
  return null;
}

export function IntlWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      <ErrorText />
      {children}
    </NextIntlClientProvider>
  );
}

export function renderWithIntl(
  ui: React.ReactElement,
  options?: RenderOptions,
) {
  return render(ui, { wrapper: IntlWrapper, ...options });
}
