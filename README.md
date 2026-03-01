# iMessage Kit Pro Skill

This repository contains the `imessage-kit-pro` skill, a comprehensive guide for AI agents to build, debug, and manage iMessage applications using the Photon iMessage Kit libraries.

## Overview

The skill is designed for AI agents to understand and utilize both `@photon-ai/imessage-kit` (Basic) and `@photon-ai/advanced-imessage-kit` (Advanced). It follows a structured, rule-based format to provide clear, actionable guidance on a wide range of topics, from initial setup to advanced, enterprise-grade features.

This allows an agent to:

-   **Select the right tool:** Guide users to the correct library (Basic vs. Advanced) based on their needs.
-   **Provide accurate code:** Offer correct, context-aware code examples for a variety of tasks.
-   **Implement best practices:** Ensure the generated code is robust, efficient, and secure.
-   **Utilize advanced features:** Leverage the full power of the Advanced Kit, including message effects, tapbacks, group management, and more.

## Structure

The repository is structured for optimal use by an AI agent:

-   **`SKILL.md`**: The main entry point for the agent. It contains a high-level overview, a kit selection guide, and instructions on how to use the rule-based system.

-   **`rules/`**: A directory containing individual markdown files, each dedicated to a specific feature, concept, or API. This granular structure allows the agent to quickly find and consume the exact piece of information it needs to answer a user query.

-   **`README.md`**: This file, providing a human-readable overview of the project.

## How It Works

When a user asks a question related to iMessage development, an agent equipped with this skill will:

1.  Parse the user's intent.
2.  Reference `SKILL.md` to understand the overall landscape and locate the relevant topic.
3.  Navigate to the specific rule file within the `rules/` directory.
4.  Use the content of the rule file—including explanations and code examples—to formulate a precise and helpful answer.

This structure ensures that the agent's responses are grounded in a detailed, version-controlled knowledge base, leading to higher quality and more consistent results.
