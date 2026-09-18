---
published: false                        # Optional. Set to true to publish the workshop (default: false)
type: workshop                          # Required.
title: Agentic Code Migration with GitHub Copilot App and GitHub Copilot CLI # Required. Full title of the workshop
short_title: Copilot App & CLI - Agentic Code Migration # Optional. Short title displayed in the header
description: This is a workshop for learning how to efficiently migrate and modernize large codebases with the full Agentic power of GitHub Copilot. It's also a great introduction for GitHub Copilot CLI and GitHub Copilot App  # Required.
level: beginner                         # Required. Can be 'beginner', 'intermediate' or 'advanced'
authors:                                # Required. You can add as many authors as needed      
  - Philippe DIDIERGEORGES
  - Nabil ABBAR
contacts:                               # Required. Must match the number of authors
  - "@Philess"
  - "@ABBARNABIL"
duration_minutes: 120                    # Required. Estimated duration in minutes
tags: Copilot, Modernization, Agentic, Code          # Required. Tags for filtering and searching
#banner_url: assets/banner.jpg           # Optional. Should be a 1280x640px image
#video_url: https://youtube.com/link     # Optional. Link to a video of the workshop
#audience: students                      # Optional. Audience of the workshop (students, pro devs, etc.)
#wt_id: <cxa_tracking_id>                # Optional. Set advocacy tracking code for supported links
#oc_id: <marketing_tracking_id>          # Optional. Set marketing tracking code for supported links
#navigation_levels: 2                    # Optional. Number of levels displayed in the side menu (default: 2)
#navigation_numbering: true             # Optional. Enable numbering in the side menu (default: true)
#sections_title:                         # Optional. Override titles for each section to be displayed in the side bar
#   - Section 1 title
#   - Section 2 title
---

# Agentic Code Migration with GitHub Copilot

*Version 1 - September 2026*

The goal of this workshop is to learn how to use GitHub Copilot to efficiently migrate and modernize large codebases with full agentic capabilities and enterprise-level guardrails to ensure code quality and security.

You can run this workshop using any client of GitHub Copilot but this workshop is specifically designed to serve as a workshop to discover GitHub Copilot App and GitHub Copilot CLI.

<div class="warning" data-title="warning">

> GitHub Copilot, its App and CLI, are a quickly evolving product and thus this workshop may not be 100% up to date with the different features of the various extensions you are going to use. Please be adaptable if it's not exactly the same.

</div>

## Choose your GitHub Copilot path

Select the GitHub Copilot experience you will use for this workshop. Your
choice is stored in the workshop URL, so the following pages only show the
instructions for your selected path.

<div class="info" data-title="Selected path" data-visible="$$copilot_cli$$">

> You selected **GitHub Copilot CLI**. This choice is encoded in the URL as
> `vars=copilot_cli:1`.

</div>

<div class="info app-path" data-title="Selected path" data-visible="$$copilot_app$$">

> You selected the **GitHub Copilot App**. This choice is encoded in the URL as
> `vars=copilot_app:1`.
</div>

<div data-hidden="$$copilot_cli$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_cli:1'); window.location.href = url"> Use GitHub Copilot CLI </button>

</div>

<div data-hidden="$$copilot_app$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_app:1'); window.location.href = url"> Use GitHub Copilot App </button>

</div>

## Minimal Pre-requisites

 <div data-visible="$$copilot_cli$$">

You can use **GitHub Copilot CLI** either online in GitHub Codespaces, with no
local installation, or locally on your computer.

</div>

<div data-visible="$$copilot_app$$">

The **GitHub Copilot app** runs locally on your computer and provides a
dedicated graphical experience for agentic development.

</div>

These are the very minimal pre-requisites to run this workshop:

|                                 |                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------ |
| A GitHub account                | [Create free GitHub account](https://github.com/join)                          |
| GitHub Copilot Access activated | Get Access to GitHub Copilot (section below)                                   |
| A web browser                   | [Download Microsoft Edge](https://www.microsoft.com/edge) or any other one ;-) |

## Get Access to GitHub Copilot

There are different ways to get access to GitHub Copilot:

- **As an individual**, you can sign up to use [Copilot Free](https://github.com/github-copilot/signup), without the need for a credit card. You are entitled to a limited number of completions and chat interactions per month with the free plan, which reset each month. Learn more about the [Copilot Free plan details and conditions](https://docs.github.com/en/copilot/about-github-copilot/subscription-plans-for-github-copilot).
- **As an individual**, sign up for a [paid subscription](https://github.com/github-copilot/signup/copilot_individual) to get unlimited completions and chat interactions. You can try GitHub Copilot for free with a one-time 30-day trial.

- **As a member of an organization or enterprise** that has a subscription to GitHub Copilot, you can request access to Copilot by going to [https://github.com/settings/copilot](https://github.com/settings/copilot) and requesting access under "Get Copilot from an organization."

<div class="warning" data-title="warning">

> The **Copilot Free** offer includes only a limited amount of AI Credits that will probably limit your usage. You can still run a majority of this workshop with a free subscription but to finish it completely you will need a paid license.

</div>

## Fork the repository

This workshop uses the following GitHub Repository: [Copilot Agentic Lab repository on GitHub](https://github.com/Philess/ghcp-agentic-modernisation-lab)

This repository contains a code starter that will help you experiment all capabilities with GitHub Copilot. Take the time to look at the architecture design displayed.

Start by creating **your own fork** of the repository by clicking on the `Fork` button on the top right of the repository page. It will create a copy of the repository in your own GitHub account and you will be free to make any changes you want.

![fork repo](assets/fork-repo.png)

## Set up your selected GitHub Copilot client

<div data-visible="$$copilot_cli$$">

You can run GitHub Copilot CLI in GitHub Codespaces or on your local computer.

**Option 1: Use GitHub Copilot CLI in Codespaces**

The environment is already configured to work with [GitHub Codespaces](https://github.com/features/codespaces), you can find the configuration files in the *.devcontainer* folder.

To start programming just start a new codespace and you are ready to go, don't need to install anything.

<div class="info" data-title="note">

> Every individual users of GitHub has a free plan to run the codespace to let you try it with a free 120 core-hours per month [See Pricing](https://github.com/settings/billing/summary)

</div>

![create codespace](assets/create-codespace.png)

After just a few seconds, you will be redirected to your Codespace environment, a full development environment ready to go in the browser.
**You can start coding right away**, your environment and dependencies are already installed and configured.

Open a terminal in the Codespace and launch GitHub Copilot CLI:

```bash
copilot
```

Your GitHub account and Copilot license are available automatically in the
Codespace.

**Option 2: Use GitHub Copilot CLI locally**

Install [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli).

Clone the repo locally. Start from your repo on GitHub.com and select Code => Local => copy URL to clipboard
![copy repo path to clipboard](assets/cli-copy-repo-url.png)

And in target repo, open a new terminal and type:
```bash
git clone *the_repo_path*
cd ghcp-agentic-modernisation-lab
copilot
```

Sign in with the GitHub account that has access to Copilot when prompted.

</div>

<div data-visible="$$copilot_app$$">

Install the [GitHub Copilot app](https://github.com/features/ai/github-app),
launch it, and sign in with the GitHub account that has access to Copilot.

Open your forked repository in the app, then create a new chat with
`Ctrl+Shift+O`.

![GitHub Copilot app new chat](assets/ghcp-app-new-chat.png)

</div>

## Install the project tooling

If you are working locally, install the following tools:

1. JDK 17 or later and Maven 3.6 or later
2. [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
3. Optionally, Docker and the Azure CLI if you want the assessment to include container and Azure readiness.

The Codespaces environment already includes the required project tooling.

<div class="info" data-title="tip">

> Instead of installing each tool manually, you can ask your selected GitHub
> Copilot client to help you install anything that is missing.

</div>

<div data-visible="$$copilot_cli$$">

Open a GitHub Copilot CLI session and enter this prompt:

</div>

<div data-visible="$$copilot_app$$">

In the GitHub Copilot app, open a new chat with `Ctrl+Shift+O` and enter this
prompt:

</div>

```md
I need some tools to run a workshop. Help me install:
- JDK 17 or later, Maven 3.6 or later
- Node and npm
```

## How to run the code?

Everything is detailed in the bundled
[Order Service README](../app/Java%20-%20Spring%20Boot/Order%20Service/README.md).
From the workshop repository root, first change to the application directory:

```bash
cd "app/Java - Spring Boot/Order Service"
```

Take a look at it, and be sure to run at least the front-end app before going further, it will be mandatory to complete the tutorial.

## Help us improve this Workshop

If you face any challenge or bug running this workshop, please let us know. Your help will be invaluable in making this workshop better, specially as we try to maintain it on a regular basis to keep it up-to-date.

[Report any problem here.](https://github.com/Philess/ghcp-agentic-modernisation-lab/issues/new)

---

# Level 1: Analyze the existing and build a plan

In this level, you will assess the
[Order Service application](../app/Java%20-%20Spring%20Boot/Order%20Service/README.md)
before changing any code. The goal is to establish a trustworthy baseline,
identify modernization risks and opportunities, define a target state, and
produce an actionable plan.

<div class="info" data-title="Selected path" data-visible="$$copilot_cli$$">

> You are on the **GitHub Copilot CLI** path. 

</div>

<div class="info app-path" data-title="Selected path" data-visible="$$copilot_app$$">

> You are on the **GitHub Copilot App** path. 

</div>

<div data-hidden="$$copilot_cli$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_cli:1'); window.location.href = url"> Use GitHub Copilot CLI </button>

</div>

<div data-hidden="$$copilot_app$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_app:1'); window.location.href = url"> Use GitHub Copilot App </button>

</div>

## Before you begin

Make sure you completed all the required pre-requisites and installed the required tools. You should have a working environment with your selected GitHub Copilot client. You should also have forked the repository and have access to the code.

Do not start upgrading dependencies or editing application code yet. Level 1
is complete when the findings and plan have been reviewed.

## Step 1: Discover Awesome Copilot and install the plugin

[Awesome Copilot](https://github.com/github/awesome-copilot) is a
community-created collection of customizations that extend GitHub Copilot. Open
the repository, then use the [Awesome Copilot catalog](https://awesome-copilot.github.com/)
to explore its contents.

Identify the purpose of each customization type before continuing:

| Customization | Purpose |
| --- | --- |
| Agents | Specialized Copilot personas and tool configurations for a particular role or workflow. |
| Instructions | Coding standards and project guidance applied automatically to matching files. |
| Skills | Reusable domain knowledge, procedures, and supporting resources that Copilot can load when relevant. |
| Plugins | Installable bundles of agents, skills, commands, hooks, or extensions for a complete workflow. |

Open **Plugins** in the catalog and search for
[github-copilot-modernization](https://awesome-copilot.github.com/plugin/github-copilot-modernization/).
This Microsoft-maintained plugin provides autonomous modernization for Java and
.NET applications through a hierarchy of orchestrator, coordinator, and
executor agents. Before installing it, open its [details](https://github.com/microsoft/github-copilot-modernization/tree/main/plugins/github-copilot-modernization)  and answer the following
questions:

1. Which modernization scenarios and application languages does it support?
2. Which agent can a user invoke directly?
3. Where does it write assessment and planning artifacts?
4. How can an enterprise rulebook constrain its recommendations?

Install the plugin using your selected GitHub Copilot client.

<div data-visible="$$copilot_app$$">

**Install from the GitHub Copilot app**

On the plugin details page, select **Open in GitHub Copilot app** and confirm the installation when prompted.
![Awesome GitHub Copilot catalog page for the github-copilot-modernization plugin](assets/app-mod-plugin-install.png)
![GitHub Copilot app confirmation dialog for installing the modernization plugin](assets/app-mod-plugin-confirm.png)

The plugin is installed under the **awesome-copilot** marketplace. Expand the
marketplace to view all available plugins and activate or deactivate them as
needed.


![GitHub Copilot app Plugins view with github-copilot-modernization enabled](<assets/list plugins.png>)

You can also view the installed plugin's skills by opening the **Skills** tab in the app, and filter by plugin.

![GitHub Copilot app Skills view filtered to plugin-provided modernization skills](<assets/Skills list.png>)
</div>

<div data-visible="$$copilot_cli$$">

**Install with GitHub Copilot CLI**

Following the plugin repository's installation instructions, you should start by adding the marketplace to your CLI like this:

```bash
/plugin marketplace add github/awesome-copilot
```

But if you try this with Awesome Copilot, you should see a message that it's already installed by default. Keep this in mind for other marketplaces in the future. A marketplace is a repo with a specific registry to distribute plugins, skills, and other useful resources. You can create your own or add others from various providers.

Because the marketplace is already installed, we can install our modernization plugin immediately:

```bash
/plugin install github-copilot-modernization@awesome-copilot
```
Verify that the marketplace and plugin are available:

```bash
/plugin marketplace list
/plugin list
```

You can view installed plugin skills, MCP servers, and agent commands with:

```bash
/env
```

![GitHub Copilot CLI environment output listing modernization skills, agents, and plugins](assets/cli-env-list.png)

</div>

## Step 2: Establish the current baseline

Before asking GitHub Copilot to assess the project, confirm that the existing
application can be built and tested in its current state. From the Order
Service project directory

<div data-visible="$$copilot_app$$">

In the GitHub Copilot app, start a new session in your forked lab repository.

![GitHub Copilot app menu for adding a local folder, GitHub repository, or repository URL](assets/add-repo.png)
![Order Service repository with a new session in the GitHub Copilot app sidebar](assets/new-session.png)
> Create a new session for the baseline checks. Keeping this work in a separate
> session makes the original build and runtime evidence easier to review later.

Enter `!` alone on an empty prompt to enter shell mode.

```bash
cd "app/Java - Spring Boot/Order Service"
```

![GitHub Copilot app shell mode command prompt](assets/shell-command.png)
> Shell mode runs commands directly in the repository environment. Change to
> the Order Service directory, then run `mvn clean test` and `mvn clean package`.
> Record any failure.

![GitHub Copilot app terminal showing the baseline Maven commands](assets/terminal-run.png)
> After the tests and package build complete, run `mvn spring-boot:run` to start
> the backend. Leave this terminal running for the API and frontend checks.
> Open the built-in interactive browser canvas to view the API response.

![GitHub Copilot app terminal running Spring Boot application](assets/spring-boot-run.png)
> Confirm that Spring Boot starts without errors and note any warnings. Open
> `http://localhost:8080/api/orders` to verify that the seeded API responds.

![GitHub Copilot app browser view](assets/github-app-browser.png)
> The browser response establishes the baseline API contract.

![GitHub Copilot app terminal running frontend application](assets/terminal-frontend-run.png)
> Open another terminal, change to the `frontend` directory, and run
> `npm install` followed by `npm run dev`. Keep the backend running.

![GitHub Copilot app terminal running frontend application](assets/running-frontend.png)
> Open `http://localhost:5173` (or click on the link in the terminal in codespace) and confirm that the order list loads from the
> backend. Also exercise the create-order workflow and record any browser or
> terminal errors as baseline evidence.

</div>

<div data-visible="$$copilot_cli$$">

Open another terminal in the repo folder and type:

```bash
cd "app/Java - Spring Boot/Order Service"
```

```bash
mvn clean test
mvn clean package
```

Record any failure instead of fixing it. A pre-existing failure is part of the
baseline and must not later be attributed to the modernization.

Start the backend in a terminal:

```bash
mvn spring-boot:run
```

Confirm that the seeded Order API responds at
`http://localhost:8080/api/orders`:

```bash
curl http://localhost:8080/api/orders
```

In a second terminal, install and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and confirm that the UI can retrieve orders from
the backend. Record the test results, API response, and any startup warnings as
part of the baseline.


<div class="info" data-title="tip">

> Instead of launching all these commands manually you can also simply ask to copilot to <b>"Build and launch my App. Install dependencies and start my backend and my frontend"</b> and it will do the same for you. Sometimes it's just important to do things manually to better understand what's your dealing with but copilot is also a very powerfull tool to discovers new codebase.

</div>

</div>

Inspect the repository and capture:

- modules and their responsibilities;
- current Java version, build tool, and Spring Boot versions;



## Step 3: Check modernization readiness

The plugin discovers Java projects from a `pom.xml` file. From
the Order Service project directory, confirm that the build file is present and
check the required tools:

```bash
java -version
mvn -version
node --version
npm --version
git --version
```

Resolve only missing tooling that prevents assessment. Record optional tooling
that will be needed in later levels.

## Step 4: Run the assessment

<div data-visible="$$copilot_app$$">

Start by selecting the "Auto" model to let copilot choose the most token and performance optimized model for the coming task.

In the Session, select the `modernize-java-assessment` agent.
![Default agent selector in a new GitHub Copilot app session](assets/agent-select.png)
![Agent selector with modernize-java-assessment selected](assets/java-assessment-agent.png)

</div>

<div data-visible="$$copilot_cli$$">

From the root of your forked lab repository, start GitHub Copilot CLI:

```bash
copilot
```

Enter `/model` and enter, and then select the "Auto" model to let copilot choose the most token and performance optimized model.

Enter `/agent` and select the `modernize-java-assessment` from the agent picker.
The plugin declares this assessment agent as user-invocable and configures its
preferred model.

</div>

Send the following prompt to the agent:

```text
Assess this Java application Order Service for migration to Java 25, upgrading Spring Boot, and remediating security vulnerabilities.
```

<div data-visible="$$copilot_app$$">

GitHub Copilot creates a Git worktree for the session. 
A worktree is an additional checkout linked to the same Git repository: it shares the
repository's history and objects while maintaining its own working directory,
index, and checked-out branch. This gives Copilot an isolated workspace in
which to analyze the application without changing the files in your main
working directory, and it allows multiple agent sessions to work in parallel.

The assessment agent delegates the detailed analysis to a specialized subagent,
which starts as a background task. The **Background** indicator shows that the
subagent is still running and can be opened to monitor its progress. Wait for
the background task to finish and return its evidence-based findings before
reviewing the generated assessment report.

![Assessment session showing the created worktree and a running background task](assets/assessment-sub-agent.png)

![Completed assessment session beside the evidence-based Order Service assessment summary](assets/assessment-sub-agent-session.png)

![Assessment artifact confirmation showing the path to assessment.md](assets/assessment-report.png)

<div class="info" data-title="note">

> Depending on the assessment workflow, the agent can generate either an
> `assessment.md` Markdown report or a structured `report.json` artifact.

</div>

</div>

<div data-visible="$$copilot_cli$$">

The assessment agent can delegate detailed analysis to background subagents.
Enter `/tasks` to inspect active work and wait for every assessment task to
finish. When the agent returns its final summary, confirm the generated report
path and open the Markdown report in your editor.

You will be prompted to allow Copilot to run some commands along the way. 

</div>

Assessment agent first identifies the application structure and technology stack. It locates the relevant source directories, build files, dependency manifests, tests, configuration, deployment files, and existing modernization artifacts.

After the assessment is complete, the agent generates **a report in Markdown** that includes a summary of the findings and recommendations.

<div data-visible="$$copilot_cli$$">

On the bottom of the terminal, you can see which model has been selected by Copilot and what is the current consumption of AI credits for the current session:
![AI Credit Counter and selected model](assets/cli-aic-counter.png)

The assessment report describes the current state of the application, including its dependencies, vulnerabilities, and modernization opportunities.

You can **ctrl+click** on the report path to open it.

![preview report](assets/cli-report-open-preview.png)

Take time to review the content.
</div>

![Assessment report showing the current state and modernization targets](assets/assessment-md.png)
> The opening inventory compares the current Java 8 and Spring Boot 2.7 stack with the Java 25 and Spring Boot 3.5 targets. It also surfaces end-of-life components and vulnerable dependencies that require attention.

![Assessment report showing the current state and modernization targets](assets/assessment-blockers-md.png)
> The compatibility analysis identifies the concrete changes required for the upgrade.

![Assessment report showing the current state and modernization targets](assets/assessment-cve-md.png)
> The security findings trace each CVE to a specific dependency and version, explain its impact, and provide a minimum safe upgrade target. The agent queries **[GitHub’s public advisories](https://github.com/advisories)**, in batches of dependencies, using package/version.

![Assessment report showing the current state and modernization sequence](assets/assessment-recommendations-sequence.png)
> The recommended sequence isolates risk into testable stages: remediate CVEs first, move to Java 17, complete the Spring Boot and Jakarta migration, and then advance to Java 25. Running the full test suite after each stage makes failures easier to identify and resolve.



## Step 5: Validate and refine the findings

Compare each material finding in the assessment with the baseline evidence.
Correct unsupported assumptions, add missed dependencies and constraints, and
record which recommendations you accept, reject, or defer before planning.

## Step 6: Build the modernization plan

Now that the assessment is complete and validated, you can generate a modernization plan. The plan organizes the recommended tasks into a prioritized sequence of executable steps, including validation criteria for each task.

It's time to start fresh with a new Copilot session !

### Why start a new session?

The first session has completed its assessment role and externalized the information needed for planning into a repository artifact:

- `./assessment/assessment.md` contains the validated findings, supporting evidence, risks, and recommendations;

This file provides a durable handoff between the assessment and planning phases, so the planning agent does not need the assessment conversation itself. That conversation may contain source-code scans, command output, subagent messages, intermediate conclusions, and repeated findings. Continuing in the same session makes that history compete with the plan for space in the model's context window and can cause Copilot to process more tokens on every turn.

Starting a new session gives the planner a clean context. Copilot only needs to load the final assessment artifacts, the planning prompt, and any relevant project files. This reduces unnecessary token usage, leaves more context capacity for producing a detailed plan, and prevents superseded assessment discussions from distracting the planner from the validated findings.

> **Important:** Before requesting the handoff, make sure `assessment.md` is saved and available on the branch or worktree that the new session will use. The files carry the work forward; the previous chat history does not.

<div data-visible="$$copilot_app$$">

You do not need to create the session or change its mode manually. From the completed assessment session, copy and send the following prompt:

<div class="info" data-title="tip">

> By typing @, you will have a filepicker to help you provide the exact path

</div>

```text
First persist and commit the completed assessment artifact at @./assessment/assessment.md so it is available to and can be read by the planning session. After that, create a new session for this repository in Plan mode, using Auto mode for model selection. In the new session, use assessment.md as the source of truth to create a prioritized, executable modernization plan for the Order Service. Preserve the validated target state and accepted recommendations recorded in this artifact. Include dependencies, risk, scope, and validation criteria for every task. Keep this assessment session unchanged and perform all planning in the new session.
```

> **Note:** The prompt requests **Auto** mode for model selection, but you can instead select a reasoning model for planning the modernization.

![Assessment session creating an isolated planning session](assets/start-new-session.png)

> Copilot confirms that it created a separate planning session grounded in the assessment artifact. The assessment session remains unchanged and only coordinates the handoff.

![New planning session running in Plan mode with the planning coordinator](assets/plan-new-session.png)

> The new session appears separately in the repository session list. It runs in **Plan** mode with the planning coordinator agent, loads the modernization-planning skill from the plugin, and references `assessment.md` in the kickoff prompt.

![Generated modernization plan showing the target state and executable tasks](assets/view-plan.png)

> Copilot first presents a concise plan summary for review. It preserves the validated security-first sequence, orders the migration tasks by dependency, identifies the files it will generate, and waits for approval.

![Full modernization plan showing the target state and executable tasks](assets/plan-details.png)

> Select **View full plan** to inspect the complete proposal. Verify the problem statement, target Java and Spring Boot versions, task priorities, exact scope, and task ordering against the validated assessment.

![Modernization plan dependency gates and persistent artifact outputs](assets/plan-details-tasks.png)

> The final sections define release gates between the security, Spring Boot, Java 21, and Java 25 stages. They also identify the persistent `plan.md` and `tasks.json` outputs and confirm that the assessment artifacts remain read-only.

![Plan approval gate with implementation and revision options](assets/approve-for-implementation.png)

> The completed plan pauses at an explicit approval gate. Review the full plan before selecting **Approve and implement with autopilot**; alternatively, exit Plan mode to continue manually or request changes when the scope, sequencing, or validation criteria need refinement.

![Generated modernization tasks JSON showing task metadata and dependencies](assets/plan-tasks.png)

> After approval, Copilot persists the executable task graph in `tasks.json`. Each task records its type, exact requirements, dependencies, and measurable success criteria, enabling the implementation agents to execute work in the intended order and verify every result.

![Planning session confirming that plan.md and tasks.json were validated and saved](assets/approved-plan.png)

> After approval, Copilot validates and saves the two planning artifacts, `plan.md` and `tasks.json`, under `.github/modernize/<plan-name>/`. No modernization tasks are executed at this stage.

</div>

<div data-visible="$$copilot_cli$$">

In the completed assessment Copilot CLI session, first confirm that the `assessment.md` file is
saved. Then enter `/new` to start a clean conversation, enter `/agent`, and
select the user-invocable `modernize` orchestrator. The orchestrator delegates
planning to the plugin's internal planning coordinator.

Press `Shift+Tab` until the status line shows **Plan** mode (in blue), then enter:

```text
Use @./assessment/assessment.md as the source of truth to create a prioritized, executable modernization plan for the Order Service. Preserve the validated target state and accepted recommendations recorded in this artifact. Include dependencies, risk, scope, and validation criteria for every task. Do not implement the plan.
```

<div class="info" data-title="tip">

> By typing @ in Copilot CLI, you will have a filepicker to help you provide the exact path

</div>

![Copilot CLI plan ready for review](assets/cli-plan-ready.png)

When the task is finished, a plan and a task list has been created. Select `Exit plan and I will prompt it myself`.

To read the plan in detail you can type `/session plan` whenever you
want to reopen it, and request revisions until the scope, ordering, dependencies,
and validation gates match the assessment.

To open it in edit mode and make manual changes just do `ctrl+y` and you'll be able to apply some changes.

</div>

When the plan is ready, enter:

```text
Persist the approved modernization plan as plan.md and tasks.json under .github/modernize/<plan-name>/. Validate both artifacts and stop without executing any modernization task.
```

<div data-visible="$$copilot_cli$$">

Confirm that both files were written and that no application source files were
changed. On codespace, if you don't  see the files in the file explorer, hit the refresh button and you should see them.
![VS Code explorer refresh](assets/vsc-explorer-refresh.png) 

</div>

---

# Level 2: Setup the guardrails

<div class="info" data-title="Selected path" data-visible="$$copilot_cli$$">

> You are on the **GitHub Copilot CLI** path. 

</div>

<div class="info app-path" data-title="Selected path" data-visible="$$copilot_app$$">

> You are on the **GitHub Copilot App** path. 

</div>

<div data-hidden="$$copilot_cli$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_cli:1'); window.location.href = url"> Use GitHub Copilot CLI </button>

</div>

<div data-hidden="$$copilot_app$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_app:1'); window.location.href = url"> Use GitHub Copilot App </button>

</div>

Before running the implementation with the created plan, it's always better to define your coding and quality standard, the methodologies, patterns and practices that will guide the modernization process.

We call these the **guardrails** and it's the best way to ensure that the results of the modernization process align with your standards and expectations.

Exactly as you onboard new team members, you should define and communicate the guardrails to ensure everyone follows the same standards and practices during the modernization process.

## Agents, Skills & Instructions

GitHub Copilot can use custom agents Agents, Skills and Instructions to perform specific tasks with better accuracy.

Agents let you refine the persona with a goal, a methodology and built-in standards, like a code reviewer that enforces type hints, or a testing helper that writes pytest cases. You’ll see how the same prompt gets noticeably better results when handled by an agent with targeted instructions.

Skills encapsulate reusable logic, mixing prompt and code, with instructions guiding the agents on how to use these skills effectively. 

Instructions files contain the guidance that is automatically followed by the agents and we will use it to define specific context and rules about our project.

## Step 1: Find and install plugins, skills, agents and instructions

Awesome Copilot provide a bunch of very useful resources built by the community that will help you accelerate your guardrails initial setup.

Before running the following command, make sure you have started a new Copilot session.

<div data-visible="$$copilot_cli$$">

<div class="info" data-title="tip">

> If you stopped a previous session but you want to reopen it, you can use the <b>/resume</b> command.

</div>

![resume command to reopen previous session](assets/cli-resume-session.png)


**In the new Copilot session**, run the following command to browse the Awesome Copilot marketplace:

```bash
/plugin marketplace browse awesome-copilot
```

This will list all the available plugin with a short description. To optimize your experience install the "awesome-copilot" plugin:

```bash
/plugin install awesome-copilot@awesome-copilot
```

This install 3 dedicated skills that will suggest the most relevant and context-aware specialized Instructions, Agents or Skills from Awesome Copilot based on your prompt.

```bash
/awesome-copilot:suggest-awesome-github-copilot-instructions <your-prompt>
/awesome-copilot:suggest-awesome-github-copilot-agents <your-prompt>
/awesome-copilot:suggest-awesome-github-copilot-skills <your-prompt>
```

Try this prompt to find relevant instructions files for Java development:

```bash
/awesome-copilot:suggest-awesome-github-copilot-instructions java and springboot coding standards
```

This will provide you something like this:
![CLI suggest instructions files](assets/cli-suggested-instructions.png)

If you want to install one of the suggested instructions files, run the following command:

```bash
install the springboot.instructions.md file
```

</div>

<div data-visible="$$copilot_app$$">

**Install from the GitHub Copilot app**

Open the [Awesome Copilot catalog](https://awesome-copilot.github.com/), select **Plugins**, and search for **awesome-copilot**. On the [plugin details page](https://awesome-copilot.github.com/plugin/awesome-copilot/), select **Open in GitHub Copilot app** and confirm the installation.

In the app's **Plugins** view, expand the **awesome-copilot** marketplace and confirm that the **awesome-copilot** plugin is enabled.

Open the **Skills** tab and filter by this plugin to view the three skills for finding relevant community instructions, agents, and skills:

- `suggest-awesome-github-copilot-instructions`
- `suggest-awesome-github-copilot-agents`
- `suggest-awesome-github-copilot-skills`

Run the following prompt to find community instructions for Java and Spring Boot coding standards in a side session:

> **Note:** `/side` starts a side session for the prompt that follows, keeping this lookup separate from your main modernization conversation.

```text
/side /awesome-copilot:suggest-awesome-github-copilot-instructions java and springboot coding standards
```
![alt text](assets/java-spring-instructions.png)
Review the suggestions. If `springboot.instructions.md` is among them, ask Copilot to install it:

```text
Install the suggested springboot.instructions.md file in .github/instructions/. Preserve existing project guidance and ask before overwriting any files.
```

</div>

## Step 2: Prepare your project for AI

We want to optimize out project for AI development, ensuring that all necessary instructions files are installed and the project structure aligns with the guidelines provided by the Awesome Copilot skills.

There is plenty of Skills available that can help achieve that. Here are a few step to follow to help you kickstart it effectively. It's just one way to get started, and we recommend that you explore more skills to build your own optimized AI development workflow.

**Prepare your project for AI**

We will start by installing a first skill, named `AI-Ready` created by John Papa.

This can be install through a dedicated plugin available in the Awesome Copilot marketplace.

<div data-visible="$$copilot_cli$$">

```bash
/plugin install ai-ready@awesome-copilot
```

Then simply launch the process by typing the following command:

```bash
make this repo ai ready to prepare for code modernization according to @.github/modernize/<plan-name>/plan.md
```

The skill will run a complete analysis of your project, the plan and will try to optimize your project structure and configuration for AI development.

It will automatically create a main instructions file to add precise contexte for Copilot such as the important files for migrations, the code structure, code conventions and rules. It can also create or install some other specific instructions files, prompts and skills as needed.

![AI Ready Process completed](assets/cli-ai-ready-process.png)

</div>

<div data-visible="$$copilot_app$$">

Open the [Awesome Copilot catalog](https://awesome-copilot.github.com/), select **Plugins**, and search for **ai-ready**. [Open the plugin details page](https://awesome-copilot.github.com/plugin/ai-ready/), select **Open in GitHub Copilot app**, and confirm the installation.

In the app's **Plugins** view, expand the **awesome-copilot** marketplace and confirm that the **ai-ready** plugin is enabled. Open the **Skills** tab and filter by this plugin to view its available skills.

In a session for this repository, send the following prompt:

```text
/side Make this repo ai ready to prepare for code modernization according to @.github/modernize/<plan-name>/plan.md
```

The skill analyzes the repository and modernization plan to identify relevant files, project structure, coding conventions, and rules. It can create or update instructions and suggest additional prompts and skills as needed.

Before continuing, review the generated guidance and keep it concise and relevant to the planned migration. Ensure the accepted changes are available in the branch or worktree used by subsequent modernization sessions.

![AI Ready Process completed](assets/app-ai-ready-process.png)

</div>

<div data-visible="$$copilot_cli$$">

## Step 3: Use copilot to install all necessary skills

We have a clear technology stack and project structure defined with our migration plan and we can use it to guide the installation of all necessary skills for our project.

In order to improve the speed and efficiency of finding and installing the necessary skills, we will use the `fleet` command with `autopilot` mode to leverage multiple agents in parallel.

Open a new Copilot, ensure you are in `auto` model (or your choice of model), press `shift+tab` until you go in `autopilot` mode and start by typing this prompt:

```bash
/fleet According to @.github/modernize/<plan-name>/plan.md and help me find and install the most relevant skills to help migrate my project according to the best practices. First use the suggest-awesome-github-copilot-skills skill to analyse and find the best one. Let me choose and help me install it on my project.
```

**Autopilot mode** will launch multiple agents in parallel and you will be able to monitor it with the `/tasks` command during the process.

Once the process is complete, you can simply choose the skills you want to install and let Copilot handle the installation for you.
![CLI selection skills](assets/cli-selection-skills.png)

Guardrails are essential to improve the quality and reliability with AI-driven development processes but keep in mind that **every instructions file and skills you add** will be integrated into the context sent with your Copilot requests, **consuming tokens**. Keep it clean and concise and don't overload it with unnecessary information.

</div>

<div class="info" data-title="Tip">

> Some skills can help reduce you tokens consumption by installing the `caveman` instructions files or the `steno` skill from Awesome Copilot.

</div>

---

# Level 3: Implementation

<div class="info" data-title="Selected path" data-visible="$$copilot_cli$$">

> You are on the **GitHub Copilot CLI** path. 

</div>

<div class="info app-path" data-title="Selected path" data-visible="$$copilot_app$$">

> You are on the **GitHub Copilot App** path. 

</div>

<div data-hidden="$$copilot_cli$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_cli:1'); window.location.href = url"> Use GitHub Copilot CLI </button>

</div>

<div data-hidden="$$copilot_app$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_app:1'); window.location.href = url"> Use GitHub Copilot App </button>

</div>

You are now ready to execute the approved modernization plan with your selected GitHub Copilot client. Both paths invoke the same `modernize` orchestrator and use the plan artifacts created in Level 1 and refined with the guardrails from Level 2.

The implementation is intentionally performed in a separate session. The execution agents need the final `plan.md`, `tasks.json`, rulebook, and project files, but they do not need the assessment and planning conversations.

## Before you begin

Confirm that:

- the final `plan.md` and `tasks.json` are present under
  `.github/modernize/<plan-name>/`;
- the plan reflects the guardrails added in Level 2;
- the approved artifacts are available in the branch or worktree used by the
  new execution session;
- the baseline tests from Level 1 pass, or any pre-existing failures have been
  recorded; and
- the target JDK and Maven versions required by the approved plan are
  available.

Do not run two implementation sessions against the same worktree at the same
time. The executor creates a dedicated `modernize/java-<timestamp>` branch and
all worker agents contribute to that branch.

## Understand the multi-agent workflow

Only the `modernize` agent is user-invocable. Do not select an execution
coordinator or worker directly. The orchestrator loads the existing plan and
delegates its tasks through the following hierarchy:

![Modernization agent hierarchy from orchestrator and coordinators to specialized workers and build validation](assets/agents-flowchart.png)

The execution coordinator groups related Java and Spring Boot upgrades into a single delegation, sends security and migration work to their specialized agents, runs independent work in parallel when possible, and waits for task dependencies before continuing. Each worker is responsible for its code changes, commits, and validation.

## Step 1: Choose the execution model

Model choice affects reasoning quality, tool use, speed, and AI credits consumption.

Choose a specific model for the implementation session, or leave the model set
to **Auto** and let GitHub Copilot select one. Record the selected model so you can compare execution time, tool calls, and results with
another run after the workshop.

<div data-visible="$$copilot_app$$">

Use the model picker in the GitHub Copilot app to select a model for the new
implementation session, or leave it set to **Auto**.

</div>

<div data-visible="$$copilot_cli$$">

Enter `/model` in GitHub Copilot CLI and select a model for the implementation
session, or leave the model set to **Auto**.

</div>

## Step 2: Start the implementation

<div data-visible="$$copilot_app$$">

Remain in the completed planning session after approving the plan. From that same session, send the following handoff prompt:

```text
Start a new session with the modernize agent in Autopilot mode using Auto model. In that new session, execute the approved modernization plan for the Order Service from @plan.md. Use @tasks.json as the source of truth, enforce the rulebook, and respect every dependency and validation gate.
```
![Planning session creating a separate Autopilot implementation session from the approved plan](assets/start-implementation.png)

Copilot creates a separate implementation session and worktree while leaving the approved planning session unchanged. Open the new session from the repository session list, then verify that it uses the `modernize` agent, runs in **Autopilot** mode, and references the approved `plan.md` and `tasks.json` before implementation begins.

![Modernize Autopilot session delegating the approved plan to the execution coordinator](assets/execute-session.png)

</div>

<div data-visible="$$copilot_cli$$">

From the completed planning conversation, confirm that the approved `plan.md`
and `tasks.json` are available, then enter `/new`.


Enter `/agent` and select the
user-invocable `modernize` orchestrator. Enter `/model` and select Claude Sonnet
5, or GPT 5.5 for example, or the closest model available in your organization.

Press `Shift+Tab` until the status line shows **Autopilot** mode. 

Enter this prompt:

```text
Execute the approved modernization plan for the Order Service from @plan.md. Use @tasks.json as the source of truth, enforce the rulebook, and respect every dependency and validation gate.
```

Review the permission prompt carefully; grant the permissions required by the plan only in the isolated workshop repository or Codespace.

Let the orchestration finish before editing files in the implementation worktree.

</div>

<div data-visible="$$copilot_app$$">

The session delegates implementation tasks to background subagents. Open the **Background** view to inspect which specialized agent owns each task and to follow its progress.

![Implementation session with the execution coordinator running in the Background activity panel](assets/execution-background-session.png)

</div>

<div data-visible="$$copilot_cli$$">

![CLI showing tasks running](assets/cli-tasks-running.png)

The session delegates implementation tasks to background subagents. Enter
`/tasks` to inspect ownership and progress. 

![CLI showing task list](assets/cli-task-list.png)

Select a task to view its details or
open the delegated agent's session, then return to the main session and allow
the orchestration to finish.

</div>

## Step 3: Observe the orchestration

While execution is running, identify and record:

1. the branch created for the implementation;
2. the task groups sent to each specialized worker;
3. the build or test command used at each release gate; and
4. any retry, blocked task, or deviation from the approved plan.

<div data-visible="$$copilot_app$$">

![Execution coordinator confirming creation of the timestamped modernization branch](assets/execution-branch.png)

![Security worker removing log4j-core and upgrading commons-text in pom.xml](assets/execution-security-agent.png)

![Java upgrade worker changing Maven compiler settings from Java 8 to Java 17](assets/execution-jdk17.png)

</div>

<div data-visible="$$copilot_cli$$">

Use `/tasks` to follow active and completed subagents. You can also inspect the
implementation branch and recent commits without leaving the CLI by entering:

```text
!git branch --show-current
!git log --oneline --decorate -10
```

</div>

Autopilot removes repetitive approval prompts; it does not remove quality gates. A task is successful only when its required build, tests, and acceptance criteria pass. If a worker reports a failure, preserve its diagnostics and do not approve the remaining dependent tasks as complete. Ask the orchestrator to retry only after you have reviewed the cause.

## Step 4: Review the execution result

When all workers return, inspect the final execution summary generated as well as the detailed Markdown migration report generated (`my-migration-report.md`).

It should state most information relevant to the modernization process:

- completed and failed tasks;
- files and dependencies changed;
- commits created on the modernization branch;
- build and test results; and
- any manual follow-up work.

<div data-visible="$$copilot_app$$">

![Execution summary listing all five modernization tasks, worker agents, results, and commits](assets/execution-summary.png)

</div>

<div data-visible="$$copilot_cli$$">

![Execution coordinator confirming tasks achieved](assets/cli-execution-tasks-achieved.png)

![Detailed migration report](assets/cli-execution-migration-report.png)

Enter `/tasks` and confirm that no implementation task is still active. Then
enter `/diff` to review the modernization branch changes from inside GitHub
Copilot CLI.

</div>

Review the branch history and working tree before continuing to running your own checks.

## Step 5: Verify independently

Agent-reported validation is useful evidence, but it does not replace your own
acceptance check. From the Order Service directory, run:

```bash
mvn clean test
mvn clean package
```

Confirm the effective runtime and build JDK match the approved target:

```bash
java -version
mvn -version
```

Start the modernized backend:

```bash
mvn spring-boot:run
```

In another terminal, verify that the existing API contract still works:

```bash
curl http://localhost:8080/api/orders
```

Finally, start the frontend and confirm that its order list and create-order
workflow still work against the modernized API:

```bash
cd frontend
npm install
npm run dev
```

Compare these results with the Level 1 baseline. Record any behavior change,
warning, failed test, or plan deviation before moving to the quality and
security review in Level 4.

Push your changes to the remote repository and open a PR for the modernization branch.

---

# Level 4: Quality & Security

In this level, use **[Copilot Coding Review](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review)** to review the pull request created
in the previous levels. You will add a [custom review instruction](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review#customizing-copilots-reviews-with-custom-instructions), run the review,
and capture the results.

## Step 1: Find review instructions

In Copilot Chat, run `/awesome-copilot:suggest-awesome-github-copilot-instructions` to find or generate Copilot instruction files that are suitable for code reviews. Use the suggested review instructions to inform the custom instruction for this pull request.

![alt text](assets/coding-review-instructions.png)

## Step 2: Install the custom review instructions

Install the practical generic one: code-review-generic.instructions.md as `.github/copilot-instructions.md`

## Step 3: Commit and push the instructions

Commit and push the addition to the already-open PR branch

![alt text](assets/pr-copilot-instructions.png)

## Step 4: Request a Copilot review

Under "Reviewers" in the right sidebar, next to Copilot, click Request.

![alt text](assets/request-review.png)

## Step 5: Read the review feedback

Wait for Copilot to review the pull request and provide its feedback.
Scroll down and read through Copilot's comments.

## Step 6: Triage the review comments

Review each comment and decide whether to apply, discuss, or dismiss it. Copilot labels each comment with a severity level of "High," "Medium," or "Low" to help you prioritize the issues it finds based on their importance.

![alt text](assets/copilot-review-overview.png)

---

# Bonus: Generate a migration report


<div class="info" data-title="Selected path" data-visible="$$copilot_cli$$">

> You are on the **GitHub Copilot CLI** path. 

</div>

<div class="info app-path" data-title="Selected path" data-visible="$$copilot_app$$">

> You are on the **GitHub Copilot App** path. 

</div>

<div data-hidden="$$copilot_cli$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_cli:1'); window.location.href = url"> Use GitHub Copilot CLI </button>

</div>

<div data-hidden="$$copilot_app$$">

<button onclick="const url = new window.URL(window.location.href); url.searchParams.set('vars', 'copilot_app:1'); window.location.href = url"> Use GitHub Copilot App </button>

</div>

You reached the end of this migration, congratulations!

The last step of your job is to be able to present your work to your team or stakeholders and putting a value on the improvements and changes you have made.

GitHub Copilot maintain a local history of your sessions and it's very easy for you to request a summary or generate a presentation based on your work history.

Open a new Copilot session and select a medium model like `GPT-5.6 Luna` for example and type the following prompt:

```bash
Generate a markdown report listing all operations done in all copilot session on this folder for the past 24 hours, detailing which model has been used and how many AI Credit where consumed and many other details
```

![Session Report generated CLI](assets/cli-session-report-generated.png)

Open the report file in preview mode to review the generated content.

![Session Report preview](assets/session-report-preview.png)

This is pretty cool but what if you have a last minute opportunity to present your work and you need a shiny Business oriented PPT presenting your migration and improvements and also the AI cost incurred?

Let's see how GitHub Copilot can help you handle that!

<div data-visible="$$copilot_cli$$">

First, you will need to add the `anthropic/skills` marketplace and install the `document` plugin:

```bash
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
```

</div>

<div data-visible="$$copilot_app$$">

First, add the `anthropics/skills` marketplace and install the `document-skills` plugin:

Select **Customize** in the left sidebar to open the app's customization settings.

![GitHub Copilot app sidebar with Customize highlighted](assets/github-app-customize.png)

Open the **Plugins** tab. Under **Available**, select the gear icon next to the marketplace filter to open **Manage marketplaces**. Enter `anthropics/skills` in the **Source** field and select **Add**. If **anthropic-agent-skills** is already listed, you can skip adding it again.

![GitHub Copilot app Manage marketplaces dialog for adding a plugin source](assets/manage-marketplace.png)

Close the dialog and search for `document-skills` in the **Plugins** tab. Select **Install** for the plugin from **anthropic-agent-skills**, then confirm that it appears under **Installed** with its toggle enabled, as shown below.

![GitHub Copilot app Plugins view with document-skills installed and enabled](assets/document-skills.png)

</div>

This plugin add capabilities to generate documents such as Excel, Word, PowerPoint, and PDF.

Now switch to `autopilot` mode and ask to copilot to generate the PPT for you:

```bash
Using the files in @.github/modernize and the sessions report, and using document-skills anthropics/skills plugin create a 4 slides PowerPoint presentation including the highlight of this migration, with all the technical and business impacts, add details on how we ensure quality and finish with a dashboard style final slide focused on the AI usage and cost for this migration. Use Playwright for adding screen capture. Make it modern and visually appealing.
```

Once finished open and review the document and you are ready to go!

![Final Presentation made by Copilot](assets/final-ppt.png)