# Implementation Plan: Feature Suggestions

## Analysis Summary
The codebase already has partial implementations of many features. Here's what needs to be built:

### User Features (Missing / Partial)
1. **Match reminder (1h before)** — `matchNotifications.ts` is broken (uses outdated column names). Needs rewrite for actual schema.
2. **Favoris (team following)** — `FollowSystem.tsx` only follows users. Need team/ASC following + notifications.
3. **Classement entre amis / mini-ligues** — Not implemented at all.
4. **Badges wiring** — `UserProfileClient.tsx` hardcodes `earned: false`. Need badge earning logic + API.
5. **Enhanced "Mes pronostics" table** — Add streak tracking, points gagnés/perdus column.
6. **Mode invité** — Guest mode not implemented (pages require auth for pronostics but should show matchs/classements without).
7. **WhatsApp share with card image** — `SharePronostic.tsx` only shares text. Enhance with OG image.

### Admin Features (Missing / Partial)
1. **Aperçu notification avant envoi** — Add preview to admin notifications page.
2. **Import CSV** — No CSV import for matchs/équipes.
3. **Gestion des reports** — Match rescheduling with auto-notification to users.
4. **Santé système** — System health monitoring dashboard widget.
5. **Enhanced audit** — Add audit triggers for all admin actions.

## Implementation Priority
High-impact, self-contained features first:
1. Database migration (new tables: mini_ligues, team_follows, match_reports)
2. Match reminder notification API (fixed)
3. Team following (Favoris) — API + component
4. Badges earning logic — API + UI wiring
5. Mini-ligues page — creation, joining, ranking
6. Admin notification preview
7. CSV import API
8. Match reschedule with notification
9. System health dashboard widget
10. Enhanced pronostics table (streak column)
