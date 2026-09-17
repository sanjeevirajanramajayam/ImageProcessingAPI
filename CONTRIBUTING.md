# Contributing to ImageProcessingAPI

Thank you for your interest in contributing to **ImageProcessingAPI**! We welcome contributions from bug fixes to performance enhancements and deep architectural refactors.

---

## 🌿 Branching Model

We follow standard GitHub Flow:

- **`main`**: Production-ready, stable codebase. Direct commits to `main` are restricted.
- **`feat/<short-description>`**: New features, image operations, or architectural deepenings.
- **`fix/<short-description>`**: Bug fixes and hotfixes.
- **`docs/<short-description>`**: Documentation, ADRs, or guideline updates.
- **`chore/<short-description>`**: Dependency updates, toolings, or configuration changes.

---

## 💬 Commit Convention

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or capability
- `fix:` A bug fix
- `refactor:` Code refactoring that neither fixes a bug nor adds a feature (e.g. deepening modules)
- `docs:` Documentation changes only
- `test:` Adding missing tests or correcting existing tests
- `chore:` Build process, dependency updates, or auxiliary tool changes

**Examples**:
- `feat(pipeline): add support for AVIF output format`
- `fix(auth): rotate refresh tokens atomically on logout`
- `refactor(storage): extract storage adapter seam from fileControllers`

---

## 🛠️ Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sanjeevirajanramajayam/ImageProcessingAPI.git
   cd ImageProcessingAPI
   ```

2. **Environment configuration**:
   ```bash
   cp backend/.env-example backend/.env
   cp backend/.env.test.example backend/.env.test
   ```

3. **Start local infrastructure**:
   ```bash
   docker compose up -d
   ```

4. **Install backend dependencies and run migrations**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   ```

5. **Run test suite**:
   ```bash
   npm test
   ```

---

## 📬 Pull Request Guidelines

1. Ensure your code passes all unit tests (`npm test`).
2. Follow the issue templates (`.github/ISSUE_TEMPLATE`) and PR template (`.github/PULL_REQUEST_TEMPLATE.md`).
3. Link the PR to the relevant issue using `Closes #123`.
4. Ensure CodeQL analysis and GitHub Actions CI checks pass before requesting review.
