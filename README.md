<p align="center">
<img style="align:center;" src="./public/logo.svg" alt="prompt0 Logo" width="100" />
</p>

<h1 align="center">prompt0</h1>

prompt0 (🔊 "prompt zero") is a free and open-source prompt management tool. It’s designed to streamline the entire prompt lifecycle — from ideation and writing to evaluation, deployment, and analytics. prompt0 offers an efficient and centralized platform to manage prompts across various LLM providers (including OpenAI, Anthropic, and more).

## Where prompt0 is Used?

- [Tribe](https://tribe.best)

## Features

- **Multi-provider support**: Manage and optimize prompts across 100+ LLM providers using one platform.
- **Prompt lifecycle management**: Tools for writing, evaluating, deploying, and analyzing prompts.
- **LLM Playground**: Inspired by Anthropic's playground but with extended features for all LLMs, especially OpenAI.
- **Logs and Analytics**: Track and trace prompt logs with in-depth analytics.
- **Managed and self-hosted versions**: Host prompt0 yourself or use the managed version with your API keys.

## Managed Version

You can try prompt0 without hosting it yourself! I offer a **free hosted version** where you can bring your own API keys and start managing prompts right away. Sign up at:

👉 **[prompt0 managed version](https://prompt0.surge.sh/sign-up)**

Pricing for the managed version is undecided, but it will remain affordable to cover infrastructure costs.

## Stack

### Backend

- **[Supabase](https://supabase.com/)**: Manages the database, authentication, and real-time updates.
- **[Portkey AI Gateway](https://github.com/Portkey-AI/gateway)**: Adds compatibility with multiple LLM providers (to be replaced with an in-house solution in future versions).

### Frontend

- **TypeScript**
- **React**
- **Vite**
- **Next-UI**

## Roadmap

- Replace Portkey AI Gateway with a custom, in-house solution for lower latency.
- Expand support for more LLM providers.
- Introduce more advanced prompt analytics and evaluation features.

## Contributing

We welcome contributions! Please check out our [contributing guide](CONTRIBUTING.md) for guidelines on how to get involved.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

For setup instructions, see [SETUP.md](SETUP.md).
