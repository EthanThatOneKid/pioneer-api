# pioneer-api

API integration exploration for a quality AI automation machine and its supporting software.

## Discovery visit

- **Time:** Thursday at 10:30 AM
- **Purpose:** Evaluate the existing machine and software systems, then determine how to build the API connection.
- **Program:** Quality AI program (meeting notes say “ES 9102”)
- **Team:** Alberto, Clay, and Travis
- **Need:** Technical support designing and building the API because the team does not have the required software background.

## Pioneer Circuits context

The Pioneer relevant to this project appears to be **Pioneer Circuits, Inc.**, a privately held U.S. printed circuit board assembly manufacturer founded in 1981. Its public materials describe work across defense, aviation, near-Earth orbit, and space exploration, with products and services spanning flex, rigid-flex, extended-length flex, and rigid PCBs/PCBAs.

### Quality and traceability

- Pioneer publicly lists AS9100D, ISO 9001:2015, NADCAP Electronics AC7119, IPC-A-610, NASA 8739.1–.4, and DDTC/ITAR registration among its certifications, standards, and registrations.
- Its published purchasing terms require suppliers to maintain an acceptable quality system, with ISO 9001 or MIL-I-45208 as a minimum supplier inspection-system baseline.
- The same terms call for certificates of conformance and applicable test records with shipments. They state that general records should be retained for at least 10 years and AS9102 or First Article Inspection reports for 99 years; nonconforming products must be reported to Pioneer’s Purchasing and Quality Assurance departments.
- The discussion refers to “ES 9102.” Pioneer’s public materials use **AS9102** for First Article Inspection Reports, so the exact internal program name, scope, and workflow should be confirmed during discovery.

### API discovery implications

The public context suggests that any integration may need to preserve traceability across design, manufacturing, inspection, quality records, and nonconformance workflows. This is a discovery hypothesis, not a confirmed system design. Before implementation, document the machine protocol, source-of-truth systems, data model, authentication and network boundaries, event timing, audit requirements, and record-retention rules.

No public source reviewed here confirms the internal quality-AI program or the machine/software interfaces. Those details should be gathered on site before choosing an API contract.

## Technical direction

- TypeScript
- Bun-first, Node-compatible runtime
- Hono
- `@hono/zod-openapi` for request validation and OpenAPI generation
- Google AIP-aligned resource naming, methods, pagination, and error conventions

## Sources

- [Pioneer Circuits — Who We Are](https://www.pioneercircuits.com/who-we-are)
- [Pioneer Circuits — Certifications and Recognition](https://www.pioneercircuits.com/company/certifications-and-recognition)
- [Pioneer Circuits — PCBA Manufacturing](https://www.pioneercircuits.com/capabilities/pcba-manufacturing)
- [Pioneer Circuits — Purchase Order Terms and Conditions](https://www.pioneercircuits.com/pcba-manufacturing-terms-conditions)
