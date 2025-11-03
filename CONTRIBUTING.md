# Contributing Guide

How to set up, code, test, review, and release so contributions meet our Definition of Done.

## Code of Conduct

Reference the project/community behavior expectations and reporting process.

## Getting Started

List prerequisites, setup steps, environment variables/secrets handling, and how to run the app locally.

git clone git@github.com:josephliefeld/TrekTrak_Capstone.git  
cd web-app  
npm install  
npm run dev  
 
## Branching & Workflow

Describe the workflow (e.g., trunk-based or GitFlow), default branch, branch naming, and when to rebase vs. merge.

## Issues & Planning

Explain how to file issues, required templates/labels, estimation, and triage/assignment practices.

## Commit Messages

State the convention (e.g., Conventional Commits), include examples, and how to reference issues.

features: e.g. add user authentication  
fixes: e.g. prevent crash when missing token  
documents: e.g. update README with setup steps  

## Code Style, Linting & Formatting

Name the formatter/linter, config file locations, and the exact commands to check/fix locally.
Linter: Biome.js
Config Locations: MyApp, web-app
Check/Fix: biome lint, bimoe check

## Testing

Define required test types, how to run tests, expected coverage thresholds, and when new/updated tests are mandatory.

TBD

## Pull Requests & Reviews

Outline PR requirements (template, checklist, size limits), reviewer expectations, approval rules, and required status checks.

At least one review is required.

## CI/CD

Link to pipeline definitions, list mandatory jobs, how to view logs/re-run jobs, and what must pass before merge/release.

## Security & Secrets

State how to report vulnerabilities, prohibited patterns (hard-coded secrets), dependency update policy, and scanning tools.

TBD

## Documentation Expectations

Specify what must be updated (README, docs/, API refs, CHANGELOG) and docstring/comment standards.
What should be updated:
README.md: If changes add new features, modify setup instructions, or affect the continuous integration process
CHANGELOG.md: If set up, coding styles, or other major changes are made

Follow chosen style conventions
Should have clear and concise comments for code decisions.

## Release Process

Describe versioning scheme, tagging, changelog generation, packaging/publishing steps, and rollback process.

TBD

## Support & Contact

Provide maintainer contact channel, expected response windows, and where to ask questions.
