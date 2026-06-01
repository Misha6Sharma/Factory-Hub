# Firestore Rules Security Specification

This document defines the zero-trust security specification for our Firestore database, detailing data invariants and edge-case malicious payloads.

## 1. Data Invariants

- **Factory Profile**: Read is public. Write/Update is strictly restricted to signed-in Admin users (`request.auth != null`).
- **Products**: Read is public. Create, Update, and Delete are strictly restricted to signed-in Admin users.
- **Catalogues**:
  - Unauthenticated buyers can read/get catalogues (to view the buyer showroom).
  - Unauthenticated buyers can only update catalogue analytics (specifically to record views, productClicks, cartAdditions, linkHits, quoteRequests), but are strictly forbidden from modifying metadata like name, description, coverImage, status, or product ID lists.
  - Signed-in admins have full write, delete, and list permissions.
- **Orders**:
  - Anyone (unauthenticated buyer) can create a new order (placing order from showroom).
  - Admins can read, update (e.g., status updates), or delete orders.
  - Unauthenticated buyers cannot read or modify existing orders once submitted.
- **Quotes**:
  - Anyone can create a new RFQ (request for quotation).
  - Admins can read, update (e.g., status changes), or delete quotes.
  - Unauthenticated buyers cannot read or modify existing quotes once submitted.
- **Overall Analytics**: Only signed-in admins can read or write.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent attacks that must be strictly rejected with `PERMISSION_DENIED` by our Firestore rules.

### Test ID 1: Unauthorized Factory Profiling
- **Path**: `factory/profile`
- **Operation**: `write` or `update`
- **User State**: Unauthenticated / Buyer
- **Payload**: Attempting to alter GST or branding.
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 2: Anonymous Product Hijacking
- **Path**: `products/evil-product-1`
- **Operation**: `create`
- **User State**: Unauthenticated
- **Payload**: `{ "id": "evil-product-1", "name": "Fake Product", "offerPrice": 0 }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 3: Admin Role Spoofing (Modifying Admin ID lists if any)
- **Path**: `products/p1`
- **Operation**: `update`
- **User State**: Unauthenticated
- **Payload**: Aligns with malicious updates of offer price.
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 4: Modifying Catalog Main Metas anonymously
- **Path**: `catalogues/c1`
- **Operation**: `update`
- **User State**: Unauthenticated
- **Payload**: `{ "name": "Defaced Catalog", "status": "Live" }` — attempting to change name.
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 5: Injected Malicious Product Click Payload in Analytics
- **Path**: `catalogues/c1`
- **Operation**: `update`
- **User State**: Unauthenticated
- **Payload**: `{ "analytics": { "views": "not_a_number_but_a_huge_string..." } }` — Injection.
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 6: Direct Reading of Other Client's Order
- **Path**: `orders/ORD-12345`
- **Operation**: `get` or `read`
- **User State**: Unauthenticated
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 7: Direct Reading of Other Client's Quotation
- **Path**: `quotes/RFQ-12345`
- **Operation**: `get` or `read`
- **User State**: Unauthenticated
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 8: Unverified Status Transitioning on Orders
- **Path**: `orders/ORD-12345`
- **Operation**: `update`
- **User State**: Unauthenticated
- **Payload**: `{ "status": "Delivered" }`
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 9: Non-existent product ID in RFQ creation (Orphaned document write)
- **Path**: `quotes/RFQ-some`
- **Operation**: `create`
- **User State**: Unauthenticated
- **Payload**: Creating a reference pointing to some phantom product ID to trigger database bloat.
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 10: Overall Analytics modification by Buyer
- **Path**: `analytics/overall`
- **Operation**: `write` or `update`
- **User State**: Unauthenticated
- **Payload**: Set total revenue to ₹9,999,999.
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 11: Immortality Field update on Product id
- **Path**: `products/p1`
- **Operation**: `update`
- **User State**: Authenticated Admin
- **Payload**: Trying to alter the `id` field of a product to swap database mappings.
- **Expected Outcome**: `PERMISSION_DENIED`

### Test ID 12: Timestamp poisoning in Catalogue Creation
- **Path**: `catalogues/c1`
- **Operation**: `create`
- **User State**: Authenticated Admin
- **Payload**: `{ "createdAt": "2020-01-01T00:00:00Z" }` instead of using the exact server timestamp (`request.time`).
- **Expected Outcome**: `PERMISSION_DENIED`
