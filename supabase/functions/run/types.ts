/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any

type Payload = {
    workspace_id: string;
    version_id: string;
    prompt_id: string;
    provider_id: string;
    apiKey: string;
    options: any;
    params: any;
    data: any;
};

export type Runner = {
    streaming: (payload: Payload) => Response;
    nonStreaming: (
        payload: Payload,
    ) => Promise<Response>;
};
