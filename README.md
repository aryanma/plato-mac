# Plato Meeting Scheduler for macOS

Easily add meetings to your Google Calendar just by talking!

---

## 🚀 Quick Start (For Beginners)

> **Dependencies:** This app uses the following Node.js packages:
> - `axios`
> - `googleapis`
> - `node-notifier`
> - `ws`
> - `chrono-node` (for robust natural language date parsing)

### 1. **Download or Clone the App**
- Click the green **Code** button on GitHub and choose **Download ZIP**.
- Unzip the folder to your Desktop.

### 2. **Install Node.js (if you don't have it)**
- Go to [nodejs.org](https://nodejs.org/) and download the LTS version for Mac.
- Open the downloaded file and follow the instructions to install.

### 3. **Install Python 3 (if you don't have it)**
- Go to [python.org/downloads](https://python.org/downloads) and download Python 3 for Mac.
- Open the downloaded file and follow the instructions to install.

### 4. **Install Node.js Dependencies**
- Open the **Terminal** app (find it in Applications > Utilities).
- Type the following command and press Enter:
  ```sh
  cd ~/Desktop/plato-mac
  npm install
  ```

### 5. **Install Python Dependencies**
- In the same Terminal window, type:
  ```sh
  pip3 install -r vosk/requirements.txt
  ```

### 6. **Download the Vosk Model**
- Download `vosk-model.zip` from the [latest release page](https://github.com/aryanma/plato-mac/releases).
- Unzip `vosk-model.zip`.
- Move the unzipped folder into the `vosk` folder inside your app, and rename it to `model` (so you have `vosk/model/` with lots of files inside).

### 7. **Create Your `.env` File**
- In the main app folder, create a new file called `.env` (no name, just `.env`).
- Open it in a text editor and add:
  ```
  CLIENT_ID=your-google-client-id
  CLIENT_SECRET=your-google-client-secret
  ```
- Replace with your own Google credentials. [How to get these? See below!]

### 8. **Run the App**
- In Terminal, type:
  ```sh
  node index.js
  ```
- The app will start listening. Speak a meeting phrase (e.g., "Let's meet tomorrow at 2pm").
- You should see a notification pop up!

---

## 🛠️ Troubleshooting
- **Missing dependencies?** Run the install commands again.
- **No notification?** Check your Mac's notification settings for Terminal.
- **Google login not working?** Double-check your `.env` file and credentials.
- **Still stuck?** [Open an issue on GitHub](https://github.com/aryanma/plato-mac/issues) or ask for help!

---

## 🔑 How to Get Your Google Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or use an existing one).
3. Go to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Choose **Desktop app**.
6. Download the credentials and copy the **Client ID** and **Client Secret** into your `.env` file.

---

## 🙏 Credits
- [Vosk Speech Recognition](https://alphacephei.com/vosk/)
- [Google Calendar API](https://developers.google.com/calendar)

---

## 📄 License
MIT

---

## 📝 How it Works

- Listens for meeting or event intent in your speech.
- Uses advanced natural language date parsing (with chrono-node) for accurate scheduling.
- Notifies you and lets you add events to Google Calendar with one click.
- Runs in the background—no UI required.

**Enjoy seamless, AI-powered meeting scheduling on your Mac!** 
