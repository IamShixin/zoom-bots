import classnames from "classnames";
import Balancer from "react-wrap-balancer";
import { ReactElement } from "react";

// wrap Balancer to remove type errors :( - @TODO - fix this ugly hack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BalancerWrapper = (props: any): JSX.Element => <Balancer {...props} />;

export type Message = {
  who: "bot" | "user" | undefined,
  message?: string
}

// loading placeholder animation for the chat line
export const LoadingChatLine = (): ReactElement => (
  <div className="flex min-w-full animate-pulse px-4 py-5 sm:px-6">
    <div className="flex flex-grow space-x-3">
      <div className="min-w-0 flex-1">
        <p className="font-large text-xxl text-gray-900">
          <a href="#" className="hover:underline">
            AI
          </a>
        </p>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-zinc-500"></div>
            <div className="col-span-1 h-2 rounded bg-zinc-500"></div>
          </div>
          <div className="h-2 rounded bg-zinc-500"></div>
        </div>
      </div>
    </div>
  </div>
);

// util helper to convert new lines to <br /> tags
const convertNewLines = (text: string): JSX.Element[] =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

export function ChatLine({ who = "bot", message }: Message): JSX.Element {
  if (!message) {
    return <></>;
  }
  const formattedMessage = convertNewLines(message);

  return (
    <div
      className={
        who != "bot" ? "float-right clear-both" : "float-left clear-both"
      }
    >
      <BalancerWrapper>
        <div className="float-right mb-5 rounded-lg bg-white px-4 py-5 shadow-lg ring-1 ring-zinc-100 sm:px-6">
          <div className="flex space-x-3">
            <div className="flex-1 gap-4">
              <p className="font-large text-xxl text-gray-900">
                <a href="#" className="hover:underline">
                  {who == "bot" ? "AI" : "You"}
                </a>
              </p>
              <p
                className={classnames(
                  "text ",
                  who == "bot" ? "font-semibold font- " : "text-gray-400"
                )}
              >
                {formattedMessage}
              </p>
            </div>
          </div>
        </div>
      </BalancerWrapper>
    </div>
  );
}
