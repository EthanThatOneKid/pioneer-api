# Pioneer API — IP, confidentiality, and data-handling terms draft

**Status:** Negotiation draft for counsel review; not legal advice.

## 1. Confidential information

Pioneer’s IWP files, bubbled drawings, machine configurations, Discus data, customer information, inspection results, manufacturing records, credentials, and non-public business information are Confidential Information. Contractor may use them only to perform the agreed SOW, must limit access to authorized personnel and approved providers, and must protect them using reasonable administrative, technical, and physical safeguards.

## 2. Data control and permitted processing

Pioneer retains ownership and control of Pioneer Data. Contractor will not sell, publish, train a general-purpose model on, or reuse Pioneer Data outside the SOW. Contractor will process the minimum data necessary, maintain source/output hashes and audit metadata, and notify Pioneer promptly of a suspected unauthorized disclosure.

## 3. AI-provider boundary

Synthetic fixtures may use Google Gemini through the AI SDK. Real Pioneer Data must not be sent to the free Gemini path. Real-data inference may use only Pioneer-authorized Claude access through GovCloud, after Pioneer approves the endpoint, model, region, retention behavior, logging, and contractual controls. Prompts, images, and outputs must not be used for provider training where the approved terms do not permit it.

## 4. Storage, retention, and deletion

During the pilot, data will be stored only in approved repositories and working locations. Pioneer will specify retention periods for source files, images, outputs, logs, and audit manifests. At completion or termination, Contractor returns or securely deletes Pioneer Data and confirms deletion, except for records required by law or an agreed immutable contract/audit record. Local scratch copies and generated artifacts must be inventoried and removed.

## 5. Security and access

Pioneer will provide least-privilege credentials through its approved mechanism. Contractor will not commit secrets, copy production data into public repositories, or use unapproved personal services. Access is revoked at completion or on request. Any production write path requires separate authorization, testing, rollback, and acceptance.

## 6. IP ownership

Pioneer owns the machine-specific and Discus-specific deliverables created and paid for under the SOW, including the agreed integration code, schemas, configuration, mappings, runbook, and final evaluation artifacts. Ownership transfers upon payment, subject to Contractor’s retained background technology.

Contractor retains pre-existing and reusable background technology, generic parsers, generic geometry/registration algorithms, generic AI adapters, test harnesses, know-how, and improvements that do not disclose Pioneer Confidential Information. Contractor grants Pioneer a perpetual, worldwide, royalty-free license to use any retained background technology embedded in or required to operate the paid deliverables.

## 7. Publicity and disclosure

Neither party may use the other’s name, logo, customer identity, screenshots, data, or results publicly without written approval. Any case study or publication requires separate written permission and de-identification.

## 8. Order of precedence

The executed agreement, NDA/data terms, SOW, quote, and change orders should state their order of precedence. A change order should not silently expand Pioneer’s ownership or data rights beyond the work it expressly adds.
