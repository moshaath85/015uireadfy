# API Contracts v1.1

All endpoints are prefixed with `/api/v1`. Responses follow `{ data, meta, errors }`.

## Enums
- visibility_status: public, private, vip, hidden
- availability_status: available, reserved, sold, on_loan, not_for_sale
- price_status: price_visible, price_upon_request, private_quote
- certificate_status: draft, issued, revoked, reissued
- appointment_type: gallery_visit, private_viewing, artist_meeting, consultation, collection_review
- inquiry_type: artwork_acquisition, artist_inquiry, service_inquiry, project_inquiry, general

## Public Endpoints
GET /api/v1/public/artists
GET /api/v1/public/artists/:slug
GET /api/v1/public/artworks
GET /api/v1/public/artworks/:slug
GET /api/v1/public/collections
GET /api/v1/public/collections/:slug
GET /api/v1/public/exhibitions
GET /api/v1/public/exhibitions/:slug
GET /api/v1/public/projects
GET /api/v1/public/projects/:slug
GET /api/v1/public/services
GET /api/v1/public/services/:slug
GET /api/v1/public/news
GET /api/v1/public/news/:slug
GET /api/v1/public/publications
GET /api/v1/public/publications/:slug
GET /api/v1/public/search

## Forms
POST /api/v1/inquiries
POST /api/v1/appointments
POST /api/v1/newsletter

## Certificates
GET /api/v1/certificates/verify/:certificate_number

## AI
POST /api/v1/ai/ask
POST /api/v1/ai/reindex

## Admin
CRUD for all entities. GET /api/v1/admin/audit-logs.
