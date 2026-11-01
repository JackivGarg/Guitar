---
name: Six Strings — Resonance Room
description: A cobalt instrument world with a clear, porcelain practice desk.
colors:
  cobalt: "#233db7"
  cobalt-deep: "#192e99"
  journey-action-ink: "#23358f"
  journey-action-hover: "#dce4ff"
  porcelain: "#f1f3fa"
  task-paper: "#fcfcff"
  shell: "#eef0f7"
  graphite: "#202a44"
  muted: "#53607c"
  folio-muted: "#57617b"
  line: "#d8deed"
  journey-soft: "#d5ddff"
  focus: "#6684ec"
  white: "#fff"
  midnight: "#17213b"
typography:
  display:
    fontFamily: '"Bricolage Grotesque", sans-serif'
    fontSize: "clamp(3.25rem, 5.2vw, 5.8rem)"
    fontWeight: 600
    lineHeight: 1.035
    letterSpacing: "-0.035em"
  journey-headline:
    fontFamily: '"Bricolage Grotesque", sans-serif'
    fontSize: "clamp(2.7rem, 4.45vw, 5.2rem)"
    fontWeight: 600
    lineHeight: 1.035
    letterSpacing: "-0.035em"
  folio-headline:
    fontFamily: '"Bricolage Grotesque", sans-serif'
    fontSize: "clamp(36px, 4.5vw, 60px)"
    fontWeight: 550
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  chapter-title:
    fontFamily: '"Bricolage Grotesque", sans-serif'
    fontSize: "clamp(24px, 2.2vw, 32px)"
    fontWeight: 550
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: '"Rethink Sans", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.75
  journey-body:
    fontFamily: '"Rethink Sans", sans-serif'
    fontSize: "clamp(15px, 1.15vw, 18px)"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: '"Rethink Sans", sans-serif'
    fontSize: "13px"
    fontWeight: 500
rounded:
  control: "6px"
  folio-action: "7px"
  visual: "8px"
  string-control: "10px"
  surface: "12px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  section: "28px"
  journey-edge: "clamp(28px, 5.2vw, 96px)"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 17px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-deep}"
  button-secondary:
    backgroundColor: "{colors.task-paper}"
    textColor: "{colors.cobalt}"
    rounded: "{rounded.control}"
    padding: "12px 17px"
  button-journey:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.journey-action-ink}"
    rounded: "{rounded.surface}"
    padding: "16px 21px"
  button-journey-hover:
    backgroundColor: "{colors.journey-action-hover}"
  button-foundations:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.white}"
    rounded: "{rounded.folio-action}"
    padding: "15px 19px"
  practice-note:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px"
    width: "100%"
  workspace:
    backgroundColor: "{colors.task-paper}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.surface}"
  string-control:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.porcelain}"
    rounded: "{rounded.string-control}"
    padding: "13px 12px"
  string-control-selected:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.cobalt}"
  navigation:
    typography: "{typography.label}"
    height: "80px"
---

# Design System: Six Strings — Resonance Room

## Overview

**Creative North Star: "Resonance Room"**

One acoustic guitar is the spatial centre of a saturated cobalt room. A black-finish instrument, chrome details and porcelain typography make the object tangible; close views connect strings, fretting and anchors to physical actions. The current original procedural model represents the user's Yamaha FS80C Black with an illustrative concert-cutaway silhouette. It is a teaching representation, not a manufacturer CAD asset.

The learning workspace carries the same cobalt into quieter porcelain surfaces, graphite text and compact controls. Bricolage Grotesque gives large teaching statements presence; Rethink Sans keeps instructions and repeated practice easy to scan. The contrast between the spatial entrance and the task desk is deliberate. Clear actions, restrained boundaries and useful diagrams carry the experience.

**Key Characteristics:**
- A persistent instrument world controlled by native scroll.
- Cobalt navigation and action states across pale task surfaces.
- Compact expressive headings with calm, readable instruction text.
- Motion tied to navigation, explicit sound actions and state changes.
- Direct access to practice, with still and poster alternatives to the world.

This is a code-extracted specification of the implemented redesign. Sources are `src/resonance.css`, `src/journey/guitar-journey.css`, `src/foundations/foundations.css`, their component markup and `src/world/worldSpec.ts`. Desktop and mobile whole-app visual verification remains outstanding because the browser backend was unavailable. The original exported guitar poster is an asset, not evidence of an app-screen capture.

## Colors

The palette places a black-finish instrument against cobalt, then uses pale blue-white neutrals for practical learning.

### Primary

- **Cobalt** is the full journey stage, primary task action, active navigation, selection and reference emphasis. Its deeper companion is the task-button hover state.
- **Journey Action Ink** gives the porcelain journey button a dense blue label. **Journey Action Hover** is that button's pale-blue hover fill.

### Neutral

- **Porcelain** is the journey's prominent type, selected sound controls and pale teaching inserts.
- **Task Paper** is the workspace and standard control surface. **Shell** separates it from the application background.
- **Graphite** is the primary task text. **Muted** and **Folio Muted** carry explanatory prose and supporting labels on pale surfaces.
- **Line** provides restrained separation on task surfaces. **Journey Soft** supports readable prose on the stage.
- **White** is task-button text and the practice-note field surface. **Midnight** is a dark world and selection-support tone.
- **Focus** is the general visible-focus outline. Journey controls use a porcelain outline; foundations controls use cobalt.

**The Action Continuity Rule.** Cobalt connects the immersive world to practice actions and selected states; the black instrument finish remains an object treatment.

## Typography

**Display Font:** Bricolage Grotesque, with a sans-serif fallback.
**Body Font:** Rethink Sans, with a sans-serif fallback.

Large type is compact and lightly tightened. Instructions use a more open line height, with weight and scale doing the work that decorative uppercase labels would otherwise do. Tabular figures keep chapter numbers, counts and practice time stable.

### Hierarchy

- **Display:** the journey opening; the normative fluid role is in frontmatter. At the narrow breakpoint it uses a smaller fluid scale, then a fixed narrow-screen size.
- **Journey headline:** chapter statements with the same compact rhythm as the opening.
- **Folio headline:** the foundations opening, with a lighter apparent weight than journey statements.
- **Chapter title:** foundations section headings; task-specific headings stay smaller than the immersive display.
- **Body:** standard explanations. Journey copy grows with the viewport and stays within (48ch); foundations task explanations usually stay within (65ch).
- **Label:** navigation and task controls. Supporting text varies by context; do not promote the smallest source-note sizes into the default body role.

**The Reading Rhythm Rule.** Keep instructional paragraphs open and bounded; reserve the tight display line height for short statements.

## Layout

The journey uses one sticky stage at (100svh) with native scrolling chapters layered over it. Desktop copy occupies (43%) with a maximum width of (620px), leaving room for the persistent instrument. Chapter spacing and the responsive edge token create the stage rhythm. On screens at or below (800px), the world occupies the upper region and full-width copy begins lower in each chapter; chapter heights expand to fit learning content. The opening and longer study chapters have additional height. Chapter navigation and motion controls remain explicit controls rather than scroll interception.

Task pages use a centred shell with a maximum width of (1800px). Foundations has a (1500px) page shell and a (1400px) folio; the folio starts with two columns, then a contents rail and reading column. At or below (800px), contents become a horizontal strip and the reading layout becomes one column. At or below (520px), checklist actions wrap beneath their content.

The desktop practice desk has a library, central task and instruction column. The standard columns are (205px / flexible / 295px), widening at (1500px). The desktop desk is viewport-relative with a minimum height; narrower layouts reflow rather than shrinking the teaching diagrams to thumbnails. Header navigation moves onto its own horizontally scrollable row at (760px).

The spacing entries are observed reusable values, not a claim that every existing layout follows one strict scale. Preserve generous teaching gaps and tighter grouped controls when adding a surface.

## Elevation & Depth

The world gets depth from the physical guitar, authored cameras, directional light and a continuous cobalt floor. A restrained procedural softbox environment reveals reflections on the black finish; it is captured once and does not animate. The task UI relies mainly on tonal layers and fine boundaries. A low diffuse shadow groups the practice workspace; a stronger shadow and dark backdrop identify the tools dialog. Ordinary reference tiles remain flat, including their selected state.

### Shadow Vocabulary

- **Workspace:** `0 12px 36px #1829480a` groups the large practice surface.
- **Tools dialog:** `0 25px 90px #17213b40` separates the modal tools from the workspace.

Motion follows native scroll progress between measured chapter starts. The world has no idle orbit; an explicit pluck produces a brief local response. Button and selection transitions are short. Respect both the user's pause control and reduced-motion preference; still chapter views, ordinary scrolling and the original poster fallback preserve access to learning.

**The Purposeful Motion Rule.** Move the instrument to explain a physical relationship or respond to an explicit action; keep practice controls stable.

## Shapes

Controls have gently rounded corners, with a slightly broader shape for the stage's main action and large workspace. The normative radius roles are in frontmatter. Thin borders separate controls and reading sections; foundations is primarily a sequence of ruled chapters and task rows, not a wall of enclosed cards. Chord diagrams retain their factual geometry and contact markers.

## Components

### Buttons

Task buttons use cobalt fill, white text and compact rounding. Secondary actions use Task Paper with cobalt text and a quiet blue border. The journey reverses the emphasis: a porcelain main button sits on cobalt and lifts slightly on hover. Foundations has its own compact cobalt action with a small pressed translation. Use the existing variants in their contexts; retain clear text labels, visible focus and disabled states.

### Cards / Containers

The practice workspace is a broad Task Paper container with a low shadow. Interior teaching panels use quiet pale blue surfaces. Reference tiles have thin borders and a pale blue selected state without added elevation. Foundations chapters use separators and whitespace, reserving contained panels for content that benefits from a distinct background.

### Inputs / Fields

The practice note is a white, full-width multiline field with a fine pale-blue border, compact rounding, visible caret and vertical resizing. Its label sits above the field; the placeholder is supporting text. Keep its visible focus outline. Checkboxes use cobalt accent and remain associated with their self-report labels.

### Navigation

The header uses plain text labels and a short active underline. The journey version sits on cobalt with pale text and a warm active underline; the task version sits on Task Paper with cobalt selection. On small screens the primary destinations remain in a horizontal row. Tool navigation uses contained selected tabs. Journey chapter navigation uses numbers, reveals the active chapter name and includes a visible current state.

### String controls and chord studies

Six open-string controls form a three-column grid. Each pairs a string number and pitch name with a sound action; selection reverses the fill and text. The paired chord study uses a pale insert with two readable diagrams and a short caption. Keep the source-checked anchor and release distinctions visible when translating a spatial idea into a practice diagram.

### Foundations task rows

Rows align a named action, short physical instruction, supporting metadata and practice/self-check controls. On small screens controls move below the instruction. Completion remains explicitly self-reported; visual status must not imply that a timer measured playing quality.

## Do's and Don'ts

### Do:

- **Do** carry cobalt selection and action states from the world into the practice desk.
- **Do** use compact Bricolage statements and open Rethink Sans instruction text.
- **Do** keep practice, pause motion and chapter navigation directly accessible.
- **Do** preserve readable diagrams, exact finger routes and visible keyboard focus.
- **Do** treat the Yamaha-inspired procedural instrument as an illustrative teaching model.

### Don't:

- **Don't** replace instructional hierarchy with ornamental badges or eyebrow labels.
- **Don't** turn foundations reading rows into a repeated decorative card grid.
- **Don't** add idle camera motion or require completion of the journey before practice.
- **Don't** present elapsed time or self-reported status as measured proficiency.
- **Don't** reuse legacy teal, plum or cream styling as the redesign's source of truth.
- **Don't** claim whole-app visual QA from a standalone exported guitar poster.
