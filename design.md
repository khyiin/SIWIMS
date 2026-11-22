# DESIGN.md

## Student Internship and Work Immersion Management System

This document defines the visual direction, design principles, color
system, typography, components, and interface patterns for the Student
Internship and Work Immersion Management System.

The visual reference is a premium preparatory-school website. The system
should adapt its polished academic identity into a practical,
accessible, and easy-to-use management dashboard.

------------------------------------------------------------------------

## 1. Design Direction

**Design concept:** Premium Academic / Modern Institutional

**Overall feel:** - Professional, credible, and organized. - Elegant
without looking overly decorative. - Modern and minimal, with a subtle
traditional academic character. - Calm and easy to navigate during
everyday administrative tasks. - Consistent across student, coordinator,
school administrator, and partner-company views.

**Visual keywords:** Academic, refined, structured, trustworthy,
spacious, formal, welcoming.

Use deep navy as the primary identity color, warm muted gold for
emphasis, and white or very light neutral backgrounds for clarity.

Do not reproduce the reference website's marketing-heavy hero layout
inside the management system. Prioritize dashboards, tables, forms,
status indicators, and clear task flows.

------------------------------------------------------------------------

## 2. Color Palette

The values below are estimated from the supplied screenshot and adapted
into a usable interface palette.

  -----------------------------------------------------------------------
  Role              Color             Hex               Usage
  ----------------- ----------------- ----------------- -----------------
  Primary Navy      Deep Navy         `#011C37`         Sidebar, top
                                                        navigation,
                                                        primary identity,
                                                        headings

  Secondary Navy    Midnight Blue     `#102F4D`         Hover states,
                                                        secondary
                                                        navigation, dark
                                                        panels

  Accent Gold       Warm Gold         `#AA8439`         Primary
                                                        highlights, key
                                                        actions, active
                                                        details

  Light Gold        Pale Gold         `#D6C18E`         Subtle accents,
                                                        icons, borders,
                                                        decorative
                                                        details

  Main Background   Soft White        `#FEFEFE`         Main page
                                                        background

  Surface           White             `#FFFFFF`         Cards, forms,
                                                        tables, modal
                                                        backgrounds

  Soft Neutral      Warm Light Gray   `#F5F5F3`         Secondary
                                                        sections, table
                                                        headers, input
                                                        backgrounds

  Border            Light Gray        `#E7E7E4`         Dividers, card
                                                        borders, input
                                                        outlines

  Main Text         Charcoal          `#252B32`         Body text and
                                                        important content

  Muted Text        Slate Gray        `#68727D`         Labels, helper
                                                        text, timestamps
  -----------------------------------------------------------------------

### Color usage rules

-   Navy should establish the system's identity and visual structure.
-   Gold should be used selectively for primary actions, active
    navigation, important highlights, and small accents.
-   Use white as the dominant surface color to keep screens clean.
-   Use light gray to separate sections without creating heavy visual
    blocks.
-   Do not use gold for long paragraphs or large areas of body text.
-   Maintain readable contrast between text and backgrounds.

### Semantic status colors

Status colors are functional and should remain visually distinct from
the navy-and-gold brand palette.

  -----------------------------------------------------------------------
  Status                  Suggested color         Usage
  ----------------------- ----------------------- -----------------------
  Approved / Completed    `#27845A`               Successful applications
                                                  and completed
                                                  requirements

  Pending / For Review    `#C28A28`               Items waiting for
                                                  action

  Rejected / Declined     `#C34D4D`               Rejected applications
                                                  or requests

  In Progress             `#3976A8`               Ongoing internship or
                                                  work immersion

  Inactive / Disabled     `#858B91`               Inactive records and
                                                  unavailable items
  -----------------------------------------------------------------------

Use soft tinted backgrounds behind status labels rather than filling
large areas with strong colors.

------------------------------------------------------------------------

## 3. Typography

The reference combines elegant serif headings with clean sans-serif
interface text. Preserve this contrast.

### Recommended font pairing

  -----------------------------------------------------------------------
  Type                    Recommended font        Usage
  ----------------------- ----------------------- -----------------------
  Display / Page headings `Playfair Display`      Landing-page titles and
                                                  major page headings

  Interface / Body        `Inter`                 Navigation, forms,
                                                  tables, labels,
                                                  buttons, and paragraphs

  Optional alternative    `Lora`                  A softer academic serif
                                                  alternative for
                                                  headings
  -----------------------------------------------------------------------

**Recommended default:** Playfair Display + Inter.

If external fonts are unavailable, use Georgia for serif headings and
Arial or a system sans-serif for interface text.

### Type scale

  Element             Suggested size Weight
  ----------------- ---------------- --------
  Main page title           30--36px 600
  Section heading           22--26px 600
  Card heading              16--18px 600
  Body text                 14--16px 400
  Navigation                13--14px 500
  Form label                13--14px 600
  Helper text               12--13px 400
  Table content             13--14px 400
  Small metadata            11--12px 400

### Typography rules

-   Use serif typography sparingly for important headings.
-   Use sans-serif typography for almost every interactive element.
-   Keep headings clear and concise.
-   Avoid using too many font weights or font sizes on one screen.
-   Use consistent line height and spacing for readability.

------------------------------------------------------------------------

## 4. Layout and Structure

### General layout

Use a clean dashboard structure with:

1.  **Sidebar:** Main navigation and role-specific menu items.
2.  **Top bar:** Page context, notifications, account menu, and user
    profile.
3.  **Main content:** Page title, short description, primary action, and
    page content.
4.  **Content sections:** Cards, tables, forms, progress indicators, and
    activity lists.

### Sidebar

-   Use deep navy as the sidebar background.
-   Use white or muted light text for navigation labels.
-   Use simple line icons.
-   Highlight the active page with a muted gold accent or a subtle
    gold-tinted background.
-   Keep menu spacing consistent.
-   Separate navigation groups using small, understated labels.
-   Place the system logo and name at the top.

### Top navigation bar

-   Use a white background.
-   Add a subtle bottom border.
-   Show the current page or breadcrumb on the left when appropriate.
-   Place notifications and the account menu on the right.
-   Avoid unnecessary decorative elements.

### Main content area

-   Use a soft white or very light gray background.
-   Keep a consistent content width and alignment.
-   Start each page with a clear title and supporting description.
-   Place primary actions near the page heading.
-   Use consistent spacing between sections.
-   Allow tables and forms to use the available width without feeling
    crowded.

### Spacing system

Use a consistent spacing scale:

`4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px`

-   8--12px for compact internal spacing.
-   16px for form fields and small component gaps.
-   24px for card padding and content groups.
-   32--48px between major sections.

------------------------------------------------------------------------

## 5. Components and UI Styling

### Cards

-   White background.
-   Thin light-gray border.
-   Small to medium corner radius (8--12px).
-   Very subtle shadow only when elevation is needed.
-   Consistent internal padding (20--24px).
-   Clear heading, supporting information, and optional action.

Avoid excessive shadows, gradients, and decorative borders.

### Buttons

**Primary button** - Deep navy background. - White text. - Gold may be
used for a particularly important primary action. - Medium corner
radius. - Clear hover and disabled states.

**Secondary button** - White background. - Navy text and border. -
Subtle hover background.

**Text / tertiary button** - No filled background. - Navy or muted
text. - Used for secondary actions such as View Details.

Button labels should use clear action words, such as "Submit
Application", "Review Student", and "Save Changes".

### Forms and inputs

-   White or very light neutral background.
-   Light-gray border.
-   Dark readable text.
-   Consistent field height and spacing.
-   Clear labels above each field.
-   Visible focus state using navy or gold.
-   Helpful validation messages below the relevant field.

Do not rely on placeholder text as the only field label.

### Tables

-   White background with subtle borders.
-   Light neutral table header.
-   Clear column labels.
-   Consistent row height and alignment.
-   Use restrained hover highlighting.
-   Keep action buttons compact.
-   Use status badges for application and internship states.

Tables should prioritize readability and information scanning over
decoration.

### Status badges

Use small rounded labels with a soft tinted background.

Examples: - Pending - Approved - Rejected - In Progress - Completed

Keep badge text short and consistent.

### Icons

-   Prefer simple outline icons.
-   Use one consistent icon family throughout the application.
-   Use navy, slate gray, or muted gold.
-   Avoid mixing filled, outlined, and highly decorative icon styles.

### Modals and dialogs

-   White surface.
-   Clear title and description.
-   Subtle shadow.
-   Consistent spacing.
-   Obvious primary and secondary actions.
-   Use confirmation dialogs for important actions such as approval,
    rejection, and record deletion.

------------------------------------------------------------------------

## 6. Dashboard Design

Dashboards should show useful information immediately without
overwhelming the user.

### Summary cards

Use compact cards for key counts, such as: - Total Students - Pending
Applications - Active Internships - Completed Internships - Partner
Companies

Each card should contain: - A short label. - A prominent number. - An
optional small icon. - Optional comparison or supporting text when
meaningful.

Use navy for important numbers and gold as a restrained accent.

### Charts and progress

-   Keep charts simple and readable.
-   Use navy as the main chart color.
-   Use gold to highlight a second series or important data point.
-   Use semantic colors only when they communicate a real status.
-   Always provide labels or legends where needed.

### Activity and task lists

Use compact rows with a clear activity title, supporting details, date,
and status where relevant.

Prioritize pending tasks and items that require user action.

------------------------------------------------------------------------

## 7. Role-Based Interface Consistency

All user roles should share the same design system. Only the available
navigation, data, and actions should change according to permissions.

Possible roles include:

-   **Student:** Profile, internship or immersion application,
    requirements, placement details, progress, and announcements.
-   **Company / Partner:** Student applications, assigned students,
    placement information, and evaluation tasks.
-   **Coordinator:** Student records, applications, placements,
    monitoring, requirements, and evaluations.
-   **Administrator:** User accounts, system settings, records, and
    access management.

Do not create a completely different visual style for each role.
Consistency helps users understand the system regardless of their
account type.

------------------------------------------------------------------------

## 8. Interaction and User Experience

-   Make the active navigation item easy to identify.
-   Provide clear feedback after saving, submitting, approving, or
    rejecting an action.
-   Show loading, empty, error, and success states.
-   Use confirmation prompts before destructive or important actions.
-   Keep forms organized into logical sections.
-   Avoid unnecessary steps when completing common tasks.
-   Make important deadlines and pending requirements easy to notice.
-   Use responsive layouts for desktop, tablet, and mobile screens.
-   Ensure keyboard focus is visible and controls have accessible
    labels.

------------------------------------------------------------------------

## 9. Visual Do's and Don'ts

### Do

-   Use navy, gold, and white as the main identity.
-   Maintain generous whitespace.
-   Use serif headings with sans-serif interface text.
-   Keep cards and tables structured.
-   Use consistent spacing and alignment.
-   Apply gold accents carefully.
-   Make important information easy to scan.
-   Keep role-based screens visually consistent.

### Don't

-   Do not use too many accent colors.
-   Do not use gold as the background for every button or card.
-   Do not add heavy shadows to every component.
-   Do not use decorative serif fonts for tables and forms.
-   Do not overcrowd dashboards with unnecessary charts.
-   Do not use large promotional hero sections inside operational
    dashboards.
-   Do not make status depend on color alone; include readable status
    text.
-   Do not mix different border radii, icon styles, and spacing patterns
    without a reason.

------------------------------------------------------------------------

## 10. Suggested Design Tokens

Use these tokens as the starting point for CSS variables or a frontend
theme configuration.

``` css
:root {
  /* Brand */
  --color-primary: #011C37;
  --color-primary-hover: #102F4D;
  --color-accent: #AA8439;
  --color-accent-light: #D6C18E;

  /* Backgrounds and surfaces */
  --color-background: #FEFEFE;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F5F5F3;

  /* Text */
  --color-text: #252B32;
  --color-text-muted: #68727D;

  /* Borders */
  --color-border: #E7E7E4;

  /* Status */
  --color-success: #27845A;
  --color-warning: #C28A28;
  --color-danger: #C34D4D;
  --color-info: #3976A8;
  --color-inactive: #858B91;

  /* Typography */
  --font-heading: "Playfair Display", Georgia, serif;
  --font-body: "Inter", Arial, sans-serif;

  /* Shape */
  --radius-small: 6px;
  --radius-medium: 10px;
  --radius-large: 12px;

  /* Elevation */
  --shadow-card: 0 2px 10px rgba(1, 28, 55, 0.05);
}
```

------------------------------------------------------------------------

## 11. Final Design Principle

The Student Internship and Work Immersion Management System should look
like a professional academic institution: trustworthy, refined, and
organized.

The reference website's identity should be reflected through its deep
navy foundation, warm gold accents, elegant serif headings, clean
sans-serif interface, generous whitespace, and balanced layouts.

However, functionality comes first. Every design choice should help
students, coordinators, partner companies, and administrators understand
information and complete their tasks efficiently.

**Design in one sentence:** A refined academic interface with a
navy-and-gold identity, elegant typography, and a clean, structured
dashboard experience.