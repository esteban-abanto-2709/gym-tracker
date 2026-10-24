import http from 'k6/http';
import { check } from 'k6';

const API = __ENV.API_URL || 'http://api:4000';
const ROUTES = {
  days: '/workouts/days?tz=America/Lima',
  sessions: '/sessions',
};
const ROUTE = __ENV.ROUTE || 'sessions';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    [`http_req_duration{name:${ROUTE}}`]: ['p(95)>=0'],
    checks: ['rate==1'],
  },
};

export function setup() {
  if (!ROUTES[ROUTE])
    throw new Error(`ROUTE must be one of ${Object.keys(ROUTES)}`);
  const res = http.post(
    `${API}/auth/login`,
    JSON.stringify({
      email: 'bench@gym-tracker.test',
      password: 'bench-password',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  if (res.status !== 201) throw new Error(`login failed: ${res.status}`);
  return { token: res.cookies.token[0].value };
}

export default function ({ token }) {
  const res = http.get(`${API}${ROUTES[ROUTE]}`, {
    headers: { Cookie: `token=${token}` },
    tags: { name: ROUTE },
  });
  check(res, { [`${ROUTE} 200`]: (r) => r.status === 200 });
}
