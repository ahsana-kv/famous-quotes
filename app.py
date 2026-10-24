import json
import random
from pathlib import Path
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Load quotes from JSON file
QUOTES_FILE = Path(__file__).parent / "quotes.json"


def load_quotes():
    if not QUOTES_FILE.exists():
        return []
    with open(QUOTES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


QUOTES = load_quotes()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/quotes/random", methods=["GET"])
def get_random_quote():
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    filtered = QUOTES
    if category:
        filtered = [q for q in filtered if q.get("category", "").lower() == category]
    if author:
        filtered = [q for q in filtered if author in q.get("author", "").lower()]

    if not filtered:
        return jsonify({"error": "No quotes found matching criteria"}), 404

    return jsonify(random.choice(filtered))


@app.route("/api/quotes", methods=["GET"])
def get_quotes():
    search = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    filtered = QUOTES

    if category:
        filtered = [q for q in filtered if q.get("category", "").lower() == category]

    if author:
        filtered = [q for q in filtered if author in q.get("author", "").lower()]

    if search:
        filtered = [
            q
            for q in filtered
            if search in q.get("quote", "").lower()
            or search in q.get("author", "").lower()
            or search in q.get("category", "").lower()
        ]

    return jsonify({"count": len(filtered), "quotes": filtered})


@app.route("/api/categories", methods=["GET"])
def get_categories():
    categories = sorted({q.get("category", "") for q in QUOTES if q.get("category")})
    return jsonify(categories)


@app.route("/api/authors", methods=["GET"])
def get_authors():
    authors = sorted({q.get("author", "") for q in QUOTES if q.get("author")})
    return jsonify(authors)


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
