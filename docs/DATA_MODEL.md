# Gallery 015 Data Model (v1.5)

## Normalization Principles
- No duplicated content across entities.
- All relationships are explicit via IDs.
- Mutable state is tracked via history and audit logs.
- Content for AI is referenced, never copied.

## Core Entities
Artist, Artwork, ArtworkImage, ArtworkFile, ArtworkHistory, Collection, Exhibition, ExhibitionArtist, ExhibitionArtwork, Participation, Project, ProjectArtist, ProjectArtwork, Certificate, CertificateTemplate, Service, Inquiry, Appointment, News, Publication, NewsletterSubscriber, AIKnowledge, AILog, Media, AuditLog.

## API Versioning Note
All future endpoints must be prefixed with `/api/v1/`.
