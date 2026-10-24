import json
import unittest
from pathlib import Path
from app import app, QUOTES_FILE


class FamousQuotesTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_quotes_file_integrity(self):
        """Verify quotes.json exists and contains exactly 100 well-formed quotes."""
        self.assertTrue(QUOTES_FILE.exists(), "quotes.json must exist")
        with open(QUOTES_FILE, "r", encoding="utf-8") as f:
            quotes = json.load(f)

        self.assertEqual(len(quotes), 100, f"Expected 100 quotes, found {len(quotes)}")
        for idx, q in enumerate(quotes):
            self.assertIn("id", q, f"Quote at index {idx} missing 'id'")
            self.assertIn("quote", q, f"Quote at index {idx} missing 'quote'")
            self.assertIn("author", q, f"Quote at index {idx} missing 'author'")
            self.assertIn("category", q, f"Quote at index {idx} missing 'category'")
            self.assertTrue(len(q["quote"].strip()) > 0)
            self.assertTrue(len(q["author"].strip()) > 0)
            self.assertTrue(len(q["category"].strip()) > 0)

    def test_index_route(self):
        """Verify homepage renders successfully."""
        response = self.app.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Famous Quotes", response.data)

    def test_random_quote(self):
        """Verify random quote API endpoint."""
        response = self.app.get("/api/quotes/random")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("quote", data)
        self.assertIn("author", data)
        self.assertIn("category", data)

    def test_random_quote_by_category(self):
        """Verify random quote filtered by category."""
        response = self.app.get("/api/quotes/random?category=Science")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["category"].lower(), "science")

    def test_categories_endpoint(self):
        """Verify categories endpoint returns sorted list."""
        response = self.app.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        categories = response.get_json()
        self.assertIsInstance(categories, list)
        self.assertIn("Science", categories)
        self.assertIn("Philosophy", categories)
        self.assertEqual(categories, sorted(categories))

    def test_authors_endpoint(self):
        """Verify authors endpoint returns sorted list."""
        response = self.app.get("/api/authors")
        self.assertEqual(response.status_code, 200)
        authors = response.get_json()
        self.assertIsInstance(authors, list)
        self.assertIn("Albert Einstein", authors)
        self.assertEqual(authors, sorted(authors))

    def test_search_quotes_by_author(self):
        """Verify search query matching author name."""
        response = self.app.get("/api/quotes?search=Einstein")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data["count"], 0)
        for q in data["quotes"]:
            matches = (
                "einstein" in q["author"].lower()
                or "einstein" in q["quote"].lower()
                or "einstein" in q["category"].lower()
            )
            self.assertTrue(matches)

    def test_search_quotes_by_category(self):
        """Verify filtering quotes by category."""
        response = self.app.get("/api/quotes?category=Leadership")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data["count"], 0)
        for q in data["quotes"]:
            self.assertEqual(q["category"].lower(), "leadership")


if __name__ == "__main__":
    unittest.main()
