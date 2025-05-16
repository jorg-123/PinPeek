# PinPeek

**PinPeek** is a Chrome extension that shows when a Pinterest pin was originally created, even though Pinterest doesn’t display this by default. It extracts the data by sniffing Pinterest's internal network requests, without official API access.

---

### Features

- Display the original pin date of pins
- Works on a user's "All Pins" board 
- Stores up to 5,000 pins for snappy local access
- Does not access or store your Pinterest account info

---

### Limitations (v0.1)

- Only works for other users’ pins (not your own p yet)
- Only shows dates on the **"All Pins"** profile view
  
---

### How to install

1. Clone or download this repository
2. In Chrome, go to `chrome://extensions`
3. Enable **Developer mode** (on the top right)
4. Click **Load unpacked**, and select the folder
5. Navigate to a Pinterest user's "All Pins" board to see dates 

---

### Tech Stack

- JavaScript (Vanilla)
- Chrome Extensions API (Manifest v3)
- HTML
- Pinterest’s internal network traffic

---

### Planned Features

- Support for personal pins
- Board download
- Optional data export (CSV)

---

### Contributing

Feel free to fork, submit issues, or open pull requests. Just keep in mind this extension relies on undocumented endpoints. Pinterest could change them at any time.

---

### License

MIT
