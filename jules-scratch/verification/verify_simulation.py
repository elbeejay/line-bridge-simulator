import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    """
    This script verifies that the Line Bridge Simulator starts and runs correctly.
    It now also captures console logs and page errors to help debug issues.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console messages and page errors
        console_messages = []
        page_errors = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))

        try:
            # Get the absolute path to index.html
            file_path = os.path.abspath("index.html")

            # 1. Navigate to the local index.html file.
            page.goto(f"file://{file_path}")

            # 2. Expect the main heading to be visible.
            expect(page.get_by_role("heading", name="Line Bridge Simulator")).to_be_visible()

            # 3. Click the "Start" button to begin the simulation.
            start_button = page.locator("#start-button")
            start_button.click()

            # 4. Wait for a moment to let lines be drawn.
            line_count_display = page.locator("#line-count")
            expect(line_count_display).not_to_have_text("0", timeout=5000)

            # 5. Take a screenshot of the running simulation.
            screenshot_path = "jules-scratch/verification/simulation-running.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"\nAn error occurred during Playwright execution: {e}")

        finally:
            # Print captured console messages
            print("\n--- Browser Console Logs ---")
            if console_messages:
                for msg in console_messages:
                    print(msg)
            else:
                print("No console messages were captured.")

            # Print captured page errors
            print("\n--- Browser Page Errors ---")
            if page_errors:
                for err in page_errors:
                    print(err)
            else:
                print("No page errors were captured.")

            browser.close()

if __name__ == "__main__":
    run_verification()