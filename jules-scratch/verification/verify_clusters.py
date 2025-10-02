import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the index.html file
    file_path = "file://" + os.path.abspath("index.html")

    # Navigate to the local HTML file
    page.goto(file_path)

    # Click the "Start" button to begin the simulation
    start_button = page.locator("#start-button")
    start_button.click()

    # Wait for 3 seconds to allow lines to be drawn and clusters to form
    page.wait_for_timeout(3000)

    # Pause the simulation to get a stable screenshot
    pause_button = page.locator("#pause-button")
    pause_button.click()

    # Take a screenshot for visual confirmation
    screenshot_path = "jules-scratch/verification/verification.png"
    page.screenshot(path=screenshot_path)

    browser.close()
    print(f"Screenshot saved to {screenshot_path}")

with sync_playwright() as playwright:
    run_verification(playwright)