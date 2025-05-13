import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 100, // virtual users
    duration: '30s',
};

export default function () {
    const res = http.get('http://localhost:7778/api/searchToken?query=');
    check(res, {
        'status was 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
}
