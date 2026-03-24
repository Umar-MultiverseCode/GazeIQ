# Contributing to GazeIQ

First off, thanks for taking the time to contribute! GazeIQ is built on the philosophy of privacy-first edge AI.

## How Can I Contribute?

### Reporting Bugs
Bugs are tracked as GitHub issues. Explain the problem and include additional details to help maintainers reproduce the problem:
* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples or logs demonstrating the issue

### Suggesting Enhancements
Enhancement suggestions are tracked as GitHub issues:
* Clearly describe the suggested enhancement
* Explain why this enhancement would be useful to most users
* Provide a conceptual architectural implementation if possible

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. Ensure you've documented any new architectural changes.
3. Make sure to run the `bundle.js` build phase.
4. Issue that pull request!

## Code Style Guide
* `eslint` overrides are discouraged unless strictly necessary.
* ES6+ syntax is heavily encouraged. Let's keep `var` out of the codebase.
* TensorFlow scalar operations should **ALWAYS** dispose tensors memory immediately to prevent WebGL memory starvation.
