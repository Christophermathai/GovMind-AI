Execute the full delivery pipeline for a specific brainstormed feature.

Canonical usage: `/deliver-feature [feature-name]`

This command orchestrates the execution of the full delivery pipeline for a feature that has an existing brainstorm document.

Flow:
1. Run `/spec-task [feature-name]` to create the self-contained functional specification based on the brainstorm.
2. Run `/plan-task [feature-name]` to create the phased implementation plan from the approved spec.
3. Run `/implement-task [feature-name]` to execute the approved plan phase by phase.
4. Run `/review-task [feature-name]` to audit the implementation against the spec, plan, and quality gates.
5. Run `/review [feature-name]` to perform a final quick code review of the targeted changes.

Ensure that each step is completed and approved before proceeding to the next in the sequence. The primary source of truth for the start of this pipeline should be the specific `project-delivery/brainstorms/{feature-name}/brainstorm.md` file.
