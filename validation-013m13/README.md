# Build 013M.13 Validation Package

Frozen Preparation-Validatoren für den Completion-Settlement-Fix.

Vom Build-Root aus beispielsweise:
```bash
node validation-013m13/validators/mission-004-settlement-contract-validator.js .
node validation-013m13/validators/mission-004-settlement-source-validator.js .
node validation-013m13/validators/app-settlement-context-routing-validator.js .
node validation-013m13/validators/mission-004-settlement-convergence-validator.js
node validation-013m13/validators/build-013m13-protected-source-regression-validator.js .
```
