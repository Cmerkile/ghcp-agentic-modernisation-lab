# Agentic Code Migration with GitHub Copilot

This hands-on workshop teaches you how to assess, plan, and execute a Java application modernization using the agentic capabilities of GitHub Copilot. You will work with a legacy Spring Boot Order Service and use specialized agents, skills, instructions, and plugins to move from evidence-based analysis to a validated implementation.

The workshop supports two learning paths: **GitHub Copilot App** and **GitHub Copilot CLI**.

> **Recommended:** Open the [official workshop on the MOAW platform](https://aka.ms/agenticdevlab) for the best guided experience, including path-specific instructions, navigation, and rendered workshop assets.

## What You Will Learn

By completing the workshop, you will learn how to:

- establish a build, test, API, and frontend baseline before changing code;
- assess a Java and Spring Boot application for upgrades and security risks;
- create and validate an executable modernization plan;
- configure project guardrails with Copilot instructions, skills, and plugins;
- orchestrate specialized agents to implement a migration safely;
- independently verify application behavior after modernization;
- use Copilot code review to triage quality and security findings; and
- summarize migration outcomes, business impact, and AI usage in a report or presentation.

## Workshop Journey

| Level | Focus | Outcome |
| --- | --- | --- |
| 1 | Analyze and plan | A validated assessment, modernization plan, and executable task graph |
| 2 | Set up guardrails | Project-specific coding standards, instructions, and relevant skills |
| 3 | Implement | A modernized Order Service produced by a coordinated multi-agent workflow |
| 4 | Quality and security | An independently verified build and triaged Copilot code review |
| Bonus | Communicate results | A migration report and stakeholder-focused presentation |

The complete workshop takes approximately **120 minutes** and is suitable for beginners who have access to GitHub Copilot.

## Repository Contents

- `docs/workshop.md` contains the full workshop instructions.
- `docs/assets/` contains screenshots and supporting workshop media.
- `app/Java - Spring Boot/Order Service/` contains the Spring Boot backend, React frontend, and automated tests used throughout the migration.
- `.devcontainer/` provides a ready-to-use GitHub Codespaces development environment.

## Prerequisites

- A GitHub account with GitHub Copilot access
- GitHub Copilot App or GitHub Copilot CLI
- JDK 17 or later and Maven 3.6 or later
- Node.js and npm
- A web browser
- Optional: Docker and Azure CLI for extended assessment scenarios

The included Codespaces environment already provides the required project tooling.

## Get Started

1. Fork this repository to your GitHub account.
2. Open your fork in GitHub Codespaces or clone it locally.
3. Launch the [workshop on MOAW](https://aka.ms/agenticdevlab).
4. Choose the GitHub Copilot App or CLI path and follow the guided steps.

To inspect the sample application directly, see the [Order Service README](app/Java%20-%20Spring%20Boot/Order%20Service/README.md).

## Preview the Workshop Locally

Install the repository dependencies and start the MOAW preview server:

```bash
npm install
npx moaw serve
```

Then open the local URL printed by the command. The workshop source is in `docs/workshop.md`.

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
