import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const applications = [
  {
    id: 'cuid123',
    username: 'username1',
    email: 'user1@example.com',
  },
  // ...
]

export const restHandlers = [
  http.get('http://localhost:3000/api/v1/applications', () => {
    return new HttpResponse(JSON.stringify(applications), {
      status: 200,
    })
  }),
]

const server = setupServer(...restHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
