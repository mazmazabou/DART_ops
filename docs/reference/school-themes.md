# RideOps — School Brand Color Reference

> This file is the canonical color reference for all supported campuses.
> Use it when building out pills, charts, calendars, schedule grids, and any
> other UI that can pull from the extended school palette beyond primary + secondary.
>
> **Rule:** If a school has enough secondary/tertiary colors, use them for UI accents
> (status pills, bar chart fills, schedule grid columns, etc.). If not, fall back to
> the RideOps platform defaults.

---

## RideOps Platform Defaults

Used when no campus is selected, or for the base platform branding.

| Role       | Color          | Hex       |
|------------|----------------|-----------|
| Primary    | Steel Blue     | `#4682B4` |
| Primary Dark | —            | `#36648B` |
| Primary Light | —           | `#B0C4DE` |
| Secondary  | Tan            | `#D2B48C` |
| Secondary Text (on secondary bg) | Dark Tan | `#4B3A2A` |

---

## USC — University of Southern California

**Program:** DART (Disabled Access to Road Transportation)

### Primary Colors (equal weight, both required)

| Name       | PMS       | HEX       | RGB             | CMYK             |
|------------|-----------|-----------|-----------------|------------------|
| Cardinal   | 201 C     | `#990000` | 153, 27, 30     | 7 / 100 / 65 / 32 |
| Gold       | 123 C     | `#FFCC00` | 255, 204, 0     | 0 / 27 / 100 / 0 |

**Theming:**
- Primary → `#990000` Cardinal
- Secondary → `#FFCC00` Gold
- Text ON secondary bg → `#990000` Cardinal
- Sidebar bg → `#1A0000`

### Secondary Colors

| Name        | HEX       | RGB             |
|-------------|-----------|-----------------|
| Black       | `#000000` | 0, 0, 0         |
| White       | `#FFFFFF` | 255, 255, 255   |
| Gray 30K    | `#CCCCCC` | 204, 204, 204   |
| Gray 70K    | `#767676` | 118, 118, 118   |

### Tertiary Colors (for UI accents — pills, charts, graph fills)

| Name         | PMS       | HEX       | RGB             |
|--------------|-----------|-----------|-----------------|
| Peach        | 474 C     | `#F2C6A7` | 242, 198, 167   |
| Pink-Red     | 709 C     | `#F26178` | 242, 97, 120    |
| Blue         | 7685 C    | `#2B5597` | 43, 85, 151     |
| Olive        | 582 C     | `#908C13` | 144, 140, 19    |
| Bright Yellow| 107 C     | `#FDE021` | 253, 224, 33    |
| Lime         | 380 C     | `#DAE343` | 218, 227, 67    |
| Orange       | 1495 C    | `#FF9015` | 255, 144, 21    |
| Red-Orange   | 179 C     | `#E43D30` | 228, 61, 48     |

### Gold Tints (for subtle backgrounds, shift bands, chart fills)

| Tint  | Approximate HEX |
|-------|-----------------|
| 75%   | `#FFD840`       |
| 50%   | `#FFE580`       |
| 25%   | `#FFF2BF`       |

> Cardinal tints are **not permitted** per USC brand guidelines.
> Gold shades are **not permitted** per USC brand guidelines.

### Approved Color Combinations (for reference)

| Background | Text / Icon | Approved? |
|------------|-------------|-----------|
| White      | Cardinal    | ✅        |
| Cardinal   | Gold        | ✅        |
| Gold       | Cardinal    | ✅        |
| Black      | Gold        | ✅        |
| White      | Gold        | ❌ not ADA compliant |
| Cardinal   | Black       | ❌        |
| Gold       | White       | ❌        |
| Black      | Cardinal    | ❌        |

---

## UCLA — University of California, Los Angeles

**Program:** BruinAccess

### Primary Colors

> Blue is more dominant than gold. "A field of blue with a gold accent says UCLA."

| Name       | Pantone        | HEX       | RGB             | CMYK           |
|------------|----------------|-----------|-----------------|----------------|
| UCLA Blue  | 2383C / 3553U  | `#2774AE` | 39, 116, 174    | 83 / 40 / 3 / 6 |
| UCLA Gold  | 109C / 114U    | `#FFD100` | 255, 209, 0     | 0 / 9 / 100 / 0 |
| White      | —              | `#FFFFFF` | 255, 255, 255   | 0 / 0 / 0 / 0  |

**Theming:**
- Primary → `#2774AE` Blue
- Primary Dark → `#005587`
- Primary Light → `#8BB8E8`
- Secondary → `#FFD100` Gold
- Text ON secondary bg → `#2774AE` Blue
- Sidebar bg → `#0D1B2A`

### Secondary Colors — Blue Tones

| Name          | Pantone    | HEX       | RGB             |
|---------------|------------|-----------|-----------------|
| Darkest Blue  | 302C       | `#003B5C` | 0, 59, 92       |
| Darker Blue   | 7692C      | `#005587` | 0, 85, 135      |
| UCLA Blue     | 2383C      | `#2774AE` | 39, 116, 174    |
| Lighter Blue  | 278C       | `#8BB8E8` | 139, 184, 232   |
| Lightest Blue | 2707C      | `#DAEBFE` | 218, 235, 254   |

### Secondary Colors — Gold Tones

| Name         | Pantone | HEX       | RGB             |
|--------------|---------|-----------|-----------------|
| Darkest Gold | 1235C   | `#FFB81C` | 255, 184, 28    |
| Darker Gold  | 123C    | `#FFC72C` | 255, 199, 44    |
| UCLA Gold    | 109C    | `#FFD100` | 255, 209, 0     |

### Tertiary Colors (accent use only — graphics, not dominant)

| Name    | Pantone | HEX       | RGB             |
|---------|---------|-----------|-----------------|
| Yellow  | 803C    | `#FFFF00` | 255, 255, 0     |
| Green   | 802C    | `#00FF87` | 0, 255, 135     |
| Magenta | 806C    | `#FF00A5` | 255, 0, 165     |
| Cyan    | 801C    | `#00FFFF` | 0, 255, 255     |
| Purple  | 814C    | `#8237FF` | 130, 55, 255    |
| Black   | Black C | `#000000` | 0, 0, 0         |

### Brand Gradient (background use)

`#005587` (Darker Blue) → `#2774AE` (UCLA Blue) → `#8BB8E8` (Lighter Blue)

### UI Notes

UCLA has a rich blue tone range — use the **blue tones** for schedule grid columns,
chart fills, and multi-value bar charts. Use **gold tones** for highlights, active states,
and accents. Tertiary colors are graphic-only; don't use them for functional UI.

---

## Stanford University

**Program:** ATS (Accessible Transportation Service)

### Primary Colors

| Name        | PMS            | HEX       | RGB            | CMYK              |
|-------------|----------------|-----------|----------------|-------------------|
| Cardinal Red | 201 C / 201 U | `#8C1515` | 140, 21, 21    | 0 / 100 / 65 / 34 |
| Cardinal Light | —           | `#B83A4B` | —              | —                 |
| Cardinal Dark  | —           | `#820000` | —              | —                 |
| White       | —              | `#FFFFFF` | 255, 255, 255  | —                 |
| Black       | Process Black  | `#2E2D29` | 46, 45, 41     | 0 / 0 / 0 / 100   |
| Cool Grey   | Cool Grey 11 C | `#53565A` | 83, 86, 90     | 63 / 52 / 44 / 33 |

**Theming:**
- Primary → `#8C1515` Cardinal Red
- Primary Light → `#B83A4B`
- Primary Dark → `#820000`
- Secondary → `#53565A` Cool Grey (Stanford's official second color)
- Text ON secondary bg → `#FFFFFF` White (grey is dark enough)
- Sidebar bg → `#1A0505`

### Grey Scale (Black tints — for layout depth)

| Tint | HEX       |
|------|-----------|
| 100% | `#2E2D29` |
| 90%  | `#43423E` |
| 80%  | `#585754` |
| 70%  | `#6D6C69` |
| 60%  | `#767674` |
| 50%  | `#979694` |
| 40%  | `#ABABA9` |
| 30%  | `#C0C0BF` |
| 20%  | `#D5D5D4` |
| 10%  | `#EAEAEA` |

### Accent Colors (named for campus landmarks — use for pills, charts, schedule fills)

Each accent has an official light and dark variant.

| Name        | PMS      | HEX (base) | Light     | Dark      | RGB             |
|-------------|----------|------------|-----------|-----------|-----------------|
| Palo Alto   | 3298 C   | `#175E54`  | `#2D716F` | `#014240` | 23, 94, 84      |
| Palo Verde  | 7473 C   | `#279989`  | `#59B3A9` | `#017E7C` | 39, 153, 137    |
| Olive       | 7495 C   | `#8F993E`  | `#A6B168` | `#7A863B` | 143, 153, 62    |
| Bay         | 556 C    | `#6FA287`  | `#8AB8A7` | `#417865` | 111, 162, 135   |
| Sky         | 7459 C   | `#4298B5`  | `#67AFD2` | `#016895` | 66, 152, 181    |
| Lagunita    | 3145 C   | `#007C92`  | `#009AB4` | `#006B81` | 0, 124, 146     |
| Poppy       | 144 C    | `#E98300`  | `#F9A44A` | `#D1660F` | 233, 131, 0     |
| Spirited    | 7417 C   | `#E04F39`  | `#F4795B` | `#C74632` | 224, 79, 57     |
| Illuminating| 129 C    | `#FEDD5C`  | `#FFE781` | `#FEC51D` | 254, 221, 92    |
| Plum        | 260 C    | `#620059`  | `#734675` | `#350D36` | 98, 0, 89       |
| Brick       | 7421 C   | `#651C32`  | `#7F2D48` | `#42081B` | 101, 28, 50     |
| Archway     | 7519 C   | `#5D4B3C`  | `#766253` | `#2F2424` | 93, 75, 60      |
| Stone       | 403 C    | `#7F7776`  | `#D4D1D1` | `#544948` | 127, 119, 118   |
| Fog         | 7527 C   | `#DAD7CB`  | `#F4F4F4` | `#B6B1A9` | 218, 215, 203   |

### Web / Digital Interactive Colors

These are Stanford's official digital-only colors for interactive UI elements.
**Digital red ≠ Cardinal red** — never use for wordmarks/logos.

| Name          | HEX (base) | Light      | Dark       | Use case                          |
|---------------|------------|------------|------------|-----------------------------------|
| Digital Red   | `#B1040E`  | `#E50808`  | `#820000`  | Buttons, hover states, alerts     |
| Digital Blue  | `#006CB8`  | `#6FC3FF`  | `#00548F`  | Links on light bg; not decorative |
| Digital Green | `#008566`  | `#1AECBA`  | `#006F54`  | Form validation, success states   |

### UI Notes

Stanford's palette is more versatile than it first appears. The **landmark accent colors**
(Palo Alto, Sky, Lagunita, Poppy, etc.) are ideal for schedule grid columns, bar chart fills,
and status pill variety — they're earthy and muted enough to feel on-brand without screaming.

**Recommended for multi-value charts / schedule grids:**
Sky → Lagunita → Palo Verde → Palo Alto (cool blue-green progression)
Or: Poppy → Spirited → Illuminating (warm progression for attention/priority states)

**Recommended for status/pill accents beyond the standard status colors:**
- Positive / completed: Palo Verde `#279989`
- Warning / in-progress: Poppy `#E98300`
- Alert / no-show: Spirited `#E04F39`
- Neutral / muted: Stone `#7F7776`

**Digital interactive colors** can be used directly in the RideOps UI for Stanford:
- Buttons/CTAs: Digital Red `#B1040E` (lighter and more web-safe than Cardinal)
- Links: Digital Blue `#006CB8`
- Success/validation: Digital Green `#008566`

---

## UCI — University of California, Irvine

**Program:** AnteaterExpress

### Primary Colors

| Name     | PMS  | HEX       | RGB            | CMYK           |
|----------|------|-----------|----------------|----------------|
| UCI Blue | 7685 | `#255799` | 37, 87, 153    | 93 / 73 / 11 / 1 |
| UCI Gold | 116  | `#FECC07` | 254, 204, 7    | 0 / 19 / 100 / 0 |

**Theming:**
- Primary → `#255799` Blue
- Primary Light → `#5580BB`
- Primary Dark → `#1A3D70`
- Secondary → `#FECC07` Gold
- Text ON secondary bg → `#255799` Blue
- Sidebar bg → `#001A2E`

### Secondary Colors (backgrounds and design elements)

| Name          | PMS  | HEX       | RGB             |
|---------------|------|-----------|-----------------|
| Darkest Blue  | 289  | `#002244` | 0, 34, 68       |
| Dark Blue     | 654  | `#1B3D6D` | 27, 61, 109     |
| Teal Blue     | 7461 | `#0083B3` | 0, 131, 190     |
| Turquoise     | 3125 | `#00B0CA` | 0, 176, 202     |
| Orange        | 715  | `#F78D2D` | 247, 141, 45    |
| Gold (deeper) | 130  | `#F0AB00` | 240, 171, 0     |
| Dark Gray     | 425  | `#555759` | 85, 87, 89      |
| Light Gray    | 400  | `#C6BEB5` | 197, 190, 181   |

### Accent Colors (sparingly — always paired with primary or secondary)

| Name          | PMS  | HEX       | RGB             |
|---------------|------|-----------|-----------------|
| Athletics Gold| 123  | `#F8CF56` | 248, 207, 86    |
| Light Yellow  | 100  | `#F7EB5F` | 247, 235, 95    |
| Green         | 362  | `#3F9C35` | 63, 165, 53     |
| Lime Green    | 376  | `#7AB800` | 122, 184, 0     |
| Royal Blue    | 285  | `#00639E` | 0, 114, 206 (note: use `#0072CE` actual PMS 285) |
| Light Blue    | 549  | `#6AA2B8` | 106, 162, 184   |
| Bright Purple | 2602 | `#7C109A` | 124, 16, 154    |
| Magenta       | 674  | `#D462AD` | 212, 98, 173    |

### UI Notes

UCI has the **richest palette** of the four schools. Use it fully:
- **Schedule grid columns:** rotate through Teal Blue, Turquoise, Dark Blue for multi-driver views
- **Chart fills:** Blue → Teal → Turquoise → Orange progression works well for bar charts
- **Status pills beyond the standard set:** use Deep Gold, Teal, or Orange for non-status categorical data
- **Accent colors:** use Green/Lime for positive metrics, Purple/Magenta for notable outliers — sparingly

---

## Summary Table — Core Theming Values

| Campus   | Primary    | Primary Dark | Primary Light | Secondary  | Text on Secondary |
|----------|------------|--------------|---------------|------------|-------------------|
| RideOps  | `#4682B4`  | `#36648B`    | `#B0C4DE`     | `#D2B48C`  | `#4B3A2A`         |
| USC      | `#990000`  | `#740000`    | `#B83A4B`     | `#FFCC00`  | `#990000`         |
| Stanford | `#8C1515`  | `#820000`    | `#B83A4B`     | `#53565A`  | `#FFFFFF`         |
| UCLA     | `#2774AE`  | `#005587`    | `#8BB8E8`     | `#FFD100`  | `#2774AE`         |
| UCI      | `#255799`  | `#1A3D70`    | `#5580BB`     | `#FECC07`  | `#255799`         |

---

## Extended Palette Availability by School

| Feature                         | USC | UCLA | Stanford | UCI |
|---------------------------------|-----|------|----------|-----|
| Has official secondary palette  | ✅  | ✅   | ✅ (greys) | ✅ |
| Has tertiary accent colors      | ✅  | ✅   | ✅ (14 named) | ✅ |
| Rich enough for chart rotations | ✅  | ✅   | ✅         | ✅  |
| Has blue tone gradient          | ❌  | ✅   | ❌        | ✅  |
| Has gold tone range             | ✅ (tints) | ✅ | ❌   | ✅  |

**Stanford note:** Despite a minimal primary palette (cardinal + grey), Stanford has 14 named
accent colors (Palo Alto, Sky, Lagunita, Poppy, etc.) that work well for multi-color data viz.
Use the **cool blue-green progression** (Sky → Lagunita → Palo Verde → Palo Alto) for schedule
grids and charts. Use **Digital Red** (`#B1040E`) for interactive UI elements — it's Stanford's
official web button color and more accessible than Cardinal at small sizes.
