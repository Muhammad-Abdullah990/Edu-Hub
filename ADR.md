# Architecture Decision Record - Production Engineering

## ADR-001: Async Job Architecture

**Status**: Accepted

**Problem**: Heavy operations (PDF generation, analytics aggregation, automation) were blocking HTTP requests, causing timeouts and poor user experience.

**Decision**: Implement BullMQ-based async job queue system with dedicated workers.

**Consequences**:
- ✅ Non-blocking request lifecycle
- ✅ Scalable worker processing
- ✅ Job retry with exponential backoff
- ✅ Dead-letter queue for failures
- ❌ Increased infrastructure complexity
- ❌ Requires Redis dependency

---

## ADR-002: Human-in-the-Loop for Communications

**Status**: Accepted

**Problem**: Automated communication system could accidentally send unverified messages to students/parents, causing reputation damage and compliance issues.

**Decision**: All WhatsApp communications are prepared as drafts and require explicit human approval before sending. System actively prevents automatic sending.

**Consequences**:
- ✅ Prevents accidental mass communications
- ✅ Maintains operator control
- ✅ Enables message verification
- ✅ Audit trail of approvals
- ❌ Slows communication workflow
- ❌ Requires operational dashboard

---

## ADR-003: Structured Observability

**Status**: Accepted

**Problem**: Console logging was inadequate for production debugging and performance analysis.

**Decision**: Implement structured JSON logging with correlation IDs, Prometheus metrics, and health check system.

**Consequences**:
- ✅ Production debugging enabled
- ✅ Performance metrics visible
- ✅ Request tracing across services
- ✅ Alerting infrastructure possible
- ❌ Requires metric aggregation system
- ❌ Log shipping needed

---

## ADR-004: Environment-Based Configuration

**Status**: Accepted

**Problem**: Environment-specific differences weren't validated, leading to deployment failures.

**Decision**: Centralized Zod-validated environment configuration with startup-time failures.

**Consequences**:
- ✅ Fast failure on misconfiguration
- ✅ Type-safe environment access
- ✅ Consistent deployment
- ✅ Clear error messages
- ❌ Configuration changes require restart

---

## ADR-005: Containerized Architecture

**Status**: Accepted

**Problem**: Local development diverged from production, causing "works on my machine" issues.

**Decision**: Docker containerization for all services with multi-stage builds and non-root execution.

**Consequences**:
- ✅ Dev/prod parity
- ✅ Easy horizontal scaling
- ✅ Consistent deployment
- ✅ Security best practices
- ❌ Added complexity
- ❌ Learning curve for team

---

## ADR-006: Provider-Agnostic AI Layer

**Status**: Accepted

**Problem**: Tight coupling to OpenAI would cause migration pain if requirements changed.

**Decision**: Abstract AI functionality through provider adapter pattern with local fallback.

**Consequences**:
- ✅ No vendor lock-in
- ✅ Easy provider switching
- ✅ Future-proof design
- ✅ Local inference option
- ❌ Additional abstraction layer
- ❌ Complexity for simple cases

---

## ADR-007: Workflow Persistence

**Status**: Accepted

**Problem**: Automation workflows could lose state on restart, causing inconsistent behavior.

**Decision**: Persist workflow state to filesystem with audit trail for recovery and compliance.

**Consequences**:
- ✅ Workflow recovery possible
- ✅ Complete audit trail
- ✅ Compliance-friendly
- ✅ Debugging support
- ❌ Requires persistent storage
- ❌ File I/O overhead

---

## ADR-008: Selector Abstraction for Playwright

**Status**: Accepted

**Problem**: Fragile CSS selectors caused intermittent automation failures when WhatsApp Web changed.

**Decision**: Abstract DOM selectors with fallback strategies and retry logic.

**Consequences**:
- ✅ Resilient to UI changes
- ✅ Better debugging
- ✅ Explicit selectors
- ✅ Strategy documentation
- ❌ More code
- ❌ Fallback maintenance burden

