import os
import json

# Get the current directory
current_dir = os.getcwd()

# Navigate up two levels to reach the root directory
root_dir = os.path.abspath(os.path.join(current_dir, '../../'))

ignore_list = [".git", ".github", "LICENSE", "README.md"]

print("- Replacing chrome. with browser.")

# Use os.walk to iterate over all files in the directory tree
for dirpath, dirnames, filenames in os.walk(root_dir):
    # Filter out directories in the ignore list
    dirnames[:] = [d for d in dirnames if d not in ignore_list]
    
    for file in filenames:
        # Skip the files in the ignore list
        if file in ignore_list:
            continue
        
        # Check if the file has a .js extension
        if not file.endswith('.js'):
            continue
        
        file_path = os.path.join(dirpath, file)
        
        try:
            # Read the contents of each file in binary mode
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Attempt to decode the content using UTF-8
            try:
                content = content.decode('utf-8')
            except UnicodeDecodeError:
                print(f"Skipping file {file_path} due to encoding issues.")
                continue

            # Replace "chrome." with "browser."
            new_content = content.replace('chrome.', 'browser.')

            print("- Replacing Templates with sidebarActions")

            # Replace FirefoxSB with sidebarAction
            # get html needed for sidebar
            # Get content between %%FirefoxSB:popup.html%%

            # Find the start and end index of the FirefoxSB tag
            start_index = new_content.find("%%FirefoxSB:")
            while start_index != -1:
                end_index = new_content.find("%%", start_index + 1)
                if end_index == -1:
                    break
                
                # Extract the content between ':' and '%%'
                extracted_content = new_content[start_index + len("%%FirefoxSB:"):end_index]
                
                # Create the replacement string
                replacement = f"browser.sidebarAction.setPanel({{panel: '{extracted_content}'}})"

                # Replace the tag with the replacement string
                new_content = new_content[:start_index - len("//")] + replacement + new_content[end_index + len("%%"):]
                
                # Find the next start index
                start_index = new_content.find("%%FirefoxSB:", start_index + len(replacement))

                print(f"Replaced FirefoxSB with sidebarAction in {file_path}")
            
            print("- Adding sidebar handles functionality to the JS files")

            # Add listener to open sidebar
            jsfiles = ["index.js", "main.js"]

            if file in jsfiles:
                handle = """
                document.addEventListener("click", function(){
                    browser.sidebarAction.open();
                });
                """
                # Check if the handle already exists in new_content
                if handle not in new_content:
                    new_content += handle

            # Write the modified content back to the file
            with open(file_path, 'w', encoding='utf-8', newline='') as f:
                f.write(new_content)
        
        except Exception as e:
            print(f"Error processing file {file_path}: {e}")

# Fix the manifest.json file and replace service workers
manifest_path = os.path.join(root_dir, 'manifest.json')
try:
    with open(manifest_path, 'r', encoding='utf-8') as f:
        content = f.read()

        # Parse to json
        manifest = json.loads(content)

        serviceWorkers = manifest["background"]["service_worker"]
        print("- Changing service worker to background script in manifest.json")
        # Replace "chrome_url_overrides" with "browser_url_overrides"
        manifest["background"] = {
            "scripts": [serviceWorkers]
        }

        print("- Adding sidebar functionality to manifest.json")

        manifest["sidebar_action"] = {
            "default_icon": "./icons/icon.png",
            "default_title": "Costume-Client",
            "default_panel": "main.html",
            "open_at_install": False
        }

        # Write the modified content back to the file
        with open(manifest_path, 'w', encoding='utf-8', newline='') as f:
            f.write(json.dumps(manifest, indent=4))

except Exception as e:
    print(f"Error processing manifest.json: {e}")