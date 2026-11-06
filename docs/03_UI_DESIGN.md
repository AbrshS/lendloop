# LendLoop: UI Design Guide

> Follow this for every screen. The brief says "nice, minimal layout" and the evaluators judge UX and practicality, so: calm, fast to scan, no decoration without a job.

---

## 1. Subject, audience, job

- **Product:** a neighborhood tool-lending board.
- **Audience:** neighbors of all ages and tech comfort, mostly on phones, often mid-project ("I need a drill this weekend").
- **Primary job:** find a tool, request it for dates, and know the status of every request without confusion.
- **Feeling:** a well-kept community pegboard in a garage: practical, friendly, trustworthy. Not a SaaS dashboard.

## 2. Design idea (the one memorable thing)

**The tool tag.** Each tool is presented as a hardware-store hang tag: a card with one clipped corner and a small punched hole at the top-left. That is the only "signature" shape in the product. Everything else stays quiet: flat surfaces, thin lines, generous spacing.

Do not add more novelty than this. No gradients, no glassmorphism, no illustrations, no scattered animation.

## 3. Tokens

### Color (define as CSS variables, mapped into Tailwind theme)

| Token | Hex | Use |
|---|---|---|
| `--bench` | `#EDF1EF` | page background (cool light grey-green) |
| `--surface` | `#FFFFFF` | cards, dialogs, inputs |
| `--ink` | `#1B2B33` | primary text, primary buttons |
| `--ink-soft` | `#53656E` | secondary text (contrast >= 4.5:1 on bench) |
| `--line` | `#CBD5D1` | borders, dividers |
| `--loop` | `#0F766E` | links, focus ring, selected states |
| `--tape` | `#F5C518` | the single accent: tag hole ring, Trusted Lender badge, primary highlight |
| `--available` | `#2F7D4F` | status: available |
| `--onloan` | `#3B5B8C` | status: on loan |
| `--pending` | `#9A6A12` | status: pending |
| `--danger` | `#B3261E` | destructive, overdue, errors |

Rules: text on `--tape` is always `--ink`. Never use `--tape` as large fills. Status is always **icon/text + color**, never color alone. Light theme only (dark mode out of scope).

### Typography

- **Display / headings:** Bricolage Grotesque (600). Used for the wordmark, page titles, tool names on tags.
- **Body / UI:** Public Sans (400, 500, 600).
- Load via `next/font/google`, with `display: swap` and system fallbacks.
- Scale (px, desktop / mobile): H1 40/30, H2 28/24, H3 20/18, body 16/16, small 14/14. Line-height 1.5 body, 1.2 headings.
- Max line length 65ch. Sentence case everywhere. No ALL CAPS labels, no tracked-out eyebrows, no single-word accent tricks in headlines.

### Spacing, radius, elevation

- 4px base grid: 4, 8, 12, 16, 24, 32, 48, 64.
- Radius: inputs/buttons 8px, tags/cards 12px (with the clipped corner on tool tags), dialogs 16px. Not one radius for everything.
- Elevation: borders (`--line`) first. A shadow only on dialogs and menus.
- Page container max-width 1120px, side padding 16 (mobile) / 24 (desktop).

## 4. Layout

### 4.1 Public page (signed out)

```
+--------------------------------------------------------------+
| LendLoop                                  [ Sign in ]        |
+--------------------------------------------------------------+
|                                                              |
|  Borrow what you need.                                       |
|  Lend what you don't.                                        |
|  [ Sign in to lend or borrow ]                               |
|                                                              |
|  Available near you                                          |
|  (_)Cordless drill   (_)Hedge trimmer   (_)Stand mixer       |
|     Power tools         Garden             Kitchen           |
|  (_)Tent (4 person)  (_)Pressure washer ...                  |
+--------------------------------------------------------------+
```
- Left-aligned hero. Headline is the tagline, set large in Bricolage. One button.
- The hero's visual is the **real list of tags** (live from Convex), not a stock image.
- Public tags show **name + category only**. No status chip, no owner, no condition.

### 4.2 App shell (signed in)

```
Desktop: top bar + left-aligned tab nav
+--------------------------------------------------------------+
| LendLoop   All tools | My listings | My requests | Incoming 2 | Admin |   [+ List a tool]  (avatar)
+--------------------------------------------------------------+
| Page title                                  [filters]        |
| content                                                      |
```
- Mobile: top bar with wordmark + avatar; bottom tab bar (All tools, My listings, Requests, Incoming); "List a tool" as a floating button above the bar.
- "Incoming" shows a count badge when requests are pending.
- "Admin" tab only appears for admins (UX only; backend enforces).

### 4.3 All tools

- Filter row: category chips (All, Power tools, Garden, Kitchen, Camping, Hand tools, Cleaning, Other). Single-select. Selected chip = `--ink` fill.
- Grid of tool tags: 1 column mobile, 2 tablet, 3 desktop.
- Tool tag content: name (Bricolage 20), category, condition, status chip (Available / On loan until Nov 8), Trusted Lender badge if applicable, button **Request to borrow** (disabled with reason on own tools and on loan).
- Empty state: "No tools in this category yet. Be the first to list one." + **List a tool**.

### 4.4 Request dialog

- Title: "Request to borrow {tool name}".
- Fields: start date, end date (date range picker), optional message (300 chars, counter).
- Inline validation: "End date must be on or after the start date." / "These dates overlap an approved loan."
- Buttons: **Send request** (primary), Cancel.
- Success toast: "Request sent." Appears under My requests as **Pending**.

### 4.5 My listings

- List/table (cards on mobile): tool, category, condition, status, pending request count, actions: **Edit**, **Delete**.
- Delete opens a confirm dialog: "Delete {tool name}? This can't be undone." Disabled with explanation if there is an approved loan.
- Empty state: "You haven't listed any tools." + **List a tool**.

### 4.5b List / edit tool form

- Fields in order: name, category (select), condition (select), short description (textarea, counter 300).
- Primary button **List tool** / **Save changes**. Field-level errors under inputs.

### 4.6 My requests

- Rows: tool name, dates, status chip (Pending, Approved, Declined, Cancelled, Returned), lender display name only after approval **[keep minimal]**.
- Pending rows have **Cancel request**.
- Overdue approved loans show a red "Overdue by 2 days" chip.
- **Bonus:** under each row, a muted activity line: "Reminder sent 2 days ago".

### 4.7 Incoming requests

- Grouped: **Needs your answer** (pending) first, then **Active loans**, then **History**.
- Pending row: borrower display name, dates, message, buttons **Approve** (primary) and **Decline** (secondary, confirm).
- Active loan row: button **Mark as returned** (confirm).
- Bonus activity line per loan, e.g. "Borrower notified", "Reminder sent yesterday".

### 4.8 Admin

- Tabs: **All loans** (table with filters by status, overdue first), **All listings** (with **Remove listing**, confirm required), **Lenders** (toggle **Trusted Lender**).
- Admin pages get a visible but calm "Admin" page title; no scary colors except destructive buttons.
- Table is horizontally scrollable on mobile.

## 5. Components

| Component | Spec |
|---|---|
| Button | Primary: `--ink` bg, white text. Secondary: white bg, `--line` border. Destructive: `--danger`. Min height 44px (touch). Loading state shows spinner and keeps width. |
| Input / select / textarea | White, `--line` border, 8px radius, label above (never placeholder-only), helper + error text below. |
| Tool tag | See section 2. Clipped top-right corner, 10px punched hole (outlined with `--tape` ring) top-left, name, meta, status, action. |
| Status chip | Icon + text. Available (check), On loan (clock), Pending (hourglass), Declined (x), Returned (undo), Overdue (alert). |
| Trusted Lender badge | `--tape` bg, `--ink` text, shield-check icon, text "Trusted lender". |
| Toast | Bottom-center (mobile) / bottom-right (desktop). `aria-live="polite"`. Auto-dismiss 5s, errors stay until dismissed. |
| Dialog | Focus trap, ESC closes, returns focus. Radix via shadcn. |
| Skeleton | Used for loading lists (matching the tag shape). No full-page spinners. |

Icons: lucide-react, 20px, stroke 1.75.

## 6. States (every screen)

- **Loading:** skeletons shaped like the final content.
- **Empty:** one sentence saying what's empty + one action.
- **Error:** says what went wrong and what to do; includes **Try again**. Example: "We couldn't load tools. Check your connection and try again."
- **Forbidden / not found:** "You don't have access to this page." with a link back to All tools.
- **Success:** toast with the same verb as the button ("Request sent", "Listing saved", "Marked as returned").

## 7. Copy rules

- Plain verbs, sentence case, active voice, user language (not "webhook", "mutation", "payload").
- Button names stay consistent through the flow: *Request to borrow -> Send request -> "Request sent."*
- Errors don't apologize or blame; they say what to fix.
- Dates shown as "Nov 8" (add year only if not current year). Relative time for activity ("2 days ago").

## 8. Motion

- One orchestrated moment only: tool tags settle in once on the first load of the public page (short, 200ms, opacity + 4px translate, staggered max 6 items).
- Everything else: only responses to user action (dialog open, toast, button loading).
- Respect `prefers-reduced-motion`: disable the entrance and all non-essential transitions.

## 9. Responsive & accessibility floor

- Mobile-first; test at 360px, 768px, 1280px.
- Touch targets >= 44px. No horizontal page scroll (tables scroll inside a container).
- Visible keyboard focus: 2px `--loop` ring with 2px offset on all interactive elements.
- Contrast >= 4.5:1 for text, >= 3:1 for UI components.
- All inputs labelled; dialogs titled; images/icons have text alternatives or `aria-hidden`.
- Status never communicated by color alone.
- Logical heading order, one H1 per page, landmarks (`header`, `nav`, `main`).

## 10. Do not

- Cream + terracotta, black + neon, or generic gradient-card dashboards.
- Identical rounded cards with the same soft shadow for everything.
- ALL CAPS eyebrow labels, "01 / 02 / 03" numbering, spaced-em-dash labels, arrows appended to every button.
- Stock photos or decorative illustrations.
- Showing owner details on the public page.
- More than two typefaces, or more than one accent color.

## 11. Self-check before finishing a screen

1. Can a neighbor on a phone find a tool and send a request in under 30 seconds?
2. Is the status of every request obvious without reading carefully?
3. Does the screen have loading, empty, error states?
4. Is the tag shape the only decorative choice?
5. Remove one accessory: is there anything that can be deleted without loss?
