from playwright.sync_api import sync_playwright, expect
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Get the absolute path to the index.html file
        file_path = "file://" + os.path.abspath("index.html")
        page.goto(file_path)

        # 1. Locate the dropdown
        boundary_dropdown = page.locator("#boundary-condition")

        # Scroll the element into view to ensure it's visible
        boundary_dropdown.scroll_into_view_if_needed()

        # 2. Select the 'Top to Bottom' option
        boundary_dropdown.select_option("top-to-bottom")

        # 3. Assert that the value has been updated
        expect(boundary_dropdown).to_have_value("top-to-bottom")

        # 4. Take a screenshot to visually verify the change
        screenshot_path = "jules-scratch/verification/verification.png"
        page.screenshot(path=screenshot_path)

        browser.close()
        print(f"Screenshot saved to {screenshot_path}")

if __name__ == "__main__":
    run_verification()