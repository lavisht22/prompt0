import supabase from "./supabase";

export async function generatePromptName(messages: unknown) {
    const { data, error } = await supabase.functions.invoke<{
        name: string;
    }>("name", {
        body: {
            messages,
        },
    });

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error("No data returned from prompt name generation");
    }

    return data;
}
