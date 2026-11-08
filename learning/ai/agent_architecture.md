# AI Assistants and Agents: Architecture and Practical Guide

[日本語](agent_architecture_jp.md)

This consolidated guide combines the architecture and practical material formerly maintained in `agent_architecture.md` and `AI_GUIDE.md`. It explains the relationships between assistants, agents, harnesses, LLMs, and extensions through implementation, execution, and practical use.

**Engineering goal:** customize AI for your development procedures, tools, and UI. After the overall architecture, focus on [section 12](#12-engineering-customization-what-you-can-change); section 3 maps each product to execution environments and I/O.

Prerequisites: C/C++, Python, TypeScript, Linux, OS processes, and system calls. Start with the overall structure and execution locations, then proceed to components and practical examples. Terminology varies by product; this is not a claim about private implementations.

Reading map: sections 1–5 cover the overall system, products, and execution; 6–11 explain core components; 12–16 cover customization and operation; 17–20 connect the practical workflow and troubleshooting.

![AI agents at a glance: roles on the left, user/UI/agent/tool relationships in the center, and extension roles on the right.](assets/agent_architecture/overview_infographic_en.png)

**How to read the image:** follow the center from top to bottom: a request reaches the agent through the UI. The blue harness and green LLM exchange information; tools below perform operations and return results. Side cards summarize terms. Colors and boundaries indicate conceptual roles, not processes or deployment locations.

## 1. Overall structure: from user to execution environment

The user supplies a goal through a UI. An agent combines harness control, LLM generation and decisions, and tool operations. Agent and harness are not synonyms: here, the harness is the control layer supporting the agent.

UI and harness may share an application or run in separate services. Model inference may also be local or remote.

The following **UML deployment/component view** separates execution environments, OS processes, software components, and files. Solid connections show exchanges; dashed arrows show use/read dependencies. `«process»` is a diagram-specific stereotype for a running OS process.

![UML overview showing the user, UI, agent harness, instruction and skill files, command hook process, model inference, tools, and MCP server across execution environments.](assets/agent_architecture/uml/agent_deployment_en.png)

[Open full-size PNG](assets/agent_architecture/uml/agent_deployment_en.png) · [Editable PlantUML source](assets/agent_architecture/uml/agent_deployment_en.puml)

For example, the harness reads a selected Skill's instructions into the model context. The model returns a tool name and arguments; the harness checks permission, dispatches the tool, and supplies its result to a later model call. MCP is a protocol between client and server, not an instruction file supplied directly to the LLM. The command hook shown here illustrates one hook type; supported hook types vary by product.

## 2. Start with three roles

**The LLM generates the next step. Tools perform operations. The harness manages the exchange. Together, they make up the agent system described here.**

**The cycle:** supply model input → receive an action request → execute the permitted operation → return its result.

| Name | Plain explanation | In “Fix this bug” |
| --- | --- | --- |
| LLM | Generates an answer or the next operation request | “Read this function first” |
| Harness | Manages information, execution, and progress | Reads the requested file and returns its contents |
| Tool | Performs a defined operation | Reads, edits, or runs a test |
| Agent | The system pursuing the goal over multiple steps | Investigates, edits, verifies, and reports |

- The **host** is the application you use, such as a CLI or chat application. Harness functions live in that application and its supporting software.
- Context, tokens, MCP, and execution environments describe the information, units, connections, and locations used by these roles. We add them one at a time below.

## 3. Products, models, and harnesses

| Provider | Assistant product | Coding products or features |
| --- | --- | --- |
| OpenAI | ChatGPT | Codex |
| Anthropic | Claude chat | Claude Code |
| GitHub / Microsoft | GitHub Copilot | Copilot agent features, Copilot CLI |

These are usage categories, not exclusive classes. Assistants can include agent features, and products are distinct from models. Related products need not share an application or harness. Changing the model need not replace the harness, although available tools or settings may change.

### 3.1 Reading the product diagrams: actors, environments, and I/O

The following examples use **Codex CLI, Claude Code CLI, and GitHub Copilot CLI with cloud model inference**. Claude here means Claude Code; Copilot means GitHub Copilot. Section 3.7 distinguishes browser, IDE, and cloud execution modes.

- **A: user; B: UI; C: agent execution control (harness); D1: model inference; D2: tools performing operations.** The identifiers match across products.
- Large boxes mark execution environments; arrows show data flow. UI and harness are logical roles, not necessarily separate processes.
- The CLI execution environment need not be the user's PC. When launched on an SSH host or in a development container, ordinary file and shell operations run there.
- **Context** is the information supplied for this call: the prompt, applicable instructions, selected skill content, conversation, retrieved files/search results, and prior tool results. Tool definitions describe operation names, descriptions, and argument schemas.
- Instructions and skills are stored information, not necessarily independent running programs.

### 3.2 Codex CLI

The Codex CLI UI, harness, and ordinary file/shell operations are on the CLI execution host. This example uses OpenAI model inference. The harness incorporates relevant AGENTS.md and skill content into model input. A local model provider can also be configured, changing D1's location. [O1][O2][O3]

```mermaid
flowchart TB
    U["A. User"]
    subgraph LOCAL["CLI execution environment: PC, SSH host, or container"]
        B["B. Codex CLI<br/>Terminal UI"]
        H["C. Codex harness<br/>Manage loop, input, execution, permissions"]
        F["AGENTS.md / Skills<br/>Settings and conversation history"]
        T["D2. File tools, Shell, Git"]
    end
    subgraph CLOUD["Cloud: model inference service"]
        M["D1. OpenAI model inference service"]
    end
    U -->|"Request, clarification, approval"| B
    B -->|"Display answer, progress, questions"| U
    B -->|"Request and user actions"| H
    H -->|"Answer, progress, diffs, questions"| B
    F -->|"Instructions, procedures, settings, history"| H
    H -->|"Context and tool definitions"| M
    M -->|"Answer OR tool name and arguments"| H
    H -->|"Permitted operation, paths, arguments"| T
    T -->|"Contents, change results, logs, exit code"| H
    classDef control fill:#dbeafe,stroke:#2563eb,color:#172554
    classDef model fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef data fill:#fef3c7,stroke:#ca8a04,color:#422006
    class H control
    class M model
    class F data
```

### 3.3 Claude Code CLI

The Claude Code UI, harness, and ordinary file/shell operations run where claude is launched. Model inference in this example uses a Claude model API. CLAUDE.md and selected skill content contribute to input. This is terminal use, distinct from ordinary Claude chat. [A1][A2]

```mermaid
flowchart TB
    U["A. User"]
    subgraph LOCAL["CLI execution environment: PC, SSH host, or container"]
        B["B. Claude Code CLI<br/>Terminal UI"]
        H["C. Claude Code harness<br/>Manage loop, input, execution, permissions"]
        F["CLAUDE.md / Skills<br/>Settings and conversation history"]
        T["D2. File tools, Shell, Git"]
    end
    subgraph CLOUD["Cloud: model inference service"]
        M["D1. Claude model API"]
    end
    U -->|"Request, clarification, approval"| B
    B -->|"Display answer, progress, questions"| U
    B -->|"Request and user actions"| H
    H -->|"Answer, progress, diffs, questions"| B
    F -->|"Instructions, procedures, settings, history"| H
    H -->|"Context and tool definitions"| M
    M -->|"Answer OR tool name and arguments"| H
    H -->|"Permitted operation, paths, arguments"| T
    T -->|"Contents, change results, logs, exit code"| H
    classDef control fill:#dbeafe,stroke:#2563eb,color:#172554
    classDef model fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef data fill:#fef3c7,stroke:#ca8a04,color:#422006
    class H control
    class M model
    class F data
```

### 3.4 GitHub Copilot CLI

The Copilot CLI UI, execution control, and ordinary file/shell operations are on the CLI host. This example reaches the selected model through GitHub Copilot services. The LLM is not one fixed model; available models and configuration determine the choice. BYOK and local model configurations are also supported. [G1][G2]

```mermaid
flowchart TB
    U["A. User"]
    subgraph LOCAL["CLI execution environment: PC, SSH host, or container"]
        B["B. GitHub Copilot CLI<br/>Terminal UI"]
        H["C. Copilot CLI harness<br/>Manage loop, input, execution, permissions"]
        F["Copilot instructions / Skills<br/>Settings and conversation history"]
        T["D2. File tools, Shell, Git"]
    end
    subgraph CLOUD["Cloud: model inference service"]
        M["D1. Copilot service / selected model"]
    end
    U -->|"Request, clarification, approval"| B
    B -->|"Display answer, progress, questions"| U
    B -->|"Request and user actions"| H
    H -->|"Answer, progress, diffs, questions"| B
    F -->|"Instructions, procedures, settings, history"| H
    H -->|"Context and tool definitions"| M
    M -->|"Answer OR tool name and arguments"| H
    H -->|"Permitted operation, paths, arguments"| T
    T -->|"Contents, change results, logs, exit code"| H
    classDef control fill:#dbeafe,stroke:#2563eb,color:#172554
    classDef model fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef data fill:#fef3c7,stroke:#ca8a04,color:#422006
    class H control
    class M model
    class F data
```

### 3.5 Inputs and outputs of each actor

The basic roles are shared across the three products. UI/harness implementations, loading rules, and supported tools differ.

| Actor | Environment | Input | Output |
| --- | --- | --- | --- |
| A. User | User of the UI | Displayed answers, progress, questions | Request, clarification, approval/rejection, cancellation |
| B. UI | CLI execution host in these examples | User input and harness events | Requests/actions to harness; display to user |
| C. Harness | CLI execution host in these examples | Request, instructions/settings/history, model output, tool results | Model input, permitted tool operations, UI events |
| D1. Model inference service | Cloud in these examples | Context, tool definitions, etc. | Answers and action requests such as tool names and arguments |
| D2. File operation tools | Environment with access to the working filesystem | Paths, read ranges, edit content | File contents, change results, errors |
| D2. Shell, Git, etc. | CLI execution host in these examples | Command, arguments, working directory | stdout/stderr, exit code, artifacts |
| External service | Provider infrastructure or an internal server | Authenticated API request and arguments | Data, operation results, errors |

Files are data; file tools perform reads and writes. Git is a program that can run through a shell. In addition to local operations, push and fetch communicate with a remote server.

Example: Run the tests → UI → harness → LLM → request to run pytest -q through Shell → harness → Shell → logs and exit code → harness → LLM → explanation → UI → user. The loop can repeat when needed.

### 3.6 Where MCP and extensions fit

MCP is a communication protocol. **MCP clients and MCP servers** are the running components. With the appropriate connection configured, all three products can use the following path from their harness. [M1]

```text
Harness → MCP client [agent side]
        → MCP server [CLI execution host or remote host]
        → External service when needed [service environment]

Request: capability discovery, or a tool name and arguments, etc.
Response: capability definitions, data, operation results/errors, etc.
```

Typical connections use stdio for a local child process and Streamable HTTP for a remote server. A local server can also use HTTP. A server operating on its own filesystem need not call an external service. Relevant returned content can become model input through the harness.

| Component | Storage / execution environment | Input → output |
| --- | --- | --- |
| Instructions and skills | Files/settings accessible to the agent | Loading/selection → instructions, procedures, references; script execution goes through tools |
| Hooks | Command handlers usually run in the agent execution environment; HTTP handlers run at configured endpoints | Events/arguments → completion status, logs, supported control data, etc. |
| Claude Code Mods | Claude Code internal extension mechanism | Exposed events/settings → supported behavior changes, UI output, etc. |
| Copilot CLI Extensions | Separate Node.js processes alongside the CLI | Events, tool/command calls → tool results, session behavior, etc. |
| Plugins | Distribution/installation units; execution depends on bundled components | Installation/loading → register skills, hooks, MCP configuration, etc. |

The table does not imply that every product supports every extension. Mods refer here to Claude Code; CLI Extensions refer to GitHub Copilot CLI. [A3][G3]

### 3.7 Browser, IDE, and cloud modes

**UI location alone does not determine where the harness and tools run.** The diagrams above are CLI examples; distinguish these modes instead of inferring deployment from a product name.

| Mode | UI location | Harness and ordinary working tools |
| --- | --- | --- |
| Codex local CLI / IDE session | Terminal / IDE | Selected local or development environment |
| Codex Cloud task | Browser, desktop, etc. | OpenAI-managed infrastructure; working files in a cloud workspace |
| Claude Code local CLI / IDE session | Terminal / IDE | Environment where Claude Code was launched |
| Claude Code cloud session | Browser, etc. | Anthropic cloud working environment |
| Claude Code Remote Control | Browser / mobile, etc. | Continues on the original Claude Code execution machine |
| Copilot CLI / IDE local session | Terminal / IDE | CLI host or the selected IDE agent execution environment |
| Copilot cloud agent | GitHub, etc. | Configured cloud environment / runner |

Remote development and cloud delegation change execution locations. The model inference service is chosen separately and need not share the agent host. These CLI diagrams also cannot be directly applied to the internals of ordinary ChatGPT or Claude chat. [O4][A4][A5][G4][G5]

## 4. Implementation and OS processes

Agent control is ordinary software. It can be implemented in C/C++, Python, TypeScript, Rust, or other languages and runs as one or more OS processes or distributed services. Languages and process counts vary by product.

For example, a harness process calls an LLM API, validates a returned `run_tests` request, and starts `pytest` as a child process. On Linux, process creation and file operations ultimately use system calls, usually through runtimes and libraries. With a remote shell tool, the execution service starts the process. Generated model text does not itself issue system calls.

## 5. Execution environment: where operations really run

**The execution environment is the machine or session where a tool performs its operation.** The model and the test command can run in different places.

**This is one example deployment:**

- Your PC runs a CLI, the command-line application receiving your request.
- The provider's server runs model inference.
- A cloud workspace runs file operations and `pytest`. A **container** is one possible way to provide an isolated process environment there.

Other products may run tools on your PC, use a VM, or run the whole host in the cloud. An MCP server can also be local or remote. This is not a universal deployment.

| Check | Plain question |
| --- | --- |
| Working directory | Which folder does a relative path refer to? |
| Filesystem permissions | Which files can this tool read or change? |
| Runtime and dependencies | Are Python and `pytest` installed here? |
| Network | Can this environment reach the needed service? |
| Account | Which identity is used by this CLI, browser, or MCP connection? |
| Persistence | Will these files survive the end of the session? |

- A **sandbox** enforces operation restrictions through the OS or infrastructure. Its restrictions are stronger than a prompt asking the model to avoid a path.
- `/workspace/project` in a remote environment is not automatically a folder on your PC.
- If source excerpts are sent to a remote model, those excerpts leave the workspace. Container isolation alone does not keep inference inputs local.

## 6. LLM: generate an answer or a request

**An LLM is a model that generates output from the information it receives.** LLM stands for *large language model*.

**Example:** the model sees a division function and generates “Raise an exception when the denominator is zero.” That is a proposed fix. A tool must edit the actual file, and a test must check the behavior.

- In practice, the model consists of learned parameters used by an inference process or service.
- **Training** changes the parameters. **Inference** uses them to process a request. Reading an attached document normally supplies input for inference.
- Model output can be wrong. The current contents of a repository or the outcome of a test need evidence from the relevant system.

## 7. Harness: keep the work moving

**A harness is the software that makes repeated model calls and tool operations work together.** Think of it as the work coordinator; it also applies execution limits and permissions.

**Example:** the model requests `pytest -q`. The harness checks that the command is allowed, runs it through the shell tool, waits for completion, and returns the exit code and log. The model can then decide whether to adjust the fix.

- A **tool call** is a request to run something. Its **result** tells us what actually happened.
- The harness manages context selection, running processes, progress, retries, and stopping conditions. These responsibilities may be split across an application, SDK, and infrastructure.
- The same LLM can behave differently with different tools, input selection, or error handling.
- Real systems also need cancellation and time/budget limits.

## 8. Context: the information on the desk right now

**Context is the information available for this model call.** A useful analogy is the material placed on a desk for the current task.

**Example:** for a division bug, useful context includes the requirement, the division function, and the failing test. An unrelated image folder probably does not help.

- A file being in the workspace does not mean the model has read it. Its contents must be retrieved and supplied.
- The visible chat history may differ from the exact input assembled by the host.
- Long conversations may be shortened or summarized. Important details can be lost, so keep requirements and unresolved decisions explicit.

| Easily confused terms | Difference |
| --- | --- |
| Model knowledge | Patterns stored in parameters through training |
| Context | Information supplied for the current inference call |
| Memory | Selected information saved by the application and retrieved later |

**RAG** means searching for relevant material and adding it to the input before generating a response. For example, search a specification and supply the matching paragraphs as context.

- Context is the information available for the current response: messages, files, retrieved passages, tool results, and system-provided information.
- A context window is finite, so long conversations may be truncated or summarized.

- Provide focused material: the relevant files, current requirements, exact errors, and recent decisions.
- Label sources and dates where freshness matters.
- Avoid dumping unrelated repositories or logs into a conversation.

- Memory may persist selected preferences or facts across conversations, depending on the product and settings.
- It is not a reliable replacement for versioned project documentation.
- Inspect, correct, and delete stored information through supported controls.

- For long tasks, maintain a short handoff note containing the goal, accepted decisions, completed work, remaining steps, and validation status.
- Recheck changing facts instead of treating old conversation history as current evidence.

## 9. Tokens: the units used to count input and output

**Tokens are the model's input/output units.** A token is not necessarily one word or one character.

**Why it matters:** the model has an input/output budget, and usage often contributes to cost. Exact segmentation depends on the model and language; the description does not imply a particular tokenization result.

**A hypothetical 32,000-token combined limit:**

| Budget item | Tokens |
| --- | ---: |
| Instructions and tool descriptions | 4,000 |
| Conversation | 8,000 |
| Relevant documents | 12,000 |
| Latest request | 1,000 |
| **Input subtotal** | **25,000** |
| Reserved for generation | 5,000 |
| **Remaining headroom** | **2,000** |

- A **context window** is a limit on how much a call can handle. This is a simplified budget; actual output limits and reasoning-token rules depend on the API.
- One user request may cause several model calls. Earlier content and new tool results can be processed on later calls, increasing total usage.
- Retrieve relevant excerpts and return concise logs to use the budget well. More input is useful when it adds needed evidence.
- An **access token** used to log in to a service is a different meaning of “token.”

## 10. MCP: a shared way to connect to capabilities

**MCP is a protocol for connecting an AI application to servers exposing tools and data.** Its full name is *Model Context Protocol*.

**Follow a search request:**

1. The LLM generates a request to search issues related to the bug.
2. The host checks the request; its MCP client sends it to the configured server.
3. The server queries the issue service using the available authorization.
4. Search results return to the host and can be supplied to the model as context.

| Part | Role |
| --- | --- |
| Host | The AI application using the capabilities |
| MCP client | Manages a connection from the host |
| MCP server | Exposes capabilities and handles requests |
| Service API | The issue/document/database system's own interface |

- Tools can also use direct functions or APIs. A local file edit does not require MCP.
- Connecting a server makes its capabilities available; it does not automatically load all its data or train the model on it.
- Access still depends on authentication, account permissions, and network restrictions. Creating an issue requires the appropriate write access in addition to search capability.

- To connect a server:

1. Choose a trusted server and verify its supported transport and capabilities.
2. Configure it using the host's documented settings.
3. Supply authentication through approved secret storage or authorization flows.
4. Grant the smallest useful scope, starting with read-only access.
5. Test a harmless operation and inspect the returned result.
6. Enable write operations only when needed and authorized.

- For connection failures, distinguish server startup errors, transport problems, unsupported capabilities, expired authentication, and insufficient permissions.
- Inspect sanitized logs without exposing tokens.
- Prefer a narrow tool with explicit arguments over unrestricted command execution when both satisfy the task.

## 11. Retrieval, RAG, and Knowledge Sources

- Retrieval-augmented generation (RAG) searches a knowledge source and supplies relevant results to the model before it answers.
- A typical pipeline ingests documents, splits them into passages, indexes them, retrieves candidates, and generates an answer with supporting references.

- Use file attachments for a small, task-specific collection.
- Use search for current or broadly distributed information.
- Consider RAG for a larger, maintained collection that users query repeatedly.
- MCP can expose a retrieval service, but MCP and RAG solve different parts of the workflow.

- Preserve document ownership, access controls, source identifiers, and update dates.
- Retrieval must enforce the requesting user's permissions; filtering only the final answer is insufficient.

- Evaluate whether the correct passages were retrieved and whether the answer is supported by them.
- Ask for citations and verify that they support the actual claims.
- When sources are missing or contradictory, report the gap instead of filling it with an unsupported answer.

## 12. Engineering customization: what you can change

The engineering goal is to adapt an agent to your repository, tools, and development process. The useful questions are **what you write, when the host invokes it, where it runs, what it receives, and what it can change**. These mechanisms compose; they are not a ladder of increasingly powerful versions of the same feature.

```text
Your project rules and procedures
    Instructions / Skills
            | relevant content becomes model input
            v
    Harness <----------------------> LLM
       |       context / answer or tool request
       |
       +-- lifecycle event --> Hook handler --> supported result/control data
       |
       +-- extension API <--> Mod / CLI Extension
       |                      behavior, UI, commands, tools, session state
       |
       +-- operation request --> Built-in/custom tool
       |                      or MCP client --> MCP server --> service
       |
       +-- delegated task --> Sub-agent --> findings / artifacts

Plugin: packages supported combinations of these components for distribution.
SDK / application API: lets your own program drive or embed an agent runtime.
```

### 12.1 Mechanisms, execution locations, and I/O

| Mechanism | What you implement | Trigger and execution location | Input → output / effect |
| --- | --- | --- | --- |
| Instructions | Scoped Markdown rules or settings | Host loads applicable content | Rules → model guidance; e.g. supported build command |
| Skills | SKILL.md, references, templates, helper scripts | Explicit invocation or task-based selection; scripts run through tools | Task and procedure → guided work and artifacts |
| Hooks | Event registration plus a handler, often a script | Product-defined lifecycle event; command handlers usually run in the agent environment | Event payload → exit status, logs, context or decisions supported by that event |
| Claude Code Mods | JavaScript/TypeScript hooks module inside a plugin | Exposed events inside Claude Code | Events and state → supported behavior changes, commands or UI |
| Copilot CLI Extensions | JavaScript module using the extension SDK | Separate Node.js process alongside the session | Session events and tool/command calls → results and session-aware behavior |
| Custom tools / MCP servers | Operation implementation and input schema | A permitted call; local process or remote service | Named arguments → structured data, artifacts or an operation result |
| Custom agents / sub-agents | Role instructions and permitted tools, sometimes model configuration | Selected role or delegated task; location depends on runtime | Bounded assignment and context → findings, code or other artifacts |
| Plugins | Manifest and supported components | Installation and loading; each component has its own runtime | Bundle → registered skills, hooks, tools, etc. |
| SDK / application API | Your own Python/TypeScript or other application | Your service, CLI, CI job or scheduler | Tasks and options → agent events, results and artifacts |

MCP standardizes communication with a server exposing capabilities. A tool implementation provides the capability itself. A plugin packages components; it need not be a separate executable. A skill can contain code, but loading its text alone does not run that code.

### 12.2 Hooks: event handlers rather than a model deciding to call a tool

For a command hook, the sequence is conceptually:

```text
A configured event occurs in the harness
    → match the event and filters
    → start your handler with the event payload
    → read its exit status / supported output
    → continue, add context, or apply a supported decision
```

For example, after a successful edit operation, a hook can identify changed C++ files and invoke an existing formatting script. The script receives event data, derives validated file paths, runs clang-format, and returns a status and useful log. Whether the host exposes those exact fields or consumes additional JSON depends on the product and event.

- The host dispatches an enabled, trusted matching hook; it does not depend on the LLM remembering to request that hook.
- Successful execution still depends on registration, event matching, dependencies, timeouts and handler behavior.
- A pre-action event may support allowing, blocking or modifying a request. A post-action handler cannot undo an operation merely by reporting failure.
- Not every hook is a shell program. Supported handlers can also include MCP, HTTP or model-backed handlers, depending on the product. [C1][C2][C3]

### 12.3 Mods and CLI Extensions: code participating in a live session

A **Claude Code Mod** supplies functions in a hooks module. Claude Code calls them at exposed events, and the module uses supported APIs to affect behavior or display. A useful example is a session panel showing the most recent test result. This is an event-handler/middleware-style extension mechanism; its API defines what can be changed. [A3]

A **Copilot CLI Extension** runs as a separate Node.js process and connects to the session through the extension SDK. It can keep session state, expose tools and slash commands, and react to events. For example, it could accumulate test-run durations and provide a command that reports the total. The documented CLI extension feature is experimental. [G3]

The distinction from a simple command hook is the integration contract: which events and APIs are available, how session state is maintained, what UI/commands can be added, and how the extension communicates with the host. They overlap in purpose; neither label implies unlimited control of the harness. IDE extensions and the retired GitHub App-based Copilot Extensions are different mechanisms.

### 12.4 Plugins: distribute a working combination

A team plugin might package a code-review skill, a formatting hook, an internal issue-search MCP connection, and a supported command/UI extension. Installation makes the components discoverable; each component then follows its own selection, event, execution and permission rules. Packaging does not by itself trigger every component or grant service access.

Plugin manifests and supported contents differ between products. A Claude Code Mod is one kind of Claude Code plugin; a plugin can also contain no mod at all. [A3][C4][G3]

### 12.5 How to choose for an engineering task

| Desired change | Start with | Why |
| --- | --- | --- |
| Follow repository conventions | Instructions | Supplies shared project guidance |
| Repeat the same investigation or release procedure | Skill | Makes the procedure and supporting resources reusable |
| Format changed files after a supported edit event | Hook plus a formatter script | Connects known code to an event |
| Search an internal issue tracker | Narrow custom tool, exposed through MCP when useful | Gives the agent a callable operation with explicit arguments |
| Add a persistent session panel or custom command | Product-specific Mod / Extension | Uses session and UI APIs |
| Give reviews a dedicated role and tool set | Custom agent / sub-agent | Defines a bounded assignment and context |
| Share a configured setup with the team | Plugin | Packages supported components for installation |
| Trigger work from CI and process events in your own app | SDK / application API plus a workflow | Lets your program initiate and supervise agent work |
| Change loop logic beyond exposed extension points | Custom harness or source modification where available | Requires owning the orchestration implementation |

Model/provider selection, reasoning settings where supported, tool permissions, sandboxing, environment setup, retrieval and context selection are additional configuration points. They affect which work is possible and what evidence reaches the model; they are not all code plugins.

For a C++ bug-fixing workflow: Instructions specify CMake/CTest conventions; a Skill describes reproduction, investigation, patching and verification; a post-edit Hook formats relevant files; an MCP tool searches internal issues; an optional Mod/Extension displays test state; a Plugin distributes the supported combination. Use your CI checks as the final automated check for a merge, rather than treating an agent's report or a skipped hook as proof.

### 12.6 Product entry points

| Product | Project guidance | Event handlers | Deeper integration / distribution |
| --- | --- | --- | --- |
| Codex | AGENTS.md, Skills | Hooks in supported configuration layers | Plugins; Codex SDK / App Server to drive the runtime from an app |
| Claude Code | CLAUDE.md, Skills | Settings hooks; Mods also expose function hooks | Mods and Plugins; Agent SDK for application integration |
| GitHub Copilot CLI | Copilot instructions, Skills | CLI hooks | CLI Extensions, Plugins, Copilot SDK |

The right-hand column lists different kinds of entry points, not equivalent extension APIs. SDK integration uses an agent runtime from another program; it does not automatically replace the runtime's internal loop. Use each product's documented event payloads, return formats and supported surfaces. [O2][A3][G3][C1][C2][C3]

The UML view below focuses on **who invokes extension code and where that code runs**. These are selected integration mechanisms, not a complete feature comparison.

![UML comparison of Claude Code Mods inside the agent process, Copilot CLI Extensions in a separate Node.js process, and separate Codex App Server and TypeScript SDK integration routes.](assets/agent_architecture/uml/agent_extensions_en.png)

[Open full-size PNG](assets/agent_architecture/uml/agent_extensions_en.png) · [Editable PlantUML source](assets/agent_architecture/uml/agent_extensions_en.puml)

- **Claude Code:** the host loads the Mod's JS/TS module and invokes its registered functions in its own process. The public API determines which events and UI elements can be changed. [A3]
- **Copilot CLI:** the CLI launches an extension in a separate Node.js process. The extension SDK is a library inside that process, connecting the session to the extension's functions. CLI Extensions are experimental. [G3]
- **Codex:** a custom app can communicate with App Server; separately, the TypeScript SDK wraps the Codex CLI for programmatic tasks. The diagram presents two entry points, not a required chain. Codex also supports Skills, Instructions, Hooks, and MCP. [O5][O6][C1]

## Writing Effective Prompts

**A useful request states the goal, context, constraints, and completion criteria.**

- A useful prompt includes the goal, relevant background, constraints, expected output, and a way to judge success.
- Provide examples when the desired result is difficult to describe.

```text
Goal: Review the attached API proposal for compatibility risks.
Context: Existing clients depend on the current response fields.
Constraints: Do not change the proposal or assume undocumented behavior.
Output: List findings by severity, with evidence and suggested fixes.
Success: Identify breaking changes and clearly label uncertainties.
```

- Start with the information required to make progress.
- For larger tasks, define milestones such as investigation, implementation, and validation.
- Ask for observable evidence and concise explanations of decisions.

- A vague request such as “improve this” becomes more useful as “rewrite this onboarding page for first-time users, preserve technical requirements, and keep it under 500 words.” Refine the result by naming the specific gap instead of repeating the original request.

## 13. Using Instructions

**Instructions are the shared rules for work in their scope.**

- Instructions describe rules that should apply repeatedly.
- Depending on the product, they may live in personal settings, workspace configuration, repository files, or API messages.

- Use personal instructions for preferences such as language and tone.
- Use project instructions for architecture, supported commands, coding conventions, and validation requirements.
- Keep temporary requirements in the task prompt.

- Some coding agents recognize `AGENTS.md`; others use different files or require explicit configuration.
- Confirm discovery rules, directory scope, and precedence in the product documentation.
- A file name alone does not guarantee that its contents are loaded.

- Example project instructions:

```markdown
# Project Instructions

- Follow the existing architecture and naming conventions.
- Read the relevant package documentation before making changes.
- Use the dependency manager and lockfile already present.
- Run checks appropriate to the changed behavior.
- Report failed or unrun checks explicitly.
- Never include credentials in code, logs, or documentation.
```

- Keep rules short, actionable, and consistent.
- Remove obsolete rules.
- When instructions conflict, consult the host's instruction hierarchy and clarify unresolved project requirements; do not assume that the latest text always wins.

## 14. Building and Using Skills

**A skill packages the steps for a recurring task.**

- A skill packages a repeatable task with instructions and, where supported, scripts, templates, and references.
- Good candidates include release preparation, environment setup, incident triage, and documentation review.

- Platforms that support `SKILL.md` commonly use a layout like this, but metadata and discovery requirements are product-specific:

```text
documentation-review/
  SKILL.md
  references/style-guide.md
  scripts/check-links.sh
  templates/review.md
```

- A skill should explain when to use it, prerequisites, steps, validation, failure handling, and expected outputs.
- State which actions require authorization.
- Keep secrets outside the skill.

```markdown
# Documentation Review

Use this procedure when reviewing project documentation.

1. Identify the audience and changed pages.
2. Read the project style guide.
3. Check examples, links, and consistency with current behavior.
4. Run available documentation checks.
5. Report findings with file references and validation results.
```

- Invoke a skill using the host's supported interface, then verify that it was loaded.
- Test it on a representative task before relying on it.
- Version skills alongside the workflows they describe and update them when commands or policies change.

### Instructions vs. Skills

**Instructions define the rules; a skill supplies the procedure.**

For a cooking analogy, “avoid an allergenic ingredient” is a rule; “chop, cook, then serve” is a procedure. AI tasks combine both.

- Instructions define rules that apply across tasks within their scope.
- A skill supplies a reusable procedure for a particular kind of task.
- Both can contain instructions, but their purpose and loading behavior differ.

| | Instructions | Skill |
| --- | --- | --- |
| Main question | What rules should work follow? | How should this task be performed? |
| Example | Write English documentation and a Japanese translation | Research a topic, draft a note, translate it, and validate it |
| Scope | Tasks covered by the instruction file | A selected task matching the skill |
| Loading | Depends on host discovery and directory scope | Depends on host support, discovery, and explicit or automatic selection |
| Repository example | `AGENTS.md` | `.agents/skills/learning_note/SKILL.md` |

- Keep shared rules in `AGENTS.md`; avoid copying every rule into each skill.
- A skill should refer to those rules and provide task-specific steps.
- It does not override higher-priority instructions or grant extra permissions.

### This Repository's Example

- `AGENTS.md` says to create English documentation with a matching `_jp.md` translation and to avoid empty directories.
- These rules also apply when working without a skill.

- The `learning_note` skill explains how to choose a topic's scope, gather sources, create a concrete example, validate it, and produce the two language versions.
- Its templates help give notes a consistent starting structure.

### Using learning_note

- The skill is stored in `.agents/skills/learning_note/`, a repository skill location supported by Codex.
- Discovery and invocation can vary by host and version.
- This location does not guarantee automatic discovery by every Copilot client.

- In a host that discovers it, explicitly request `learning_note` through the supported skill interface.
- Otherwise, ask the assistant to read and follow `.agents/skills/learning_note/SKILL.md`; this is a manual fallback, not proof of native skill registration.

```text
Use learning_note to create a beginner's note about Linux processes and threads.
Include a safe runnable example and official references.
```

- Check that the assistant loaded the procedure and produced both language versions with honest validation results.
- Commit and push only when authorized.
- Creating the files alone does not demonstrate skill discovery in a fresh session or successful execution of the full workflow.

## 15. Agents, Sub-agents, and Workflows

**An agent uses results to decide the next step.**

- An agent combines a goal, context, tools, and a control loop to perform multiple steps.
- A useful loop is: inspect the situation, choose an action, execute it, evaluate the result, and continue or stop.

- Define the scope, allowed tools, success criteria, resource limits, and stopping conditions before delegating substantial work.
- Require checkpoints for consequential actions such as publishing, spending money, or changing production data.

- Sub-agents can handle independent tasks such as reviewing separate modules.
- Give each a clear assignment and expected result.
- Shared files and services can introduce conflicts, so establish ownership and review combined results.
- More agents add coordination costs and do not automatically improve quality.

- Use deterministic workflows for stable sequences and agent decisions where interpretation is needed.
- Scheduled or event-driven automation also needs explicit credentials, retries, duplicate-action protection, logs, and failure notification.

- Persist progress in files or an approved state store so work can resume after interruption.
- Treat a report of success as a claim to validate against tool results and produced artifacts.

## 16. Output Formats and Quality Evaluation

**A well-formatted answer still needs its content checked.**

- Choose Markdown for human-readable explanations, tables for comparisons, and structured data for downstream software.
- Provide templates when a stable layout matters.

- Asking for JSON does not guarantee valid or schema-compliant output.
- Where supported, use structured outputs with a schema and validate the result in the consuming application.
- A valid shape does not guarantee correct content.

```json
{
  "summary": "Describe the observed result",
  "findings": [
    {
      "severity": "medium",
      "evidence": "Reference to an observed source",
      "recommendation": "A concrete next action"
    }
  ],
  "validation_status": "not_run"
}
```

- Build evaluations (evals) from representative tasks, expected properties, and known failure cases.
- Useful criteria include factual support, task completion, permissions respected, test results, latency, and cost.
- Use human review where automated grading cannot reliably judge the result.

- Compare models, prompts, or skills on the same examples.
- Track regressions and keep held-out cases to reduce overfitting.
- Distinguish passed, failed, skipped, and unrun checks.
- Select models according to measured quality, latency, context needs, and cost.

## 17. Put it together: “Fix division by zero”

**Assumed example, not an execution record:** `/workspace/calculator` contains a Python project with `pytest` installed. Zero division currently returns `0`; the requested behavior is to raise `ValueError`. The user requests a fix and local verification, without publishing it.

<details>
<summary>Inspect the detailed execution sequence</summary>

```mermaid
sequenceDiagram
    participant U as User
    participant H as Harness
    participant L as LLM
    participant T as Tool / workspace
    U->>H: Fix zero division and verify it
    H->>L: Request, instructions, and tool definitions
    L->>H: Read the function and tests
    H->>T: Run the permitted read
    T-->>H: Relevant code
    H->>L: Add code to context
    L->>H: Apply this fix
    H->>T: Edit the file
    T-->>H: Edit result
    H->>L: Return edit result
    L->>H: Run pytest -q
    H->>T: Execute tests
    T-->>H: Exit code and log
    H->>L: Return test result
    L-->>H: Explain the change and observed result
    H-->>U: Answer and artifact links
```

</details>

**Proposed change:**

```diff
 def divide(a, b):
     if b == 0:
-        return 0
+        raise ValueError("denominator must not be zero")
     return a / b
```

- Check both the zero-denominator exception and ordinary division. A green test run supports the cases actually tested.
- If tests fail, pass their output back to the model and repeat the edit/check loop. If they cannot run, report that verification is incomplete.
- Issue search through MCP can be added if needed; this local fix does not require it.
- **LLM generates → harness coordinates → tools execute → results become context.** This is the cycle shown in the opening image.

## 18. Operating Safely

**Treat retrieved text as information; permissions are enforced by the host.**

- Keep credentials in approved secret stores and avoid copying them into prompts, repositories, or logs.
- Share only the information needed for the task and check the service's retention and data-use settings.

- Prompt injection occurs when untrusted content attempts to redirect the AI's behavior.
- Retrieved documents, websites, repository files, and tool responses may contain such instructions.
- Treat them as data, verify requests against the authorized task, and do not let them grant new permissions.

- Use sandboxing, narrow filesystem access, restricted network destinations, and least-privilege credentials.
- Separate reading from consequential actions and use the host's approval controls where appropriate.
- Validate command arguments and structured inputs in application code.

- Before external writes or publication, check the destination, scope, content, authorization, and recovery options.
- Maintain useful audit records without logging secrets.
- Verify generated code, factual claims, licenses, and usage rights according to the task's requirements.

## 19. Practical Workflows

### Share project rules with instructions

- Create the host-supported project instruction file with repository conventions and real validation commands.
- Start a small task and verify that the agent discovers and follows it.
- Keep task-specific exceptions explicit.

### Reuse a documentation review skill

- Package the review procedure, style references, and an existing link checker as a skill.
- Invoke it for a changed page.
- Confirm the checker actually ran and review the findings against the source.

### Read external information through MCP

- Connect an approved issue-tracking server with read-only access.
- Ask the AI to summarize a selected issue using returned evidence.
- Verify issue identifiers and source links before enabling issue updates.

### Answer questions with RAG

- Index a maintained documentation collection with permission metadata.
- Retrieve relevant passages for a question, generate a cited answer, and check it against the source.
- Include cases where the documentation does not contain the answer.

### Implement and validate with an agent

- Give the agent a concrete behavior change, repository rules, and acceptance criteria.
- Let it inspect the code, make scoped changes, and run relevant tests.
- Review the diff and actual test output before merging or deploying.

### Combine the mechanisms

- For a recurring support workflow, instructions define communication and privacy rules, a skill describes triage steps, retrieval supplies product knowledge, and MCP tools read the relevant tickets.
- The agent coordinates these steps and returns a structured draft.
- A human reviews consequential outbound actions under the organization's policy.

- Start with one useful workflow, validate it on real examples, and add complexity only when it solves an observed problem.

## 20. When something goes wrong

| Symptom | Start by checking |
| --- | --- |
| It does not know a file's contents | Was the file read and included in context? |
| It lost a previous decision | Was that decision omitted or summarized? Was it saved? |
| It cannot run a test | Directory, runtime, dependencies, and sandbox restrictions |
| MCP search fails | Connection, server startup, authentication, and service permissions |
| It claims it created an issue | Tool result and the actual issue ID before retrying a write |
| It follows instructions found inside a document | Trust boundaries and host-enforced operation restrictions |

Check the chain **input → model output → harness → tool → external service → verification** to locate the failure.

## Appendix: details to read when needed

<details>
<summary>Model calls, harness implementation, and trustworthy completion</summary>

- Text generation is commonly described as predicting successive tokens using learned parameters. Some models also accept or generate images, audio, or other modalities.
- Typical APIs require the host to send or reference the relevant conversation state. Do not assume one independent call remembers another.
- Function calling produces a tool name and structured arguments. The application validates them, dispatches the request, and associates the result with the call ID. A generated request alone is not proof of execution.
- A harness also needs timeouts, cancellation, process polling, appropriate retries, durable state where needed, and limits on steps and budget. A background process ID does not mean a command has finished.
- Retrying a read differs from retrying a payment or message send. For writes, use idempotency controls or check whether the first attempt succeeded.
- Harness, runtime, runner, executor, and orchestrator are overlapping implementation terms. There is no universal boundary between them, and a harness is more than a system prompt.
- A completion claim needs evidence from artifacts and checks. Output with the right format can still contain wrong facts.

</details>

<details>
<summary>Context limits, security, and cost accounting</summary>

- Stored conversation, persistent memory, external files, and current context have different lifetimes. Host selection determines what is supplied to each call.
- Compaction replaces older content with a summary. It can preserve decisions while losing exact error details or exceptions. Keep source paths and unresolved requirements in handoff notes.
- Context engineering means selecting, structuring, retrieving, and maintaining useful input. Instruction priority follows the host/model contract, not whichever text appears last.
- Retrieved documents and tool results can contain prompt injection: untrusted text trying to redirect the system. Their contents do not grant new authority. Enforce allowed operations outside the model too.
- Exact text token counts require the chosen tokenizer or API usage reporting. Japanese character counts and image/audio/video sizes do not provide universal token conversions.
- Approximate text cost sums billable input and output tokens multiplied by their respective rates across all calls, with the provider's unit conversion, cache, and reasoning-token rules. Tools and compute can cost extra.
- Caching can reduce cost or latency under supported conditions. It does not remove context limits or establish correctness.
- Containers and VMs have different isolation properties. Browser, CLI, and MCP connections can use different identities; a browser login does not establish CLI authorization.

</details>

<details>
<summary>MCP capabilities and communication</summary>

| Server primitive | Purpose | Example |
| --- | --- | --- |
| Tools | Callable operations | Search issues or create a ticket |
| Resources | URI-addressed content | A document or schema |
| Prompts | Reusable message templates | A review prompt |

- Servers need not implement all three; hosts differ in what they support and expose.
- Common transports include local **stdio** and remote **Streamable HTTP**. Support and authorization follow the selected protocol version and implementation.
- Server authentication and downstream service credentials can be separate. MCP does not bypass network or filesystem restrictions.
- Capability discovery, data retrieval, and inclusion in model context are separate steps. A connected server does not imply all its data has been read.

</details>

## About the illustration

- The opening image is a newly generated conceptual infographic inspired by the supplied visual reference. Both languages use matching layouts and relationships.
- [Open the image](assets/agent_architecture/overview_infographic_en.png) to inspect it at full size.
- Its [design specification](assets/agent_architecture/infographic_design.json) records the layout and relationships. Image generation does not guarantee pixel-identical reproduction.
- The existing Graphviz script remains available for legacy diagrams; it does not generate the new infographic.
- The detailed execution sequence remains in a collapsible Mermaid block; its rendering was not checked in this change.

The UML diagrams have editable `.puml` sources and rendered PNGs in `assets/agent_architecture/uml/`. To regenerate both language versions from the repository root, install Java, Graphviz (`dot` on `PATH`), and the Noto Sans CJK JP font, then use the [PlantUML JAR](https://plantuml.com/download). These images were rendered with PlantUML 1.2025.10 and visually checked for legibility and clipping.

```bash
java -jar /path/to/plantuml.jar -charset UTF-8 -tpng learning/ai/assets/agent_architecture/uml/*.puml
```

This writes a PNG beside each source file. Both diagrams use custom process stereotypes and simplified interactions to explain architecture; they do not specify every internal process or message order.

## References

- [OpenAI: Key concepts](https://platform.openai.com/docs/concepts) — models and tokens.
- [OpenAI: Function calling](https://platform.openai.com/docs/guides/function-calling) — the model/application tool boundary.
- [OpenAI: Conversation state](https://platform.openai.com/docs/guides/conversation-state) — state across calls.
- [MCP: Architecture](https://modelcontextprotocol.io/docs/learn/architecture) and [specification](https://modelcontextprotocol.io/specification) — roles, capabilities, and versioned transport details.
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — workflows and agents.
- [Docker: What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/) — containers and isolation.

- [O1] [OpenAI: Codex CLI](https://github.com/openai/codex)
- [O2] [OpenAI: Codex harness / App Server](https://openai.com/index/unlocking-the-codex-harness/)
- [O3] [OpenAI: Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [O4] [OpenAI: Using Codex Cloud](https://help.openai.com/en/articles/20001545-using-codex-cloud)
- [O5] [OpenAI: Codex App Server](https://learn.chatgpt.com/docs/app-server)
- [O6] [OpenAI: Codex TypeScript SDK](https://github.com/openai/codex/blob/main/sdk/typescript/README.md)
- [A1] [Anthropic: How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- [A2] [Anthropic: Claude Code](https://claude.com/product/claude-code)
- [A3] [Anthropic: Claude Code Mods](https://code.claude.com/docs/en/plugins/mods/overview)
- [A4] [Anthropic: Remote Control](https://code.claude.com/docs/en/remote-control)
- [A5] [Anthropic: Claude Code in the cloud](https://support.claude.com/en/articles/12618689-use-claude-code-in-the-cloud)
- [G1] [GitHub: Copilot customization](https://docs.github.com/en/copilot/concepts/customizations/comparing-customizations)
- [G2] [GitHub: CLI BYOK and local models](https://github.blog/changelog/2026-04-07-copilot-cli-now-supports-byok-and-local-models/)
- [G3] [GitHub: Copilot extensions](https://docs.github.com/en/copilot/concepts/customizations/extensions)
- [G4] [GitHub: Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-on-github)
- [G5] [VS Code: Agent harnesses](https://code.visualstudio.com/docs/agents/run/agent-harnesses)
- [M1] [MCP: Architecture](https://modelcontextprotocol.io/docs/learn/architecture)

- [C1] [OpenAI: Hooks](https://learn.chatgpt.com/docs/hooks)
- [C2] [Anthropic: Hooks reference](https://code.claude.com/docs/en/hooks)
- [C3] [GitHub: Hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference)
- [C4] [OpenAI: Package your plugin](https://developers.openai.com/plugins/build/plugins)
