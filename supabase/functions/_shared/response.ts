export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const headers = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

export function ErrorResponse(message: string, code = 500) {
  return new Response(
    JSON.stringify({
      error: true,
      message,
    }),
    {
      status: code,
      headers,
    },
  );
}

export function SuccessResponse(payload: unknown) {
  return new Response(
    JSON.stringify(payload),
    {
      status: 200,
      headers,
    },
  );
}

export function StreamResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
    },
  });
}
