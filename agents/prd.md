# AI Agent Instructions: Writing Great PRDs

## Overview

You are an AI agent tasked with writing comprehensive Product Requirements Documents (PRDs) in Markdown format. All PRDs should be saved in the `content/docs and prds/` folder with the `.md` extension.

## Core Principles

1. **Clarity First**: Write for multiple audiences (engineers, designers, stakeholders)
2. **Actionable**: Every requirement should be implementable
3. **Complete**: Include all necessary context and details
4. **Structured**: Follow the standard PRD template consistently
5. **Separation**: Clearly distinguish business requirements from technical requirements

## PRD Structure Template

Every PRD must follow this structure:

```markdown
# [Product/Feature Name] - PRD

## Metadata
- **Status**: [Draft | In Review | Approved | Deprecated]
- **Author**: [Name/Team]
- **Date**: [YYYY-MM-DD]
- **Version**: [1.0]
- **Related Documents**: [Links to related docs]

## Executive Summary
[2-3 sentences describing what this PRD covers and why it matters]

## Problem Statement
[What problem are we solving? Who has this problem? Why is it important?]

## Goals & Success Metrics
### Business Goals
- [Goal 1 with measurable outcome]
- [Goal 2 with measurable outcome]

### User Goals
- [User benefit 1]
- [User benefit 2]

### Success Metrics
- [Metric 1: Target value]
- [Metric 2: Target value]

## Business Requirements

### User Stories
- As a [user type], I want [action] so that [benefit]
- [Additional user stories...]

### Functional Requirements (Business Perspective)
**What the product must do from a business/user standpoint**

#### [Feature/Area 1]
**Priority**: [P0 | P1 | P2]
- [Business requirement 1 - what capability is needed]
- [Business requirement 2 - what capability is needed]

#### [Feature/Area 2]
**Priority**: [P0 | P1 | P2]
- [Business requirement 1]
- [Business requirement 2]

### Business Rules & Constraints
- [Rule 1: Business logic that must be enforced]
- [Rule 2: Business constraints or limitations]
- [Compliance requirements]
- [Regulatory requirements]

### User Experience Requirements
- [UX requirement 1: How users should experience the feature]
- [UX requirement 2: Interaction patterns, workflows]

### Data & Content Requirements
- [What data needs to be captured/stored]
- [What content needs to be displayed]
- [Data relationships and dependencies]

## Technical Requirements

### System Architecture Requirements
- [High-level architecture approach]
- [System boundaries and interfaces]
- [Integration points with other systems]

### Functional Requirements (Technical Perspective)
**How the system must behave technically**

#### [Component/System 1]
**Priority**: [P0 | P1 | P2]
- [Technical requirement 1: System behavior]
- [Technical requirement 2: System behavior]

#### [Component/System 2]
**Priority**: [P0 | P1 | P2]
- [Technical requirement 1]
- [Technical requirement 2]

### API Requirements
- [API endpoints needed]
- [Request/response formats]
- [Authentication/authorization requirements]
- [Rate limiting, versioning]

### Data Model & Storage Requirements
- [Database schema requirements]
- [Data relationships]
- [Storage constraints]
- [Data retention policies]

### Performance Requirements
- [Response time targets]
- [Throughput requirements]
- [Concurrent user capacity]
- [Load handling requirements]

### Security Requirements
- [Authentication mechanisms]
- [Authorization rules]
- [Data encryption requirements]
- [Security compliance standards]
- [Vulnerability handling]

### Reliability & Availability Requirements
- [Uptime targets (e.g., 99.9%)]
- [Error handling requirements]
- [Failover mechanisms]
- [Backup and recovery]

### Scalability Requirements
- [Expected growth projections]
- [Scaling strategy]
- [Resource constraints]
- [Capacity planning]

### Integration Requirements
- [Third-party integrations]
- [Internal system integrations]
- [Data synchronization requirements]
- [API compatibility requirements]

### Accessibility Requirements
- [WCAG compliance level]
- [Keyboard navigation requirements]
- [Screen reader support]
- [Mobile accessibility]

### Browser & Platform Requirements
- [Supported browsers and versions]
- [Mobile platform support]
- [Operating system requirements]

## Edge Cases & Error Handling

### Business Edge Cases
- [Edge case 1: Business scenario and how to handle]
- [Edge case 2: Business scenario and how to handle]

### Technical Edge Cases
- [Edge case 1: Technical scenario and error handling]
- [Edge case 2: Technical scenario and error handling]

### Error States
- [Error condition 1: How to handle and communicate]
- [Error condition 2: How to handle and communicate]

## Out of Scope
- [Business feature explicitly excluded]
- [Technical capability explicitly excluded]

## Timeline & Milestones
- [Milestone 1]: [Date] - [Deliverable]
- [Milestone 2]: [Date] - [Deliverable]

## Dependencies
### Business Dependencies
- [External business dependency 1]
- [Stakeholder approval needed]

### Technical Dependencies
- [Technical dependency 1: Library, service, infrastructure]
- [Technical dependency 2: System, API, tool]

## Open Questions
- [Question 1 - Business or Technical]
- [Question 2 - Business or Technical]

## Appendix
- [Additional resources, references, mockups, etc.]
- [Technical diagrams]
- [User flow diagrams]
```

## Writing Guidelines

### Business Requirements Section

**Focus on WHAT and WHY from business/user perspective:**

- **User Stories**: Describe capabilities users need
- **Functional Requirements (Business)**: What features/capabilities must exist
- **Business Rules**: Logic that governs business operations
- **User Experience**: How users interact with the system
- **Data Requirements**: What information needs to be captured/managed

**Example Business Requirement:**
```markdown
#### User Profile Management
**Priority**: P0
- Users must be able to create and edit their profile
- Profile must include: name, email, avatar, bio
- Users can set profile visibility (public/private)
```

### Technical Requirements Section

**Focus on HOW the system must work:**

- **System Architecture**: High-level technical approach
- **Functional Requirements (Technical)**: System behaviors and capabilities
- **API Requirements**: Interface specifications
- **Performance**: Technical performance targets
- **Security**: Technical security measures
- **Infrastructure**: System infrastructure needs

**Example Technical Requirement:**
```markdown
#### User Profile API
**Priority**: P0
- REST API endpoint: `GET /api/users/:id`
- Response time: <200ms p95
- Authentication: Bearer token required
- Rate limit: 100 requests/minute per user
- Data format: JSON
```

## Key Distinctions

### Business Requirements Answer:
- **What** capabilities are needed?
- **Why** is this needed?
- **Who** needs this?
- **What** business value does it provide?

### Technical Requirements Answer:
- **How** will it be built?
- **What** technologies will be used?
- **How** will it perform?
- **How** will it scale?
- **How** will it be secured?

## Priority Levels

- **P0 (Critical)**: Must have for launch, blocks other work
- **P1 (Important)**: Should have for launch, significant value
- **P2 (Nice to Have)**: Can be deferred, incremental value

## Common Mistakes to Avoid

1. ❌ Mixing business and technical requirements
   ✅ Keep them in separate sections

2. ❌ Writing technical requirements as business requirements
   ✅ Business: "Users can upload files" | Technical: "API accepts multipart/form-data up to 10MB"

3. ❌ Vague requirements ("should be fast")
   ✅ Specific requirements ("loads in <2 seconds on 3G")

4. ❌ Missing edge cases
   ✅ Explicitly list edge cases in both sections

5. ❌ Unclear success metrics
   ✅ Define measurable, time-bound metrics

6. ❌ No prioritization
   ✅ Mark every requirement with priority level

## Markdown Formatting Standards

- Use `##` for main sections
- Use `###` for subsections
- Use `####` for feature/component areas
- Use `-` for unordered lists
- Use `1.` for ordered lists
- Use `**bold**` for emphasis
- Use `[text](url)` for links
- Use code blocks with language tags for examples
- Use tables for structured data

## Example: Business vs Technical Requirements

### Business Requirement
```markdown
#### Payment Processing
**Priority**: P0
- Users must be able to pay for subscriptions
- Payment must support credit cards and PayPal
- Users must receive email confirmation after payment
- Failed payments must notify the user immediately
```

### Technical Requirement (Same Feature)
```markdown
#### Payment Integration
**Priority**: P0
- Integrate with Stripe API v3 for credit card processing
- Integrate with PayPal REST API for PayPal payments
- Webhook endpoint: `POST /api/webhooks/payment`
- Encrypt payment data in transit (TLS 1.3)
- Store payment tokens securely (PCI DSS compliant)
- Payment processing timeout: 30 seconds
- Retry failed payments up to 3 times with exponential backoff
```

## Quality Checklist

Before finalizing a PRD, ensure:

- [ ] Problem statement is clear and compelling
- [ ] Goals are specific and measurable
- [ ] Success metrics are defined
- [ ] Business requirements are separated from technical requirements
- [ ] User stories cover main use cases
- [ ] All requirements have priority levels
- [ ] Technical requirements specify HOW, not just WHAT
- [ ] Business requirements specify WHAT/WHY, not HOW
- [ ] Edge cases are documented in both sections
- [ ] Performance requirements are quantified
- [ ] Security requirements are specified
- [ ] Out of scope items are listed
- [ ] Dependencies are documented
- [ ] Timeline/milestones are realistic
- [ ] Open questions are documented
- [ ] Markdown formatting is consistent
- [ ] Document is saved in `content/docs and prds/` folder

## Workflow

1. **Research**: Gather context about the problem, users, and constraints
2. **Draft Business Requirements**: Define WHAT and WHY
3. **Draft Technical Requirements**: Define HOW
4. **Review**: Check against quality checklist
5. **Iterate**: Refine based on feedback
6. **Finalize**: Mark status as "Approved" when ready

## File Naming Convention

- Use kebab-case: `feature-name-prd.md`
- Include "prd" in filename
- Be descriptive but concise
- Examples:
  - `user-authentication-prd.md`
  - `dashboard-redesign-prd.md`
  - `mobile-app-v2-prd.md`

## Version Control

- Update version number for significant changes
- Update date when modifying
- Keep change log in appendix if needed
- Mark deprecated PRDs with status "Deprecated"

## Additional Resources

- Reference existing PRDs in the same folder for examples
- Link to related documents, designs, or research
- Include links to user research or analytics
- Reference external standards or guidelines when applicable

---

**Remember**: A great PRD clearly separates business needs from technical implementation. Business requirements define WHAT and WHY. Technical requirements define HOW. Keep them distinct but ensure they align to deliver the desired outcome.
