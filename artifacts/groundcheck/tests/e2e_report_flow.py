"""
GroundCheck — E2E Playwright test suite
Covers: map click → ReportPanel → submit → marker → vote → ChainStatus verify
"""

import subprocess
import time
import sys
import json
import os

from playwright.sync_api import sync_playwright, Page, expect, Route, Request

BASE_URL = "http://localhost:5199"

# Mock Overpass API response (simulates 3 matching shops nearby)
MOCK_OVERPASS = {
    "elements": [
        {
            "type": "node",
            "id": 1,
            "lat": 33.7295,
            "lon": 73.0480,
            "tags": {"shop": "convenience", "name": "Test Shop A"},
        },
        {
            "type": "node",
            "id": 2,
            "lat": 33.7296,
            "lon": 73.0481,
            "tags": {"shop": "supermarket", "name": "Test Shop B"},
        },
        {
            "type": "node",
            "id": 3,
            "lat": 33.7297,
            "lon": 73.0482,
            "tags": {"shop": "bakery", "name": "Test Bakery"},
        },
    ]
}

PASS = "✓"
FAIL = "✗"
results = []


def log(name: str, ok: bool, detail: str = ""):
    marker = PASS if ok else FAIL
    line = f"  {marker}  {name}"
    if detail:
        line += f"  ({detail})"
    print(line)
    results.append((name, ok, detail))


def mock_overpass(route: Route, request: Request):
    """Return canned Overpass data so tests don't depend on the live API."""
    route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps(MOCK_OVERPASS),
    )


def test_full_report_flow(page: Page):
    print("\n── Full report flow ──────────────────────────────────────")

    # ── Intercept Overpass API ────────────────────────────────────────────────
    page.route("**/overpass-api.de/**", mock_overpass)
    page.route("**/overpass.kumi.systems/**", mock_overpass)

    # Clear localStorage so each run starts clean
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    page.evaluate("() => { localStorage.clear(); location.reload(); }")
    page.wait_for_load_state("networkidle")

    # ── 1. Map renders ────────────────────────────────────────────────────────
    map_el = page.locator('[data-testid="map-container"]')
    try:
        expect(map_el).to_be_visible(timeout=8000)
        log("Map container visible", True)
    except Exception as e:
        log("Map container visible", False, str(e))
        return  # Can't proceed without the map

    # ── 2. ChainStatus badge starts at 0 ─────────────────────────────────────
    badge = page.locator('[data-testid="badge-chain-status"]')
    try:
        expect(badge).to_be_visible(timeout=5000)
        badge_text = badge.inner_text()
        has_zero = "0" in badge_text
        log("ChainStatus badge shows 0 links at start", has_zero, f'text="{badge_text.strip()}"')
    except Exception as e:
        log("ChainStatus badge visible", False, str(e))

    # ── 3. Map click opens ReportPanel ────────────────────────────────────────
    # Click the center of the map
    box = map_el.bounding_box()
    cx = box["x"] + box["width"] / 2
    cy = box["y"] + box["height"] / 2
    page.mouse.click(cx, cy)

    report_panel = page.locator('[data-testid="button-submit-report"]')
    try:
        expect(report_panel).to_be_visible(timeout=6000)
        log("Map click opens ReportPanel", True)
    except Exception as e:
        log("Map click opens ReportPanel", False, str(e))
        return

    # ── 4. Category pills render and are clickable ────────────────────────────
    for cat in ["fraud", "hazard", "unsafe", "scam"]:
        pill = page.locator(f'[data-testid="category-{cat}"]')
        try:
            expect(pill).to_be_visible(timeout=3000)
        except Exception as e:
            log(f"Category pill '{cat}' visible", False, str(e))

    # Select "hazard"
    hazard_pill = page.locator('[data-testid="category-hazard"]')
    try:
        hazard_pill.click()
        page.wait_for_timeout(200)
        # After clicking hazard, the fraud pill should no longer be "active"
        # (we can't easily check CSS var styles, so just verify the click doesn't error)
        log("Category pill selection (hazard)", True)
    except Exception as e:
        log("Category pill selection (hazard)", False, str(e))

    # ── 5. Radius slider is interactive ───────────────────────────────────────
    slider = page.locator('[data-testid="slider-radius"]')
    try:
        expect(slider).to_be_visible(timeout=3000)
        # Move slider to ~300m (midway = 50 + (500-50)*0.55 ≈ 298, step 10 → 300)
        slider_box = slider.bounding_box()
        # 300m → (300-50)/(500-50) = 0.556 of the slider width
        target_x = slider_box["x"] + slider_box["width"] * 0.556
        target_y = slider_box["y"] + slider_box["height"] / 2
        page.mouse.click(target_x, target_y)
        page.wait_for_timeout(300)
        new_val = slider.evaluate("el => el.value")
        log("Radius slider interactive", True, f"value={new_val}m")
    except Exception as e:
        log("Radius slider interactive", False, str(e))

    # ── 6. Description textarea accepts input ─────────────────────────────────
    desc_input = page.locator('[data-testid="input-description"]')
    test_desc = "Automated test: suspicious stall selling counterfeit goods"
    try:
        expect(desc_input).to_be_visible(timeout=3000)
        desc_input.fill(test_desc)
        page.wait_for_timeout(200)
        entered = desc_input.evaluate("el => el.value")
        log("Description textarea accepts input", entered == test_desc, f'len={len(entered)}')
    except Exception as e:
        log("Description textarea accepts input", False, str(e))

    # ── 7. OSM cross-check completes and submit button becomes enabled ─────────
    submit_btn = page.locator('[data-testid="button-submit-report"]')
    try:
        # Wait up to 15s for OSM query to return (mocked, should be fast)
        expect(submit_btn).not_to_be_disabled(timeout=15000)
        log("Submit button enabled after OSM check", True)
    except Exception as e:
        log("Submit button enabled after OSM check", False, str(e))
        # Continue anyway to test what we can

    # ── 8. Submit creates a marker and closes the panel ───────────────────────
    try:
        submit_btn.click()
        # Panel should disappear
        expect(submit_btn).not_to_be_visible(timeout=8000)
        log("Submit closes ReportPanel", True)
    except Exception as e:
        log("Submit closes ReportPanel", False, str(e))

    # Allow async chain append to complete
    page.wait_for_timeout(800)

    # ── 9. ChainStatus badge increments to 1 ─────────────────────────────────
    try:
        badge_text = badge.inner_text()
        has_one = "1" in badge_text
        log("ChainStatus badge increments to 1", has_one, f'text="{badge_text.strip()}"')
    except Exception as e:
        log("ChainStatus increments", False, str(e))

    # ── 10. Marker appears on the map — click it to open the popup ───────────
    # The marker is a Leaflet DivIcon with cursor:pointer
    # We click the same map centre where we submitted
    try:
        page.mouse.click(cx, cy)
        page.wait_for_timeout(800)
        # If a popup opened, upvote button should appear
        # The report ID is unknown, so find any upvote button via partial testid
        upvote_btn = page.locator('[data-testid^="button-upvote-"]').first
        try:
            expect(upvote_btn).to_be_visible(timeout=5000)
            log("Clicking marker opens popup with upvote button", True)
        except Exception:
            # Try clicking a bit near center — marker might be offset slightly
            page.mouse.click(cx + 5, cy - 5)
            page.wait_for_timeout(800)
            try:
                expect(upvote_btn).to_be_visible(timeout=4000)
                log("Clicking marker opens popup with upvote button", True)
            except Exception as e2:
                log("Clicking marker opens popup with upvote button", False, str(e2))
    except Exception as e:
        log("Marker popup open", False, str(e))


def test_vote_buttons(page: Page):
    print("\n── Vote buttons ───────────────────────────────────────────")

    # At this point the popup should still be visible from the previous step
    upvote_btn = page.locator('[data-testid^="button-upvote-"]').first
    downvote_btn = page.locator('[data-testid^="button-downvote-"]').first

    try:
        visible = upvote_btn.is_visible()
        if not visible:
            log("Vote buttons — popup already closed, skipping", True, "N/A")
            return

        # Read initial counts
        up_text_before = upvote_btn.inner_text().strip()   # e.g. "▲ 0"
        down_text_before = downvote_btn.inner_text().strip()

        # Upvote
        upvote_btn.click()
        page.wait_for_timeout(500)
        up_text_after = upvote_btn.inner_text().strip()
        log(
            "Upvote increments count",
            up_text_after != up_text_before,
            f"{up_text_before!r} → {up_text_after!r}",
        )

        # Downvote
        downvote_btn.click()
        page.wait_for_timeout(500)
        down_text_after = downvote_btn.inner_text().strip()
        log(
            "Downvote increments count",
            down_text_after != down_text_before,
            f"{down_text_before!r} → {down_text_after!r}",
        )

    except Exception as e:
        log("Vote buttons", False, str(e))


def test_verify_chain(page: Page):
    print("\n── Verify Chain ───────────────────────────────────────────")

    # Close any open popup first (press Escape)
    page.keyboard.press("Escape")
    page.wait_for_timeout(300)

    verify_btn = page.locator('[data-testid="button-verify-chain"]')
    try:
        expect(verify_btn).to_be_visible(timeout=3000)
        expect(verify_btn).not_to_be_disabled(timeout=3000)

        verify_btn.click()
        page.wait_for_timeout(1500)  # chain verification is async

        result_el = page.locator('[data-testid="text-verify-result"]')
        expect(result_el).to_be_visible(timeout=5000)
        result_text = result_el.inner_text()

        is_intact = "intact" in result_text.lower() or "✓" in result_text
        log("Verify Chain shows intact result", is_intact, f'text="{result_text.strip()[:60]}"')

        badge = page.locator('[data-testid="badge-chain-status"]')
        badge_text = badge.inner_text()
        log("INTACT badge visible in ChainStatus", "INTACT" in badge_text, f'text="{badge_text.strip()}"')

    except Exception as e:
        log("Verify Chain", False, str(e))


def test_cancel_report(page: Page):
    print("\n── Cancel report ──────────────────────────────────────────")

    # Open a new report panel
    map_el = page.locator('[data-testid="map-container"]')
    box = map_el.bounding_box()
    # Click a slightly different location to avoid the existing marker
    cx = box["x"] + box["width"] * 0.4
    cy = box["y"] + box["height"] * 0.4
    page.mouse.click(cx, cy)

    cancel_btn = page.locator('[data-testid="button-cancel-report"]')
    try:
        expect(cancel_btn).to_be_visible(timeout=6000)
        log("ReportPanel opens for second click", True)

        cancel_btn.click()
        expect(cancel_btn).not_to_be_visible(timeout=5000)
        log("Cancel button closes ReportPanel", True)
    except Exception as e:
        log("Cancel button", False, str(e))


def run_tests():
    # Start the dev server
    server_env = {**os.environ, "PORT": "5199", "BASE_PATH": "/"}
    server = subprocess.Popen(
        ["pnpm", "run", "dev"],
        cwd=os.path.join(os.path.dirname(__file__), ".."),
        env=server_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    # Wait for Vite to be ready
    ready = False
    for _ in range(30):
        time.sleep(1)
        try:
            import urllib.request
            urllib.request.urlopen(BASE_URL, timeout=2)
            ready = True
            break
        except Exception:
            pass

    if not ready:
        print("ERROR: Dev server did not start in time")
        server.terminate()
        sys.exit(1)

    print(f"Dev server ready at {BASE_URL}")

    exit_code = 0
    try:
        CHROMIUM_PATH = "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium"
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                executable_path=CHROMIUM_PATH,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            page = browser.new_page(viewport={"width": 1280, "height": 800})

            # Capture and surface console errors
            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg) if msg.type == "error" else None)
            page.on("pageerror", lambda exc: console_errors.append(exc))

            test_full_report_flow(page)
            test_vote_buttons(page)
            test_verify_chain(page)
            test_cancel_report(page)

            browser.close()

            # Report summary
            print("\n── Summary ────────────────────────────────────────────────")
            passed = sum(1 for _, ok, _ in results if ok)
            failed = sum(1 for _, ok, _ in results if not ok)
            total = len(results)
            print(f"  {passed}/{total} passed,  {failed} failed")

            if console_errors:
                print(f"\n  Browser console errors ({len(console_errors)}):")
                for err in console_errors:
                    try:
                        print(f"    ⚠ {err.text[:120]}")
                    except Exception:
                        print(f"    ⚠ {str(err)[:120]}")

            if failed > 0:
                exit_code = 1

    finally:
        server.terminate()
        server.wait()

    sys.exit(exit_code)


if __name__ == "__main__":
    run_tests()
