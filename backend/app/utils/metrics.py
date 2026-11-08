from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time

# Metrics definitions
REQUEST_COUNT = Counter(
    "smartcity_http_requests_total",
    "Total HTTP Requests",
    ["method", "endpoint", "status_code"]
)

REQUEST_LATENCY = Histogram(
    "smartcity_http_request_duration_seconds",
    "HTTP Request Latency",
    ["method", "endpoint"]
)

COMPLAINTS_CREATED_TOTAL = Counter(
    "smartcity_complaints_created_total",
    "Total complaints registered",
    ["category", "priority"]
)

COMPLAINTS_RESOLVED_TOTAL = Counter(
    "smartcity_complaints_resolved_total",
    "Total complaints resolved",
    ["department"]
)

ACTIVE_COMPLAINTS_GAUGE = Gauge(
    "smartcity_active_complaints_count",
    "Current active complaints",
    ["status"]
)

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        method = request.method
        path = request.url.path

        # Ignore metrics and health endpoints from heavy tracking
        if path in ["/metrics", "/health", "/api/health"]:
            return await call_next(request)

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise e
        finally:
            duration = time.time() - start_time
            REQUEST_COUNT.labels(method=method, endpoint=path, status_code=status_code).inc()
            REQUEST_LATENCY.labels(method=method, endpoint=path).observe(duration)

        return response

def metrics_endpoint():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
