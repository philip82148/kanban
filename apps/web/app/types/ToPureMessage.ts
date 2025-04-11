import type { Message } from "@bufbuild/protobuf";

export type ToPureMessage<T> = Omit<T, keyof Message>;
