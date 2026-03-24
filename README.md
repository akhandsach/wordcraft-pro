# ✍️ WordCraft Pro

> A free, fast, and beautiful word counter & writing analysis tool — a feature-rich open-source alternative to wordcounter.net.

🌐 **Live Demo:** [wordcraft-pro.vercel.app](https://wordcraft-pro.vercel.app)

![WordCraft Pro](https://img.shields.io/badge/status-live-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![No Dependencies](https://img.shields.io/badge/dependencies-none-success)

---

## ✨ Features

### 📊 Real-Time Statistics
- **Word count**, **Character count** (with & without spaces)
- **Sentence**, **Paragraph**, and **Line** counts
- **Read time** and **Speak time** estimates
- **Unique word** count, **Average word/sentence length**
- **Syllable** count, **Flesch Reading Ease** score & grade level

### 📈 Sidebar Panels
| Panel | Description |
|---|---|
| **Details** | Full breakdown of all text statistics |
| **Flow Score** | Visual bar chart of sentence length variety |
| **Keyword Density** | Top 10 keywords (1, 2, and 3-word phrases) |

### 🛠️ Toolbar Tools
| Tool | Description |
|---|---|
| **Case Converter** | UPPERCASE, lowercase, Title Case, Sentence case, aLtErNaTe |
| **Writing Goal** | Set a word/char/sentence target with progress bar |
| **Find & Replace** | Search and bulk-replace text |
| **Undo / Redo** | 200-step history |
| **Copy / Clear** | One-click clipboard copy and clear with confirmation |

### 🎁 Extra Tools (Modal Popups)
- **Case Converter** — standalone converter
- **Clean Text** — remove extra spaces, blank lines, HTML tags
- **Alphabetize** — sort lists A→Z, Z→A, by length, or shuffle
- **Random Picker** — pick random items from a list

### 🌙 More
- Dark / Light mode toggle (persisted in `localStorage`)
- Auto-save text in `localStorage` (restored on reload)
- Keyboard shortcuts: `Ctrl+Z`, `Ctrl+Y`, `Ctrl+F`
- Fully responsive — works on mobile, tablet, and desktop
- 100% client-side — your text **never** leaves your browser

---

## 🚀 Getting Started

No build step required. Just clone and open:

```bash
git clone https://github.com/akhandsach/wordcraft-pro.git
cd wordcraft-pro
# open index.html in your browser
```

Or deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/akhandsach/wordcraft-pro)

---

## 🗂️ Project Structure

```
wordcraft-pro/
├── index.html      # Main HTML structure
├── style.css       # All styling (light/dark theme, responsive)
├── script.js       # All logic (analysis engine, UI, tools)
├── vercel.json     # Vercel deployment config
└── README.md       # This file
```

---

## 🧠 Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic structure |
| **Vanilla CSS3** | Styling, animations, dark mode, responsive layout |
| **Vanilla JavaScript (ES6+)** | All logic — zero dependencies, no build step |
| **Google Fonts (Inter)** | Typography |
| **Vercel** | Hosting & deployment |
| **Vercel Analytics** | Privacy-friendly visitor tracking |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs via [Issues](../../issues)
- 💡 Suggest features via [Discussions](../../discussions)
- 🔀 Submit a Pull Request

```bash
# Fork the repo, clone it, make your changes, and open a PR
git checkout -b feature/your-feature-name
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ by <a href="https://github.com/akhandsach">akhandsach</a></p>
