export type ResponseDelta = {
  delta: {
    content: string | null;
    tool_calls: {
      index: number;
      id?: string;
      type?: "function";
      function: {
        name?: string;
        arguments: string;
      };
    }[];
  };
};
