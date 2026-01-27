---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
status: complete
inputDocuments: ['product-brief-tiny-url-2026-01-23.md']
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: web_app
  domain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - tiny-url

**Author:** Stas
**Date:** 2026-01-24

## Executive Summary

**tiny-url** is a URL shortening web application designed as a learning project to understand read-heavy system design patterns. The MVP delivers anonymous URL shortening with custom slug support through a clean, responsive SPA interface.

**Key Targets:**
- 1M redirects/day at < 100ms latency
- 1K URL creations/day
- 99.9% uptime

**Classification:** Web App | General Domain | Medium Complexity | Greenfield

## Success Criteria

### User Success

| Metric | Target | Success Indicator |
|--------|--------|-------------------|
| **URL Shortening Success Rate** | 99.9% | Users successfully create short URLs without errors |
| **Redirect Success Rate** | 99.99% | Short links reliably redirect to destination |
| **Time to Short URL** | < 2 seconds | Users get their short link almost instantly |
| **Redirect Latency** | < 100ms | Clicks feel instantaneous |

**Emotional Success:** User thinks "That was easy" — paste, click, copy, done.

### Business Success

Since this is a learning project, business success = technical excellence:

| Objective | Target | Validation |
|-----------|--------|------------|
| **Scale Handling** | 1K writes/day, 1M reads/day | Load testing confirms capacity |
| **High Availability** | > 99.9% uptime | Monitoring shows reliability |
| **Performance** | Latency targets met at peak | P99 metrics within bounds |
| **Code Quality** | Clean, maintainable codebase | Follows best practices |

### Technical Success

| KPI | Target |
|-----|--------|
| **P99 Redirect Latency** | < 100ms |
| **P99 Shortening Latency** | < 500ms |
| **Error Rate** | < 0.1% |
| **Cache Hit Rate** | > 95% |
| **Test Coverage** | > 80% |

### Measurable Outcomes

- ✅ Users can shorten any valid URL
- ✅ Users can create custom slugs that work
- ✅ Short URLs redirect correctly
- ✅ System handles target load without degradation
- ✅ Codebase is documented and testable

## Product Scope

### MVP - Minimum Viable Product

**Core Deliverables:**
1. **URL Shortening Engine** — Accept URL, generate/accept custom short code, store mapping
2. **Redirect Service** — Resolve short code, perform redirect, handle errors
3. **Web UI** — Input form, custom slug option, copy button, mobile-responsive

**MVP Success Gate:** A user can paste a URL, get a short link, and that link works.

### Growth Features (Post-MVP)

- User accounts with link management dashboard
- Click analytics (count, geography, referrers)
- API access for developers
- Link expiration and scheduling

### Vision (Future)

- QR code generation
- Custom branded domains
- Team/organization accounts
- Bulk operations and CSV import
- Browser extension

## User Journeys

### Journey 1: Casual Link Sharer — "Quick Share"

**Persona:** Alex, a college student sharing a research article with classmates

**Opening Scene:**
Alex finds a fascinating article with a 200-character URL. They want to share it in their group chat, but the link is ugly and will break across multiple lines.

**Rising Action:**
1. Alex opens tiny-url in their browser
2. Pastes the long URL into the input field
3. Clicks "Shorten" without entering a custom slug
4. System generates a short code (e.g., `tiny-url.com/x7Kp2m`)

**Climax:**
The short URL appears instantly with a "Copy" button. One click, and it's on their clipboard.

**Resolution:**
Alex pastes the clean, short link into the group chat. Friends click it, land on the article. Alex thinks "That was easy" and closes the tab.

**Requirements Revealed:**
- URL input validation
- Auto-generated short codes
- One-click copy functionality
- Fast response time (< 2 seconds)

---

### Journey 2: Content Creator — "Brand My Link"

**Persona:** Maya, a small business owner promoting a summer sale

**Opening Scene:**
Maya is preparing social media posts for her boutique's summer sale. She wants links that look professional and memorable — not random characters.

**Rising Action:**
1. Maya opens tiny-url with her sale page URL
2. Pastes the URL and sees the custom slug option
3. Types "summer-sale" as her custom slug
4. System checks availability — it's taken!
5. Maya tries "maya-summer-sale" — available!
6. Clicks "Shorten"

**Climax:**
She gets `tiny-url.com/maya-summer-sale` — professional, memorable, and on-brand.

**Resolution:**
Maya uses the link across Instagram, Facebook, and her email newsletter. Customers remember and type the link directly. Sales increase.

**Requirements Revealed:**
- Custom slug input field
- Real-time slug availability checking
- Clear error messaging for taken slugs
- Slug validation (allowed characters, length limits)

---

### Journey 3: Link Recipient — "Just Click It"

**Persona:** Jordan, receiving a short link in a text message

**Opening Scene:**
Jordan gets a text from a friend: "Check this out! tiny-url.com/cool-video"

**Rising Action:**
1. Jordan taps the link on their phone
2. Browser opens, hits tiny-url redirect endpoint
3. System looks up "cool-video" in database
4. Finds the original URL

**Climax:**
In under 100ms, Jordan is redirected to the destination — a YouTube video.

**Resolution:**
Jordan watches the video, never even noticing the redirect happened. The experience was seamless.

**Requirements Revealed:**
- Fast redirect lookup (< 100ms)
- HTTP 301/302 redirect handling
- Mobile browser compatibility
- Graceful 404 for invalid short codes

---

### Journey 4: System Admin/Ops — "Keep It Running"

**Persona:** Stas (you!), monitoring the learning project in production

**Opening Scene:**
It's been a week since deployment. Stas wants to check if the system is healthy and performing as expected.

**Rising Action:**
1. Stas checks application logs for errors
2. Reviews metrics dashboard (if implemented) for latency and throughput
3. Notices cache hit rate is at 92% — below the 95% target
4. Investigates and adjusts cache TTL settings
5. Monitors for improvement

**Climax:**
Cache hit rate climbs to 96%. Redirect latency drops. System is healthy.

**Resolution:**
Stas documents the tuning in a README and moves on, confident the system is performing well.

**Requirements Revealed:**
- Logging for debugging and monitoring
- Metrics collection (latency, throughput, cache hits)
- Configuration for cache TTL
- Health check endpoint

---

### Journey Requirements Summary

| Journey | Key Capabilities Required |
|---------|---------------------------|
| **Casual Sharer** | URL input, auto-generate codes, copy button, fast response |
| **Content Creator** | Custom slugs, availability check, validation, error messages |
| **Link Recipient** | Fast redirects, 301/302 handling, mobile support, 404 page |
| **Admin/Ops** | Logging, metrics, configuration, health checks |

## Web Application Specific Requirements

### Project-Type Overview

tiny-url is a **Single Page Application (SPA)** providing a streamlined URL shortening experience. The architecture prioritizes simplicity, performance, and a frictionless user experience with no page reloads during the core workflow.

### Technical Architecture Considerations

**Application Type:** SPA (Single Page Application)
- Client-side routing for seamless navigation
- API-driven backend for URL shortening and redirects
- Stateless frontend — no user sessions required for MVP

**Separation of Concerns:**
- **Frontend:** SPA serving the web UI (paste, shorten, copy flow)
- **Backend API:** RESTful endpoints for URL shortening
- **Redirect Service:** High-performance redirect handler (may be same or separate service)

### Browser Support Matrix

| Browser | Minimum Version | Priority |
|---------|-----------------|----------|
| Chrome | Last 2 versions | Primary |
| Firefox | Last 2 versions | Primary |
| Safari | Last 2 versions | Primary |
| Edge | Last 2 versions | Primary |
| Mobile Safari | iOS 14+ | Secondary |
| Chrome Mobile | Android 10+ | Secondary |

**Not Supported:** Internet Explorer, legacy browsers

### Responsive Design Requirements

| Breakpoint | Target Devices | Layout |
|------------|----------------|--------|
| Mobile | < 768px | Single column, full-width input |
| Tablet | 768px - 1024px | Centered card layout |
| Desktop | > 1024px | Centered card layout, max-width container |

**Mobile-First Approach:** Design for mobile, enhance for desktop.

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint** | < 1.5s | Lighthouse |
| **Time to Interactive** | < 2.0s | Lighthouse |
| **Largest Contentful Paint** | < 2.5s | Lighthouse |
| **Cumulative Layout Shift** | < 0.1 | Lighthouse |
| **Bundle Size** | < 200KB gzipped | Build output |

### SEO Strategy

**Basic SEO Implementation:**
- Meta tags (title, description, Open Graph)
- Semantic HTML structure
- robots.txt allowing crawlers
- Sitemap.xml for homepage

**Not Required for MVP:**
- Server-side rendering (SSR)
- Dynamic meta tags per short URL
- Structured data / JSON-LD

### Accessibility Level

**Target:** WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | All interactive elements focusable and operable |
| **Color Contrast** | Minimum 4.5:1 for normal text, 3:1 for large text |
| **Screen Reader Support** | Proper ARIA labels, semantic HTML |
| **Focus Indicators** | Visible focus states on all interactive elements |
| **Error Identification** | Clear error messages associated with form fields |

### Implementation Considerations

**Frontend Stack Recommendations:**
- Modern framework (React, Vue, or Svelte)
- CSS framework for responsive design (Tailwind CSS recommended)
- No heavy dependencies — keep bundle lean

**API Design:**
- RESTful endpoints
- JSON request/response format
- CORS configured for SPA origin

**Deployment:**
- Static hosting for SPA (Vercel, Netlify, S3+CloudFront)
- Separate API deployment (containerized or serverless)

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP
- Focus on solving the core problem (long URLs → short URLs) with minimal friction
- Validate that the technical architecture handles the target scale
- Learning-focused: understand read-heavy system patterns

**Resource Requirements:**
- Solo developer (learning project)
- Estimated MVP timeline: 2-4 weeks
- Skills needed: Full-stack web development, database design, caching

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- ✅ Casual Link Sharer — Quick anonymous shortening
- ✅ Content Creator — Custom slug creation
- ✅ Link Recipient — Fast, reliable redirects
- ⚠️ Admin/Ops — Basic logging only (no dashboard)

**Must-Have Capabilities:**

| Feature | Rationale |
|---------|-----------|
| URL input & validation | Core functionality |
| Auto-generated short codes | Default experience |
| Custom slug support | Key differentiator for users |
| Slug availability check | Prevent conflicts |
| One-click copy | UX essential |
| Fast redirects (<100ms) | Core value proposition |
| 404 handling | Graceful error experience |
| Basic logging | Debugging & monitoring |

**Explicitly Out of MVP:**
- User accounts / authentication
- Click analytics / tracking
- API access
- Link expiration
- Admin dashboard

### Post-MVP Features

**Phase 2 (Growth):**
| Feature | Value Added |
|---------|-------------|
| User accounts | Link management, history |
| Click analytics | Count, geography, referrers |
| API access | Developer integrations |
| Link expiration | Time-limited links |

**Phase 3 (Expansion):**
| Feature | Value Added |
|---------|-------------|
| QR code generation | Print/physical sharing |
| Custom branded domains | Enterprise/brand use |
| Team/organization accounts | Collaboration |
| Bulk operations | Power user efficiency |
| Browser extension | Frictionless access |

### Risk Mitigation Strategy

**Technical Risks:**
| Risk | Mitigation |
|------|------------|
| Cache miss storms | Implement cache warming, TTL tuning |
| Database bottleneck | Design for read replicas from start |
| Slug collisions | Use proven short code generation algorithm |

**Market Risks:**
- N/A — Learning project, not competing for market share

**Resource Risks:**
| Risk | Mitigation |
|------|------------|
| Scope creep | Strict MVP boundaries defined above |
| Complexity overload | Start with simplest implementation, iterate |

## Functional Requirements

### URL Shortening

- **FR1:** Users can submit a long URL to be shortened
- **FR2:** Users can optionally specify a custom slug for their short URL
- **FR3:** System can auto-generate a unique short code when no custom slug is provided
- **FR4:** System can validate that submitted URLs are properly formatted
- **FR5:** System can check if a custom slug is available before creation
- **FR6:** System can reject duplicate or reserved slugs with clear error messaging
- **FR7:** System can store the mapping between short codes and original URLs

### URL Redirection

- **FR8:** Users can access a short URL and be redirected to the original destination
- **FR9:** System can perform HTTP 301/302 redirects for valid short codes
- **FR10:** System can display a 404 error page for invalid or non-existent short codes
- **FR11:** System can serve redirects with sub-100ms latency under normal load

### Web User Interface

- **FR12:** Users can view a homepage with a URL input field
- **FR13:** Users can see an optional custom slug input field
- **FR14:** Users can click a "Shorten" button to submit their URL
- **FR15:** Users can view the generated short URL after successful shortening
- **FR16:** Users can copy the short URL to clipboard with one click
- **FR17:** Users can receive clear error messages when shortening fails
- **FR18:** Users can use the interface on mobile, tablet, and desktop devices

### System Operations

- **FR19:** System can log all shortening and redirect requests for debugging
- **FR20:** System can expose a health check endpoint for monitoring
- **FR21:** System can cache frequently accessed URL mappings for performance
- **FR22:** System can handle concurrent requests without data corruption

## Non-Functional Requirements

### Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR1:** Redirect latency | < 100ms P99 | Server-side metrics |
| **NFR2:** URL shortening response | < 500ms P99 | API response time |
| **NFR3:** Homepage load time | < 2s Time to Interactive | Lighthouse |
| **NFR4:** Concurrent redirect handling | 100 requests/second minimum | Load testing |

### Scalability

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR5:** Daily redirect capacity | 1,000,000 redirects/day | Monitoring |
| **NFR6:** Daily shortening capacity | 1,000 URLs/day | Monitoring |
| **NFR7:** Database growth | Support 1M+ URL mappings | Storage metrics |
| **NFR8:** Cache efficiency | > 95% cache hit rate | Cache metrics |

### Reliability

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR9:** System uptime | 99.9% availability | Uptime monitoring |
| **NFR10:** Data durability | No data loss on system restart | Recovery testing |
| **NFR11:** Error rate | < 0.1% of all requests | Error tracking |
| **NFR12:** Graceful degradation | Serve cached redirects if DB unavailable | Failover testing |

### Security

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR13:** Input validation | Reject malformed URLs | Unit tests |
| **NFR14:** Rate limiting | Prevent abuse (e.g., 100 shortens/hour/IP) | Rate limit logs |
| **NFR15:** HTTPS only | All traffic encrypted in transit | SSL verification |
| **NFR16:** No sensitive data storage | No PII collected or stored | Code review |

### Accessibility

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR17:** WCAG compliance | WCAG 2.1 AA | Automated + manual audit |
| **NFR18:** Keyboard navigation | All functions accessible via keyboard | Manual testing |
| **NFR19:** Screen reader support | Proper ARIA labels and semantic HTML | Screen reader testing |
| **NFR20:** Color contrast | Minimum 4.5:1 ratio | Contrast checker |
