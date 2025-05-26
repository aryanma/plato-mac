# Plato Meeting Scheduler for macOS

AI-powered meeting intent detection and Google Calendar integration for your Mac.

**Easily add meetings to your Google Calendar just by talking!**

---

## 🚀 Quick Start

1. **Download the latest release assets from [Releases](https://github.com/aryanma/plato-mac/releases):**
    - `plato-mac` (the main app binary)
    - `bin/terminal-notifier`
    - `vosk-model.zip`

2. **Unzip the Vosk model:**
    ```sh
    unzip vosk-model.zip -d vosk/model/
    ```
    After unzipping, your folder structure should look like:
    ```
    vosk/model/am/
    vosk/model/conf/
    vosk/model/graph/
    vosk/model/ivector/
    ```

3. **Place `terminal-notifier` in the correct location:**
    - Move `terminal-notifier` into the `bin/` directory in your project root.
    - If the `bin/` directory does not exist, create it:
      ```sh
      mkdir -p bin
      mv terminal-notifier bin/
      ```

4. **Make the binary executable:**
    ```sh
    chmod +x plato-mac
    ```

5. **Create a `.env` file in the project root with your Google credentials:**
    ```
    CLIENT_ID=your-google-client-id
    CLIENT_SECRET=your-google-client-secret
    ```

6. **Run the app:**
    ```sh
    ./plato-mac
    ```
    - On first run, your browser will open for Google login/consent. Approve access.

---

## 🟢 Step-by-Step Setup Guide

1. **Download the Files**
   ...

## 📋 Requirements

- macOS
- Python 3 (for Vosk server)
- Google Cloud OAuth credentials (for `.env`)

---

## 📝 How it Works

- Listens for meeting or event intent in your speech.
- Notifies you and lets you add events to Google Calendar with one click.
- Runs in the background—no UI required.

---

## 🛠 Troubleshooting

- **Missing models?**  
  Double-check that you unzipped `vosk-model.zip` into the correct folder.
- **Notifications not working?**  
  Make sure `bin/terminal-notifier` is executable:
    ```sh
    chmod +x bin/terminal-notifier
    ```
- **Google login not opening?**  
  Copy the URL from the terminal and open it in your browser.

---

## 🙏 Credits

- [Vosk Speech Recognition](https://alphacephei.com/vosk/)
- [node-notifier](https://github.com/mikaelbr/node-notifier)
- [Google Calendar API](https://developers.google.com/calendar)

---

## 📣 License

MIT

---

## 🔑 How to Get Your Google Credentials (Client ID and Secret)

Most people don't have these yet! Here's how to get them:

1. **Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).**
2. **Sign in with your Google account.**
3. **Create a new project** (or select an existing one).
4. **Enable the Google Calendar API:**
   - In the left menu, click **"Library"**.
   - Search for **"Google Calendar API"** and click it.
   - Click **"Enable"**.
5. **Create OAuth 2.0 Credentials:**
   - In the left menu, click **"Credentials"**.
   - Click **"+ Create Credentials"** and choose **"OAuth client ID"**.
   - If prompted, configure the consent screen (just fill in the required fields).
   - For **Application type**, choose **"Desktop app"**.
   - Name it anything you like (e.g., "Plato App").
   - Click **"Create"**.
6. **Copy your Client ID and Client Secret:**
   - A box will pop up with your **Client ID** and **Client Secret**.
   - Paste these into your `.env` file as shown above.

**Need more help?**
- See Google's official guide: [Create OAuth client ID credentials](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id)
- Or ask a friend or the developer for help!

---

**Enjoy seamless, AI-powered meeting scheduling on your Mac!** 
