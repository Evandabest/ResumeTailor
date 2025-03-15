# Testing Framework Selection

## Backend Tests
- **pytest** - Unit tests and API integration tests
  - Location: `/backend/tests/`
  - Example test file structure in `tests/github.py`

## Frontend Tests
- **Jest** + **React Testing Library** - Component tests
  - Location: `/frontend/__tests__/`
- **Playwright** - End-to-end tests
  - Location: `/frontend/e2e/`

# Example Tests

## Backend Unit Test (pytest)
```python
# backend/tests/github.py
def test_github_link_success(client, mock_supabase):
    """Example unit test for GitHub linking"""
    response = client.post('/github/link', json={
        'token': 'test-token',
        'code': 'test-code'
    })
    assert response.status_code == 200
```

## Frontend Component Test (Jest + RTL)
```typescript
// frontend/__tests__/components/GithubIntegration.test.tsx
import { render, screen } from '@testing-library/react'
import GithubIntegration from '../../components/GithubIntegration'

test('displays GitHub link button when not connected', () => {
  render(<GithubIntegration token="test-token" />)
  expect(screen.getByText('Link GitHub')).toBeInTheDocument()
})
```

## E2E Test (Playwright)
```typescript
// frontend/e2e/github-flow.spec.ts
test('GitHub integration flow', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Link GitHub')
  await page.fill('[placeholder="Email"]', 'test@example.com')
  await page.click('text=Connect')
  await expect(page.locator('text=Projects')).toBeVisible()
})
```

# CI Pipeline

GitHub Actions workflow at `.github/workflows/test.yml`:
- Runs on every push and pull request
- Executes all automated tests
- Reports test failures
- Tracks code coverage through Codecov

# Repository Organization

```
backend/
├── tests/          #pytest tests      
│   └── users.py    #example pytest test

frontend/
├── __tests__/     # Jest component tests
└── e2e/          # Playwright E2E tests
```

# Helpful Resources

- [pytest Documentation](https://docs.pytest.org/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
