# A Practical Guide to AI Tools and Workflows

This guide explains how to give AI useful instructions, provide knowledge, connect tools, and build repeatable workflows. Product names, supported features, configuration locations, and instruction precedence vary. Check your chosen product's documentation before applying configuration examples.

## 1. The Big Picture

| Mechanism | Purpose | Example |
| --- | --- | --- |
| Prompt | Describe the current task | Ask for a review of a specific change |
| Instructions | Define ongoing rules | Require tests for behavior changes |
| Skill | Package a reusable procedure | Follow a release checklist |
| Context | Supply information needed for a task | Attach requirements and relevant code |
| Memory | Retain selected information across interactions | Remember a preferred writing style |
| Tool / function calling | Let AI request an external operation | Search files or run a test |
| MCP | Standardize connections to tools and data | Connect an approved documentation service |
| RAG | Retrieve relevant knowledge before generating an answer | Answer questions using internal documentation |
| Agent | Perform a sequence of actions toward a goal | Implement and validate a change |
| Structured output | Constrain an answer's shape | Return JSON matching a schema |

These mechanisms work together. Instructions establish rules, a prompt sets the goal, a skill supplies a procedure, and tools provide actions. Retrieval adds relevant context; an agent coordinates the work.

## 2. Writing Effective Prompts

A useful prompt includes the goal, relevant background, constraints, expected output, and a way to judge success. Provide examples when the desired result is difficult to describe.

```text
Goal: Review the attached API proposal for compatibility risks.
Context: Existing clients depend on the current response fields.
Constraints: Do not change the proposal or assume undocumented behavior.
Output: List findings by severity, with evidence and suggested fixes.
Success: Identify breaking changes and clearly label uncertainties.
```

Start with the information required to make progress. For larger tasks, define milestones such as investigation, implementation, and validation. Ask for observable evidence and concise explanations of decisions.

A vague request such as “improve this” becomes more useful as “rewrite this onboarding page for first-time users, preserve technical requirements, and keep it under 500 words.” Refine the result by naming the specific gap instead of repeating the original request.

## 3. Using Instructions

Instructions describe rules that should apply repeatedly. Depending on the product, they may live in personal settings, workspace configuration, repository files, or API messages.

Use personal instructions for preferences such as language and tone. Use project instructions for architecture, supported commands, coding conventions, and validation requirements. Keep temporary requirements in the task prompt.

Some coding agents recognize `AGENTS.md`; others use different files or require explicit configuration. Confirm discovery rules, directory scope, and precedence in the product documentation. A file name alone does not guarantee that its contents are loaded.

Example project instructions:

```markdown
# Project Instructions

- Follow the existing architecture and naming conventions.
- Read the relevant package documentation before making changes.
- Use the dependency manager and lockfile already present.
- Run checks appropriate to the changed behavior.
- Report failed or unrun checks explicitly.
- Never include credentials in code, logs, or documentation.
```

Keep rules short, actionable, and consistent. Remove obsolete rules. When instructions conflict, consult the host's instruction hierarchy and clarify unresolved project requirements; do not assume that the latest text always wins.

## 4. Building and Using Skills

A skill packages a repeatable task with instructions and, where supported, scripts, templates, and references. Good candidates include release preparation, environment setup, incident triage, and documentation review.

Platforms that support `SKILL.md` commonly use a layout like this, but metadata and discovery requirements are product-specific:

```text
documentation-review/
  SKILL.md
  references/style-guide.md
  scripts/check-links.sh
  templates/review.md
```

A skill should explain when to use it, prerequisites, steps, validation, failure handling, and expected outputs. State which actions require authorization. Keep secrets outside the skill.

```markdown
# Documentation Review

Use this procedure when reviewing project documentation.

1. Identify the audience and changed pages.
2. Read the project style guide.
3. Check examples, links, and consistency with current behavior.
4. Run available documentation checks.
5. Report findings with file references and validation results.
```

Invoke a skill using the host's supported interface, then verify that it was loaded. Test it on a representative task before relying on it. Version skills alongside the workflows they describe and update them when commands or policies change.

## 5. Managing Context and Memory

Context is the information available for the current response: messages, files, retrieved passages, tool results, and system-provided information. A context window is finite, so long conversations may be truncated or summarized.

Provide focused material: the relevant files, current requirements, exact errors, and recent decisions. Label sources and dates where freshness matters. Avoid dumping unrelated repositories or logs into a conversation.

Memory may persist selected preferences or facts across conversations, depending on the product and settings. It is not a reliable replacement for versioned project documentation. Inspect, correct, and delete stored information through supported controls.

For long tasks, maintain a short handoff note containing the goal, accepted decisions, completed work, remaining steps, and validation status. Recheck changing facts instead of treating old conversation history as current evidence.

## 6. Tools, Function Calling, and MCP

Tools let an AI request operations such as file reads, searches, command execution, or API calls. With function calling, the application exposes named operations and argument schemas; the model proposes a call, and the host validates and executes it according to its permissions. A proposed call is not proof of execution.

The Model Context Protocol (MCP) standardizes communication between AI applications and external capabilities. A host manages connections through MCP clients; servers expose supported capabilities. MCP does not itself grant access or guarantee that a service is trustworthy.

| MCP capability | Typical use |
| --- | --- |
| Tools | Execute operations such as searching or creating an issue |
| Resources | Expose data through identifiable resources |
| Prompts | Provide reusable message templates |

Client support varies, and a server need not implement every capability. An MCP prompt is a template exposed by a server; it is distinct from a complete skill procedure.

To connect a server:

1. Choose a trusted server and verify its supported transport and capabilities.
2. Configure it using the host's documented settings.
3. Supply authentication through approved secret storage or authorization flows.
4. Grant the smallest useful scope, starting with read-only access.
5. Test a harmless operation and inspect the returned result.
6. Enable write operations only when needed and authorized.

For connection failures, distinguish server startup errors, transport problems, unsupported capabilities, expired authentication, and insufficient permissions. Inspect sanitized logs without exposing tokens. Prefer a narrow tool with explicit arguments over unrestricted command execution when both satisfy the task.

## 7. Retrieval, RAG, and Knowledge Sources

Retrieval-augmented generation (RAG) searches a knowledge source and supplies relevant results to the model before it answers. A typical pipeline ingests documents, splits them into passages, indexes them, retrieves candidates, and generates an answer with supporting references.

Use file attachments for a small, task-specific collection. Use search for current or broadly distributed information. Consider RAG for a larger, maintained collection that users query repeatedly. MCP can expose a retrieval service, but MCP and RAG solve different parts of the workflow.

Preserve document ownership, access controls, source identifiers, and update dates. Retrieval must enforce the requesting user's permissions; filtering only the final answer is insufficient.

Evaluate whether the correct passages were retrieved and whether the answer is supported by them. Ask for citations and verify that they support the actual claims. When sources are missing or contradictory, report the gap instead of filling it with an unsupported answer.

## 8. Agents, Sub-agents, and Workflows

An agent combines a goal, context, tools, and a control loop to perform multiple steps. A useful loop is: inspect the situation, choose an action, execute it, evaluate the result, and continue or stop.

Define the scope, allowed tools, success criteria, resource limits, and stopping conditions before delegating substantial work. Require checkpoints for consequential actions such as publishing, spending money, or changing production data.

Sub-agents can handle independent tasks such as reviewing separate modules. Give each a clear assignment and expected result. Shared files and services can introduce conflicts, so establish ownership and review combined results. More agents add coordination costs and do not automatically improve quality.

Use deterministic workflows for stable sequences and agent decisions where interpretation is needed. Scheduled or event-driven automation also needs explicit credentials, retries, duplicate-action protection, logs, and failure notification.

Persist progress in files or an approved state store so work can resume after interruption. Treat a report of success as a claim to validate against tool results and produced artifacts.

## 9. Output Formats and Quality Evaluation

Choose Markdown for human-readable explanations, tables for comparisons, and structured data for downstream software. Provide templates when a stable layout matters.

Asking for JSON does not guarantee valid or schema-compliant output. Where supported, use structured outputs with a schema and validate the result in the consuming application. A valid shape does not guarantee correct content.

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

Build evaluations (evals) from representative tasks, expected properties, and known failure cases. Useful criteria include factual support, task completion, permissions respected, test results, latency, and cost. Use human review where automated grading cannot reliably judge the result.

Compare models, prompts, or skills on the same examples. Track regressions and keep held-out cases to reduce overfitting. Distinguish passed, failed, skipped, and unrun checks. Select models according to measured quality, latency, context needs, and cost.

## 10. Operating Safely

Keep credentials in approved secret stores and avoid copying them into prompts, repositories, or logs. Share only the information needed for the task and check the service's retention and data-use settings.

Prompt injection occurs when untrusted content attempts to redirect the AI's behavior. Retrieved documents, websites, repository files, and tool responses may contain such instructions. Treat them as data, verify requests against the authorized task, and do not let them grant new permissions.

Use sandboxing, narrow filesystem access, restricted network destinations, and least-privilege credentials. Separate reading from consequential actions and use the host's approval controls where appropriate. Validate command arguments and structured inputs in application code.

Before external writes or publication, check the destination, scope, content, authorization, and recovery options. Maintain useful audit records without logging secrets. Verify generated code, factual claims, licenses, and usage rights according to the task's requirements.

## 11. Practical Workflows

### Share project rules with instructions

Create the host-supported project instruction file with repository conventions and real validation commands. Start a small task and verify that the agent discovers and follows it. Keep task-specific exceptions explicit.

### Reuse a documentation review skill

Package the review procedure, style references, and an existing link checker as a skill. Invoke it for a changed page. Confirm the checker actually ran and review the findings against the source.

### Read external information through MCP

Connect an approved issue-tracking server with read-only access. Ask the AI to summarize a selected issue using returned evidence. Verify issue identifiers and source links before enabling issue updates.

### Answer questions with RAG

Index a maintained documentation collection with permission metadata. Retrieve relevant passages for a question, generate a cited answer, and check it against the source. Include cases where the documentation does not contain the answer.

### Implement and validate with an agent

Give the agent a concrete behavior change, repository rules, and acceptance criteria. Let it inspect the code, make scoped changes, and run relevant tests. Review the diff and actual test output before merging or deploying.

### Combine the mechanisms

For a recurring support workflow, instructions define communication and privacy rules, a skill describes triage steps, retrieval supplies product knowledge, and MCP tools read the relevant tickets. The agent coordinates these steps and returns a structured draft. A human reviews consequential outbound actions under the organization's policy.

Start with one useful workflow, validate it on real examples, and add complexity only when it solves an observed problem.
