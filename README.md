# Famous Quotes Web Application

An elegant, modern web application built with **Python Flask**, **Vanilla JavaScript**, and **HTML5/CSS3** to explore, discover, and search across 100 well-known quotes by famous thinkers, scientists, leaders, and writers.

---

## Features

- **Random Quote Generator**: Instantly browse inspiring quotes with smooth animated transitions.
- **100 Curated Quotations**: Diverse collection covering Science, Philosophy, Leadership, Literature, Technology, Humor, and Wisdom.
- **Real-Time Search**: Instant debounced search filtering by author, keyword, or quote contents.
- **Category Filter Pills**: Quickly narrow down quotes by category (Philosophy, Science, Inspiration, etc.).
- **Click-to-View**: Clicking any quote from the search grid elevates it into the hero card.
- **Copy to Clipboard**: One-click formatted quote copying with toast notification.
- **Responsive Dark UI**: Clean, mobile-friendly interface styled with Google Fonts (`Playfair Display` & `Cinzel`).

---

## Project Structure

```text
famous-quotes/
├── app.py                # Flask application & REST API
├── quotes.json           # Curated database of 100 quotes
├── requirements.txt      # Python dependencies (Flask)
├── test_app.py           # Automated unit test suite
├── .gitignore            # Git ignore rules
├── static/
│   ├── css/
│   │   └── style.css     # Dark mode CSS with responsive layout
│   └── js/
│       └── app.js        # Vanilla JS app logic & API integration
└── templates/
    └── index.html        # Semantic HTML5 template
```

---

## Getting Started

### Prerequisites
- Python 3.8+
- pip

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahsana-kv/ahsanathesneem-famous-quotes.git
   cd ahsanathesneem-famous-quotes
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python app.py
   ```

4. **Open in browser:**
   Navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## Running Tests

Run the automated test suite with:

```bash
python test_app.py
```

---

## License

MIT License. Feel free to use and modify for personal or commercial projects.
