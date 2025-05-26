# Plato Meeting Scheduler for macOS

**Easily add meetings to your Google Calendar just by talking!**

---

## 🟢 Step-by-Step Setup Guide (For Beginners)

### 1. Download the Files
- Go to the [Releases page](https://github.com/aryanma/plato-mac/releases).
- Download these three files:
  - `plato-mac` (the main app)
  - `vosk-model.zip`
  - `terminal-notifier` (inside the `bin` folder)

### 2. Unzip the Vosk Model
- Find `vosk-model.zip` in your Downloads folder.
- Double-click it to unzip. You should get a folder called `vosk-model`.
- Open the `vosk-model` folder. You should see folders named `am`, `conf`, `graph`, and `ivector`.

### 3. Set Up the App Folder
- Create a new folder anywhere you like (for example, on your Desktop) and name it `Plato`.
- Move these files into your new `Plato` folder:
  - `plato-mac`
  - The entire unzipped `vosk-model` folder (rename it to just `model`)
  - The `terminal-notifier` file
- Your `Plato` folder should look like this:
  ```
  Plato/
    plato-mac
    bin/
      terminal-notifier
    vosk/
      model/
        am/
        conf/
        graph/
        ivector/
  ```
  - If you don't have a `bin` folder, create one inside `Plato` and put `terminal-notifier` inside it.
  - If you don't have a `vosk` folder, create one inside `Plato` and move the `model` folder inside it.

### 4. Make the App and Notifier Executable
- Open the **Terminal** app (find it in Applications > Utilities > Terminal).
- Type the following commands, pressing Enter after each one (replace `Desktop/Plato` with the path to your folder if it's somewhere else):
  ```sh
  cd ~/Desktop/Plato
  chmod +x plato-mac
  chmod +x bin/terminal-notifier
  ```

### 5. Set Up Google Credentials
- In your `Plato` folder, create a new file called `.env` (yes, the name starts with a dot).
- Open `.env` with TextEdit or any text editor.
- Paste in your Google credentials like this:
  ```
  CLIENT_ID=your-google-client-id
  CLIENT_SECRET=your-google-client-secret
  ```
- Save the file.

### 6. How to Get Your Google Credentials (Client ID and Secret)

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

### 7. Run the App
- In the Terminal (still in your `Plato` folder), type:
  ```sh
  ./plato-mac
  ```
- The first time you run it, your web browser will open and ask you to log in to Google and give permission.
- Approve access.

### 8. You're Done!
- The app will now listen for meeting or event suggestions in your speech and offer to add them to your Google Calendar.

---

**Enjoy easy, voice-powered meeting scheduling!**
