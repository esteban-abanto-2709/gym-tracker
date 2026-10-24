import http from 'k6/http';
import { check } from 'k6';

const API = __ENV.API_URL || 'http://api:4000';
const EXERCISE_ID = __ENV.EXERCISE_ID;
const EQUIPMENT_ID = __ENV.EQUIPMENT_ID || 'barra';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    'http_req_duration{name:recommendation}': ['p(95)>=0'],
    'http_req_duration{name:days}': ['p(95)>=0'],
    checks: ['rate==1'],
  },
};

export function setup() {
  if (!EXERCISE_ID) throw new Error('EXERCISE_ID is required');
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
  const params = (name) => ({
    headers: { Cookie: `token=${token}` },
    tags: { name },
  });
  const recommendation = http.get(
    `${API}/workouts/recommendation?exerciseId=${EXERCISE_ID}&equipmentId=${EQUIPMENT_ID}`,
    params('recommendation'),
  );
  const days = http.get(`${API}/workouts/days?tz=America/Lima`, params('days'));
  check(recommendation, { 'recommendation 200': (r) => r.status === 200 });
  check(days, { 'days 200': (r) => r.status === 200 });
}
