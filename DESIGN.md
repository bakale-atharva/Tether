---
name: Tether
description: Floating charcoal social panels with a porcelain light translation.
colors:
  "bg": "#e9eaed"
  "surface": "#fbfbfc"
  "surface-2": "#eeeff1"
  "panel-highlight": "#ffffff"
  "panel-low": "#f4f4f6"
  "backdrop-highlight": "#d2d4d9"
  "backdrop-low": "#f7f8fa"
  "ink": "#242527"
  "muted": "#5b5e63"
  "border": "#d5d6da"
  "border-strong": "#85888e"
  "accent": "#28292c"
  "accent-hover": "#414247"
  "accent-fg": "#fbfbfc"
  "accent-text": "#195caf"
  "accent-soft": "#e1edfc"
  "danger": "#b02536"
  "danger-fg": "#fbfbfc"
  "danger-soft": "#fbe9ed"
  "success": "#216c49"
  "dark-bg": "#101112"
  "dark-surface": "#272727"
  "dark-surface-2": "#343434"
  "dark-panel-highlight": "#303030"
  "dark-panel-low": "#232323"
  "dark-backdrop-highlight": "#303133"
  "dark-backdrop-low": "#08090a"
  "dark-ink": "#f5f5f3"
  "dark-muted": "#b6b6b3"
  "dark-border": "#454545"
  "dark-border-strong": "#888885"
  "dark-accent": "#f4f4f2"
  "dark-accent-hover": "#dededb"
  "dark-accent-fg": "#202120"
  "dark-accent-text": "#79baff"
  "dark-accent-soft": "#283c51"
  "dark-danger": "#ffb0b0"
  "dark-danger-fg": "#38171d"
  "dark-danger-soft": "#482b2e"
  "dark-success": "#94d5b2"
typography:
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline-wide:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "28px"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  control:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "20px"
  metadata:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "16px"
rounded:
  "inner": "1rem"
  "panel-mobile": "1.25rem"
  "panel-desktop": "2rem"
  "pill": "9999px"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "32": "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.pill}"
    typography: "{typography.control}"
    height: "44px"
    padding: "0 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.danger-fg}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  field:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 16px"
  navigation-active:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 12px"
  plan-badge:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 12px"
  shell-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel-mobile}"
  feed-tab:
    textColor: "{colors.ink}"
    height: "56px"
    padding: "16px 8px"
---

# Design System: Tether

## Overview

**Creative North Star: "Floating charcoal panels"**

Familiar social conversations inside spacious floating panels. The near-black sculpted canvas and graduated opaque charcoal support ordinary reading and sharing; the light theme translates that material into cool gray and porcelain.

Softly highlighted edges, circular portraits, white primary pills in dark mode and restrained blue links establish the approved world. Use the existing content and states, with spacious imagery when a user supplies it. The system sans is an explicit owner-approved choice for this reference-led interface.

**Key Characteristics:**
- Opaque graduated panels over a static CSS sculpted backdrop.
- Neutral charcoal and porcelain materials; blue for links and focus.
- Broad outer corners, pill controls, circular avatars and quiet separators.
- Three desktop panels that simplify to an icon rail and then mobile tabs.

## Colors

The frontmatter records exact source values: unprefixed roles are the light defaults and `dark-` roles are their dark counterparts. Runtime semantic CSS variables select the active theme; do not bind new components directly to the light defaults.

### Primary

The neutral `accent` / `accent-fg` pair makes primary actions charcoal on porcelain in light mode and white on charcoal in dark mode. `accent-hover` provides the existing hover step. `accent-text` is the blue link, active-tab, focus, caret and native-control accent; `accent-soft` supports selection and initials. These are distinct jobs, not interchangeable button palettes.

### Neutral

`bg` is the exposed sculpted ground. `surface` is the opaque panel base and `surface-2` defines fields, active navigation and inner groups. `panel-highlight` / `panel-low` shape the panel gradient; `backdrop-highlight` / `backdrop-low` shape the independent static backdrop. `ink`, `muted`, `border` and `border-strong` organize reading, metadata, separators and stronger control outlines.

### Semantic feedback

`danger`, `danger-fg`, `danger-soft` and `success` retain error, destructive-action and success meaning in both themes. They are feedback roles, not decorative accents. The ring follows the active blue link token.

**The Neutral Action Rule.** Use the neutral accent pair for primary actions and the blue accent-text role for links, selection and focus.

## Typography

**Display and Body Font:** the system sans stack in frontmatter; `--font-display` and `--font-sans` both resolve to `--font-body`. No font download is part of this design.

### Hierarchy

- **Headline:** page and profile headings use the compact headline role, expanding to headline-wide at their observed responsive breakpoint. Page headers expand at medium; profile identity at small.
- **Title:** section headings use the title role.
- **Body:** global body follows the body role; post bodies and profile bios use relaxed leading (1.625) and a maximum measure of 70ch.
- **Control:** buttons and field labels use the control role; field values use body size.
- **Metadata:** supporting timestamps and development/plan details use small metadata or ordinary small text (14px/20px).

The sidecar records small-screen tab labels separately (11px); they are navigation captions, not a body-copy scale. Heading wrapping uses balanced or anywhere wrapping where observed, preserving long real names.

**The One Family Rule.** Keep headings, body copy and controls on the approved system sans stack; distinguish hierarchy through size, weight and spacing.

## Layout

The centered workspace has a maximum width of 1440px. At 1280px and above it uses 32px outer padding, 24px gaps and columns of 232px / minmax(0,760px) / 288px. From 1024–1279px it uses a 216px labeled navigation panel plus main content. From 768–1023px the navigation becomes a 72px icon rail. Below 768px, 8px outer gutters and top spacing surround the main panel; navigation becomes a 56px header and fixed 64px bottom tabs plus the bottom safe-area inset.

The right rail is hidden below 1280px; compact About, Join and plans information remains in the main footer. Desktop sidebars stick 32px from the top and scroll independently within calc(100dvh - 64px). Keep document scroll and the existing AI conversation-list/message-history scroll regions. Main content reserves calc(5rem + env(safe-area-inset-bottom)) below mobile content.

The reused spacing rhythm is recorded in frontmatter. Page headers use 20px padding, moving to 32px horizontal / 24px vertical at medium. Regular posts use 16px horizontal / 24px vertical padding, moving to 32px at small. Profile imagery is inset 12px, then 24px at small; the banner is 160px tall, then 200px. Profile avatars overlap by 48px, then 56px, and measure 96px, then 112px. The small breakpoint is 640px.

## Elevation & Depth

Depth combines opaque tonal layering with soft ambient shadows and a subtle inset top highlight. The panel gradient runs at 145 degrees from highlight through surface at 48% to low. Three fixed radial gradients form the sculpted background outside document flow. The exact source gradients remain in `app/globals.css`; they are CSS artwork, not an image dependency. No shipping raster was added for this world: runtime images are existing user uploads and the favicon; QA captures are evidence only.

### Shadow Vocabulary

- **Panel ambient:** light `0 18px 48px -24px rgb(36 37 39 / 0.25)`; dark `0 20px 54px -24px rgb(0 0 0 / 0.65)`.
- **Panel highlight:** `inset 0 1px 0 rgb(255 255 255 / 0.06)`, combined with the active ambient shadow.

**The Opaque Material Rule.** Panels must remain readable on their opaque base; the backdrop is independent artwork, and blur is not required.

Color transitions last 150ms; no entrance animation or moving backdrop is part of the shipped language. Reduced motion sets animation and transition duration to 0.01ms.

## Shapes

Outer panels use the panel-mobile radius (20px), increasing to panel-desktop (32px) at medium. The profile banner uses the same pair but expands at small. Inner image/group surfaces use 16–20px corners. Controls use full pills; avatars are circular. The mobile header and bottom bar retain rounded upper corners. Separators are quiet one-pixel rules; outlined secondary controls use the stronger border role.

## Components

### Buttons

Compact, neutral and legible. Primary, secondary, ghost and danger variants share full pills, semibold small text, 8px icon gaps and short color transitions. Standard buttons are 44px high with 20px horizontal padding; large is 48px with 24px padding. Small is 44px with 16px padding on mobile and 36px at medium. Explicit min-height overrides keep selected controls, including profile editing, at 44px. Disabled controls use the inner surface, muted ink and strong outline; loading retains the shared spinner.

Focus is a two-pixel blue outline with a two-pixel offset. Secondary is transparent with a strong border; ghost gains an inner-surface hover; danger retains the feedback pair and reduces background opacity on hover.

### Inputs / Fields

Pill fields are 48px high, on the inner surface with a strong one-pixel stroke and 16px horizontal inset. A visible label, optional hint and semantic error description accompany fields. Focus belongs to the wrapper, which receives the blue border and two-pixel outline; the input suppresses a duplicate outline. Error changes the border and supporting copy to danger. Disabled fields retain readable muted text. Sidebar search is its own labeled search form with a 48px input and 44px submit control.

### Navigation

Desktop items use 48px minimum height, 24px drawn icons, 12px gaps and full-pill active surfaces. Active text is semibold ink; inactive text is muted and becomes ink on hover. Tablet visually hides labels while preserving accessible names. Mobile tabs use 20px icons, 11px captions and a 48px-wide selected icon pill. Feed tabs are a separate pattern: 56px minimum height and an active blue three-pixel bottom rule, with keyboard tab behavior preserved.

### Cards / Containers

The shared shell panel carries the material, radius and ambient shadow. Feeds remain continuous, avatar-led rows with quiet separators instead of stacked standalone cards. Outlined pricing cards use 20px corners, transparent fill and no shadow inside the main panel. The outlined plan badge has a 44px mobile minimum height, reducing to 28px at medium; it is an account status/action, not invented social metadata.

### Profile imagery

The inset banner and overlapping circular portrait are the signature arrangement. Uploaded images use the actual account data. The banner fallback is a 135-degree inner-surface/soft-accent gradient. Portrait fallback uses initials on soft accent with blue ink; an outer five-pixel surface ring separates it from the banner. Existing avatar sizes remain 32px, 40px and 80px alongside the profile variant.

### Clerk surfaces

Global collision-safe aliases use `--clerk-color-*` and `--clerk-border-radius`, forwarding semantic app variables. Keep these aliases distinct from Clerk-generated/internal variable names to avoid self-referential collisions. The provider supplies the same body font. Pricing passes the aliases through supported appearance variables and keeps badge and footer-button overrides as CSS objects: hover, active, focus and disabled selectors are explicitly specified, including aria-disabled. This exception prevents vendor-state styles from obscuring the neutral primary pair or disabled text. Pricing buttons have a 44px minimum height, no background image or shadow, and retain the blue focus outline. Do not reduce these overrides to default-state utility classes.

## Do's and Don'ts

### Do:

- **Do** use the semantic CSS variables so saved and system theme preferences stay coherent.
- **Do** preserve the detached shell geometry, quiet separators and opaque panel bases.
- **Do** keep visible focus, readable disabled states, safe-area padding and mobile touch targets.
- **Do** use actual uploaded imagery or the existing initials/gradient fallback; retain supplied image alt text.
- **Do** retain the collision-safe Clerk aliases and CSS-object pricing button state overrides.

### Don't:

- **Don't** replace the static backdrop with animation or introduce blur-dependent readability.
- **Don't** add invented engagement, recommendations, verification or profile tabs to fill space.
- **Don't** multiply opaque cards inside the continuous feed panel or introduce hard offset shadows.
- **Don't** treat QA screenshots as runtime image assets or add reference photography as real account content.
