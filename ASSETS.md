# EVOLVIA — Visual Asset Registry & License Documentation

This document logs all visual assets used across EVOLVIA in compliance with SRS Section 13.4 and the Master Implementation Directive.

---

## 1. Asset Specifications & Sources

| Asset ID | Asset Name | Target View | Dimension | Format | Visual Style & Description | Source & License |
|---|---|---|---|---|---|---|
| **AST-01** | `hero-moon-bg.webp` | Home Hero | 1600 × 520 | WebP / PNG | Giant purple moon, starlit sky, ancient gothic ruins, violet fog | Generated / CC0 Cyberpunk Landscape |
| **AST-02** | `hero-character.webp` | Home Hero (Right) | 900 × 700 | WebP / PNG (Alpha) | Cloaked cyberpunk warrior with glowing back crest | Generated / CC0 Sci-Fi Character |
| **AST-03** | `avatar-ashwin.webp` + 7 avatars | Profile, Leaderboard | 512 × 512 | WebP / PNG | Illustrated cyberpunk avatars with hexagonal frames | Generated / Custom Illustrated Presets |
| **AST-04** | `evo-companion.webp` | Evo AI Card & Drawer | 480 × 480 | WebP / PNG (Alpha) | Violet & cyan floating robot with glowing visor | Generated / Custom Robot Companion |
| **AST-05** | `achievement-*.svg` | Achievements | 256 × 256 | SVG / PNG | Hexagonal medals: Quest Novice (book), Streak Master (flame), Focus Adept (hourglass), etc. | Custom Vector Design System |
| **AST-06** | `questline-portal.webp` | Questline Banner | 1400 × 240 | WebP / PNG | Glowing cyan portal gateway between crumbling amethyst columns | Generated / CC0 Cyberpunk Portal |
| **AST-07** | `focus-arena-desk.webp` | Focus Arena Widget | 1200 × 700 | WebP / PNG | Dark cyberpunk study desk with headphones, lamp, and neon flora | Generated / Dimmed Study Environment |
| **AST-08** | `rank-emblem-*.svg` | Profile & Leaderboard | 256 × 256 | SVG | Progressive rank crests (Novice to Evolved Master) | Custom Vector Crest System |
| **AST-09** | `level-hexagon.svg` | Level Display | Vector | Inline SVG | Amethyst double-stroked hexagon with glowing cyan borders | Component-level SVG |
| **AST-10** | `crystal-reward.webp` | Sidebar Daily Reward | 320 × 260 | WebP / PNG (Alpha) | Glowing cluster of royal amethyst crystals with electric cyan sparks | Generated / Custom 3D Crystal Cluster |
| **AST-11** | `evolvia-logo.svg` | Sidebar, Auth, Header | Vector | SVG | Winged Electric Cyan crest with geometric shield lines | Custom Brand Emblem |
| **AST-12** | `empty-*.svg` | Empty States | 320 × 240 | SVG | Holographic line-art representations of empty quests, habits, etc. | Custom Cyberpunk Vector Glyphs |
| **AST-13** | `onboarding-*.webp` | Onboarding Flow | 640 × 480 | WebP / PNG | Narrative progression cards showing avatar selection and quest initiation | Custom Sci-Fi Illustrations |
| **AST-14** | `reward-*.webp` | Rewards & Inventory | 192 × 192 | WebP / PNG | Cosmetic frames, streak freezes, and themes | Custom Iconography |
| **AST-15** | UI Icons | Application Shell & Cards | Vector | React Components | Lucide React with cyan (`#00E5FF`) and amethyst (`#3B0A6B`) duotone styling | MIT License (Lucide) |

---

## 2. Image Optimization & Fallback Strategy
1. **Modern Formats:** All high-resolution images are compressed as optimized WebP / PNG with fallback CSS radial gradients.
2. **Performance Constraints:** Backgrounds and hero banners are kept under 250 KB with explicit `aspect-ratio` to eliminate Cumulative Layout Shift (CLS).
3. **No Stock Photo Misalignment:** Assets strictly adhere to the Jet Black (`#050505`), Royal Amethyst (`#3B0A6B`), and Electric Cyan (`#00E5FF`) palette.
4. **Clean Alpha Transparency:** Character cutouts (hero, Evo, crystal) have clean transparent backgrounds that blend seamlessly with the glassmorphism backdrop.
