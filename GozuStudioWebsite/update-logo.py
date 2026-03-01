#!/usr/bin/env python3
"""
Logo Update Script
==================
This script updates the logo across ALL locations:

1. HEADER LOGO (inline SVG)
   - Updates all HTML files with inline SVG
   - Updates JS bundle with SVG content and element count
   - Updates S2 viewBox object
   
2. LOADING SCREEN
   - Updates the animated icon with your logo
   - Updates the text (configurable)
   - Sets colors (#d4bc90 for icon, white for reveal layer)

Usage:
    1. Edit the logo in: static/images/gozustudio-logo.svg
       (use "currentColor" for fill/stroke for hover effects)
    2. Run this script: python3 update-logo.py
    3. Hard refresh browser (Cmd+Shift+R)
    4. Done!

Configuration:
    - LOADING_TEXT: The text shown during loading
    - ICON_COLOR: Main icon color (default #d4bc90)
    - Edit these at the top of the script if needed
"""

import os
import re
import glob

# =============================================================================
# CONFIGURATION
# =============================================================================

# Text shown during loading animation
LOADING_TEXT = "Here Is Where The Dream Begins"

# Loading icon color (main layer)
ICON_COLOR = "#d4bc90"

# Loading icon reveal layer color (for animation contrast)
REVEAL_COLOR = "#ffffff"

# File paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_SOURCE = os.path.join(SCRIPT_DIR, "static/images/gozustudio-logo.svg")
HTML_DIR = SCRIPT_DIR
NUXT_DIR = os.path.join(SCRIPT_DIR, "_nuxt")
JS_FILE = os.path.join(NUXT_DIR, "D6QWonDo.js")
CSS_FILE = os.path.join(NUXT_DIR, "entry.uWI2OnLY.css")

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def read_logo_svg():
    """Read the source logo SVG file."""
    with open(LOGO_SOURCE, 'r') as f:
        svg_content = f.read().strip()
    return svg_content


def parse_svg(svg_content):
    """
    Parse SVG and extract viewBox and inner content.
    Returns (viewBox, inner_content, paths, lines, total_count)
    """
    # Extract viewBox
    viewbox_match = re.search(r'viewBox="([^"]+)"', svg_content)
    viewbox = viewbox_match.group(1) if viewbox_match else "0 0 78 52"
    
    # Extract inner content (remove svg wrapper)
    inner = re.sub(r'<svg[^>]*>', '', svg_content)
    inner = inner.replace('</svg>', '').strip()
    
    # Normalize whitespace and REMOVE spaces between elements
    inner = re.sub(r'>\s+<', '><', inner)
    inner = re.sub(r'\s+', ' ', inner).strip()
    
    # Ensure self-closing tags have explicit closing tags (Vue requirement)
    inner = re.sub(r'<(path)([^>]*)/>', r'<\1\2></\1>', inner)
    inner = re.sub(r'<(line)([^>]*)/>', r'<\1\2></\1>', inner)
    
    # Count elements
    path_count = len(re.findall(r'<path', inner))
    line_count = len(re.findall(r'<line', inner))
    total_count = path_count + line_count
    
    return viewbox, inner, path_count, line_count, total_count


def get_combined_path(svg_content):
    """
    Combine all path d attributes into one mega-path for the loading icon.
    """
    # Extract ALL path d attributes
    paths = re.findall(r'd="([^"]+)"', svg_content)
    
    # Also get line coordinates and convert to path
    lines = re.findall(r'<line[^>]*x1="([^"]+)"[^>]*y1="([^"]+)"[^>]*x2="([^"]+)"[^>]*y2="([^"]+)"', svg_content)
    
    # Combine all paths into one
    full_path = ' '.join(paths)
    
    # Add lines as path commands (M x1,y1 L x2,y2)
    for line in lines:
        x1, y1, x2, y2 = line
        full_path += f' M{x1},{y1} L{x2},{y2}'
    
    return full_path


# =============================================================================
# HEADER LOGO UPDATES
# =============================================================================

def update_header_html(viewbox, inner_content):
    """Update all HTML files with the inline SVG header logo."""
    inline_svg = f'<svg viewBox="{viewbox}" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo" data-v-5de7f57b>{inner_content}</svg>'
    
    html_files = glob.glob(os.path.join(HTML_DIR, "*.html"))
    html_files += glob.glob(os.path.join(HTML_DIR, "**/*.html"), recursive=True)
    html_files = list(set(html_files))
    
    svg_pattern = re.compile(r'<svg[^>]*class="logo"[^>]*>.*?</svg>', re.DOTALL)
    
    updated_count = 0
    for html_file in html_files:
        try:
            with open(html_file, 'r') as f:
                content = f.read()
            
            if svg_pattern.search(content):
                new_content = svg_pattern.sub(inline_svg, content)
                if new_content != content:
                    with open(html_file, 'w') as f:
                        f.write(new_content)
                    updated_count += 1
        except Exception as e:
            print(f"  ✗ Error updating {html_file}: {e}")
    
    return updated_count


def update_header_js(viewbox, inner_content, element_count):
    """Update the JS bundle with header logo SVG, viewBox, and element count."""
    if not os.path.exists(JS_FILE):
        print(f"  ✗ JS file not found: {JS_FILE}")
        return False
    
    with open(JS_FILE, 'r') as f:
        content = f.read()
    
    updated = False
    
    # 1. Update S2 viewBox object
    old_s2_pattern = re.compile(r'S2=\{viewBox:"[^"]+",fill:"none",xmlns:"[^"]+"[^}]*\}')
    new_s2 = f'S2={{viewBox:"{viewbox}",fill:"none",xmlns:"http://www.w3.org/2000/svg",preserveAspectRatio:"xMinYMin meet",class:"logo"}}'
    
    if old_s2_pattern.search(content):
        content = old_s2_pattern.sub(new_s2, content)
        print(f"  ✓ Updated S2 viewBox to {viewbox}")
        updated = True
    
    # 2. Update gh() call with the logo paths
    pattern = re.compile(r"gh\('<path[^']+',\s*(\d+)\)")
    match = pattern.search(content)
    
    if match:
        old_gh = match.group(0)
        old_count = match.group(1)
        new_gh = f"gh('{inner_content}',{element_count})"
        content = content.replace(old_gh, new_gh)
        print(f"  ✓ Header logo element count: {old_count} → {element_count}")
        updated = True
    else:
        print(f"  ✗ Could not find gh() pattern for header logo")
    
    if updated:
        with open(JS_FILE, 'w') as f:
            f.write(content)
    
    return updated


# =============================================================================
# LOADING SCREEN UPDATES
# =============================================================================

def update_loading_icon_js(inner_content, viewbox):
    """Update the JS bundle with the loading screen icon using full SVG paths."""
    if not os.path.exists(JS_FILE):
        return False
    
    with open(JS_FILE, 'r') as f:
        content = f.read()
    
    updated = False
    
    # The loading icon uses two path elements with Ae(m) for dynamic paths
    # We replace them with static paths for the gozustudio logo
    
    # Pattern: Pt("path",{d:Ae(m),fill:"var(--c-dark-green)"},null,8,Jk),Pt("path",{d:Ae(m),fill:"#ededed",mask:"url(#mask)"})
    old_pattern = r'Pt\("path",\{d:Ae\(\w\),fill:"var\(--c-dark-green\)"\},null,\d+,\w+\),Pt\("path",\{d:Ae\(\w\),fill:"#ededed",mask:"url\(#mask\)"\}'
    
    match = re.search(old_pattern, content)
    if match:
        # Create replacement with full logo paths including Z accent line
        # Convert inner_content for loading icon format
        # Extract path d values from inner_content
        path_ds = re.findall(r'd="([^"]+)"', inner_content)
        combined_d = ' '.join(path_ds)
        
        # Check for line element and add as path
        line_match = re.search(r'<line[^>]*x1="([^"]+)"[^>]*y1="([^"]+)"[^>]*x2="([^"]+)"[^>]*y2="([^"]+)"', inner_content)
        if line_match:
            x1, y1, x2, y2 = line_match.groups()
            combined_d += f' M{x1},{y1} L{x2},{y2}'
        
        # Create new paths with colors
        new_paths = f'Pt("path",{{d:"{combined_d}",fill:"{ICON_COLOR}"}},null,8,Jk),Pt("line",{{x1:"49.78",y1:".64",x2:"54.67",y2:"6.51",stroke:"{ICON_COLOR}","stroke-width":"2"}}),Pt("path",{{d:"{combined_d}",fill:"{REVEAL_COLOR}",mask:"url(#mask)"}})'
        
        content = re.sub(old_pattern, new_paths, content)
        print(f"  ✓ Loading icon updated with gozustudio logo")
        print(f"  ✓ Icon color: {ICON_COLOR}, Reveal color: {REVEAL_COLOR}")
        updated = True
    else:
        # Check if already updated (look for our color)
        if ICON_COLOR in content and 'M33.55,8.05' in content:
            print(f"  ✓ Loading icon already updated")
        else:
            print(f"  ✗ Could not find loading icon pattern")
    
    if updated:
        with open(JS_FILE, 'w') as f:
            f.write(content)
    
    return updated


def update_loading_text_js(text):
    """Update the JS bundle with the loading screen text."""
    if not os.path.exists(JS_FILE):
        return False
    
    with open(JS_FILE, 'r') as f:
        content = f.read()
    
    # Find and replace: Ss("oldtext", ...) with Ss("newtext", ...)
    old_pattern = re.compile(r'Ss\("([^"]+)",\(')
    match = old_pattern.search(content)
    
    if match:
        old_text = match.group(1)
        if old_text != text:
            content = content.replace(f'Ss("{old_text}",(', f'Ss("{text}",(')
            
            with open(JS_FILE, 'w') as f:
                f.write(content)
            
            print(f'  ✓ Loading text: "{old_text}" → "{text}"')
            return True
        else:
            print(f'  ✓ Loading text already set to "{text}"')
    else:
        print(f"  ✗ Could not find loading text pattern")
    
    return False


def update_loading_delay_js():
    """Add 1-second delay after loading animation."""
    if not os.path.exists(JS_FILE):
        return False
    
    with open(JS_FILE, 'r') as f:
        content = f.read()
    
    # Add delay if not already present
    old_anim = 'y.fromTo(u.value,{yPercent:-100},{yPercent:0,ease:"expo.out",duration:1,stagger:{each:.04,from:"end"}},"<"),y}}'
    new_anim = 'y.fromTo(u.value,{yPercent:-100},{yPercent:0,ease:"expo.out",duration:1,stagger:{each:.04,from:"end"}},"<"),y.to({},{duration:1}),y}}'
    
    if old_anim in content:
        content = content.replace(old_anim, new_anim)
        with open(JS_FILE, 'w') as f:
            f.write(content)
        print(f"  ✓ Added 1-second delay after animation")
        return True
    elif 'y.to({},{duration:1}),y}}' in content:
        print(f"  ✓ Animation delay already present")
    
    return False


def update_css_colors():
    """Update CSS with loading screen colors."""
    if not os.path.exists(CSS_FILE):
        return False
    
    with open(CSS_FILE, 'r') as f:
        content = f.read()
    
    updated = False
    
    # Update line-height for text descenders (g, y, etc.)
    if 'line-height:.78' in content:
        content = content.replace('line-height:.78', 'line-height:1.08')
        print(f"  ✓ Updated line-height to 1.08 for descenders")
        updated = True
    
    # Add color to .animated-logo
    if f'color:{ICON_COLOR}' not in content:
        if '.animated-logo[data-v-b5fe9da5]{' in content:
            content = content.replace(
                '.animated-logo[data-v-b5fe9da5]{',
                f'.animated-logo[data-v-b5fe9da5]{{color:{ICON_COLOR};'
            )
            print(f"  ✓ Added color to .animated-logo")
            updated = True
    
    # Add color to .text
    text_pattern = re.search(r'\.text\[data-v-b5fe9da5\]\{[^}]+\}', content)
    if text_pattern and f'color:{ICON_COLOR}' not in text_pattern.group(0):
        old = text_pattern.group(0)
        if old.endswith('}'):
            new = old[:-1] + f';color:{ICON_COLOR}}}'
            content = content.replace(old, new)
            print(f"  ✓ Added color to .text")
            updated = True
    
    if updated:
        with open(CSS_FILE, 'w') as f:
            f.write(content)
    
    return updated


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("=" * 65)
    print("Logo Update Script")
    print("=" * 65)
    print()
    
    # Check if source file exists
    if not os.path.exists(LOGO_SOURCE):
        print(f"❌ Error: Logo source file not found!")
        print(f"   Expected: {LOGO_SOURCE}")
        return 1
    
    print(f"📁 Source: static/images/gozustudio-logo.svg")
    print(f"📝 Loading text: \"{LOADING_TEXT}\"")
    print(f"🎨 Icon color: {ICON_COLOR}")
    print()
    
    # Read and parse logo
    print("Parsing logo...")
    svg_content = read_logo_svg()
    viewbox, inner, paths, lines, total = parse_svg(svg_content)
    
    print(f"  ✓ viewBox: {viewbox}")
    print(f"  ✓ Elements: {paths} paths + {lines} lines = {total} total")
    print()
    
    # =========================================================================
    # UPDATE HEADER LOGO
    # =========================================================================
    print("─" * 65)
    print("HEADER LOGO")
    print("─" * 65)
    
    print("Updating HTML files...")
    html_count = update_header_html(viewbox, inner)
    print(f"  ✓ {html_count} HTML files updated")
    
    print("Updating JS bundle (header)...")
    update_header_js(viewbox, inner, total)
    print()
    
    # =========================================================================
    # UPDATE LOADING SCREEN
    # =========================================================================
    print("─" * 65)
    print("LOADING SCREEN")
    print("─" * 65)
    
    print("Updating loading icon...")
    update_loading_icon_js(inner, viewbox)
    
    print("Updating loading text...")
    update_loading_text_js(LOADING_TEXT)
    
    print("Updating animation timing...")
    update_loading_delay_js()
    
    print("Updating CSS colors...")
    update_css_colors()
    print()
    
    # =========================================================================
    # SUMMARY
    # =========================================================================
    print("=" * 65)
    print("✅ Logo update complete!")
    print("=" * 65)
    print()
    print(f"Updated locations:")
    print(f"  • Header logo ({total} elements)")
    print(f"  • Loading icon (gozustudio logo)")
    print(f'  • Loading text ("{LOADING_TEXT}")')
    print(f"  • Colors ({ICON_COLOR})")
    print()
    print("Hard refresh your browser (Cmd+Shift+R) to see the changes.")
    print()
    
    return 0


if __name__ == "__main__":
    exit(main())
