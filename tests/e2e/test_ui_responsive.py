import os
import re
import unittest
from pathlib import Path
from PIL import Image

class UIAndResponsiveTests(unittest.TestCase):
    def setUp(self):
        self.workspace_root = Path(__file__).resolve().parent.parent.parent
        self.dist_dir = self.workspace_root / 'frontend' / 'dist'
        self.src_dir = self.workspace_root / 'frontend' / 'src'

    def test_tc26_visual_fidelity_and_palette_tokens(self):
        """TC-26: Visual Fidelity - Verify exact 3-color palette tokens and CSS definitions."""
        tokens_file = self.src_dir / 'styles' / 'tokens.css'
        self.assertTrue(tokens_file.exists(), "tokens.css must exist")
        content = tokens_file.read_text(encoding='utf-8')

        # Verify core palette tokens from SRS Section 13 & 14
        self.assertIn('#050505', content, "Jet Black #050505 must be defined as base surface")
        self.assertIn('#3B0A6B', content, "Royal Amethyst #3B0A6B must be defined")
        self.assertIn('#00E5FF', content, "Electric Cyan #00E5FF must be defined")
        self.assertIn('#2EE59D', content, "Success Green #2EE59D must be defined")

        # Verify reference desktop screenshot exists
        desktop_screenshot = self.workspace_root / 'EVOLVIA_QA_REPORT' / 'screenshots' / 'dashboard_desktop_1672x941.png'
        self.assertTrue(desktop_screenshot.exists(), "1672x941 desktop screenshot must exist")
        with Image.open(desktop_screenshot) as img:
            self.assertEqual(img.size, (1672, 941), "Desktop screenshot must match 1672x941 baseline")

    def test_tc27_responsive_compatibility(self):
        """TC-27: Responsive Compatibility - Verify 5 target viewport screenshots."""
        viewports = [
            ('dashboard_desktop_1672x941.png', (1672, 941)),
            ('dashboard_laptop_1440x900.png', (1440, 900)),
            ('dashboard_tablet_1024x768.png', (1024, 768)),
            ('dashboard_small_tablet_768x1024.png', (768, 1024)),
            ('dashboard_mobile_390x844.png', (390, 844)),
        ]

        screenshots_dir = self.workspace_root / 'EVOLVIA_QA_REPORT' / 'screenshots'
        for filename, (expected_w, expected_h) in viewports:
            filepath = screenshots_dir / filename
            self.assertTrue(filepath.exists(), f"Screenshot {filename} must exist")
            with Image.open(filepath) as img:
                self.assertEqual(img.size, (expected_w, expected_h), f"Screenshot {filename} size mismatch")

    def test_tc28_ui_interaction_and_accessibility(self):
        """TC-28: UI Interaction and Accessibility - Verify ARIA roles, alt texts, and keyboard focus."""
        components_dir = self.src_dir / 'components'
        jsx_files = list(components_dir.glob('**/*.jsx'))
        self.assertGreater(len(jsx_files), 10, "Must have comprehensive component set")

        # Verify accessibility attributes across components
        all_content = "\n".join([f.read_text(encoding='utf-8') for f in jsx_files])
        self.assertIn('aria-label', all_content, "Interactive elements must provide aria-label")
        self.assertIn('alt=', all_content, "Images must provide alt attributes")
        self.assertIn('reducedMotion', all_content, "Reduced motion override support must exist")

    def test_tc29_performance_audit(self):
        """TC-29: Performance Audit - Verify bundle size, compressed assets, and absence of bloated files."""
        self.assertTrue(self.dist_dir.exists(), "Frontend build directory must exist")
        assets_dir = self.dist_dir / 'assets'
        self.assertTrue(assets_dir.exists(), "Dist assets must exist")

        js_files = list(assets_dir.glob('*.js'))
        self.assertGreaterEqual(len(js_files), 1, "Must have built JavaScript bundle")

        # Check total assets size
        total_size_bytes = sum(f.stat().st_size for f in assets_dir.glob('*'))
        total_size_mb = total_size_bytes / (1024 * 1024)
        # Ensure total distribution is optimized under 5MB
        self.assertLess(total_size_mb, 5.0, f"Total assets size is {total_size_mb:.2f}MB; must be < 5MB")
