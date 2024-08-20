type SystemMessage = {
    role: "system";
    content: string;
};

type UserMessage = {
    role: "user";
    content: ({
        type: "text";
        text: string;
    } | {
        type: "image_url";
        image_url: {
            url: string;
            detail: "auto" | "low" | "high";
        };
    })[];
};

export type Message = SystemMessage | UserMessage;

export type TextGenerateParams = {
    messages: Message[];
    model: string | null;
    temperature: number;
    max_tokens: number;
    providers: {
        id: string;
        type: string;
        options: object;
        keys: {
            value: string;
        };
    };
};

type TextGenerateResponse = {
    content: string;
    usage: {
        input_tokens?: number;
        output_tokens?: number;
    };
};

export type Runner = {
    text: {
        generate: (
            params: TextGenerateParams,
        ) => Promise<TextGenerateResponse>;
    };
};
