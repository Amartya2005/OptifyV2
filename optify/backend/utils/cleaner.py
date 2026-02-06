import re
from bs4 import BeautifulSoup, Comment


# --- URL VALIDATION (Existing) ---
def is_valid_url(url: str) -> bool:
    if not url: return False
    regex = re.compile(
        r'^(?:http|ftp)s?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return re.match(regex, url) is not None


def normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    return url


# --- NEW HTML CLEANING LOGIC ---
REMOVABLE_TAGS = [
    'script', 'style', 'svg', 'img', 'video', 'iframe',
    'noscript', 'canvas', 'link', 'meta', 'input', 'button', 'form'
]


def clean_html(html_content: str) -> BeautifulSoup:
    """
    Parses HTML and removes heavy/unnecessary tags.
    Returns a BeautifulSoup object.
    """
    soup = BeautifulSoup(html_content, 'html.parser')

    # 1. Remove specific tags
    for tag_name in REMOVABLE_TAGS:
        for tag in soup.find_all(tag_name):
            tag.decompose()

    # 2. Remove comments
    comments = soup.find_all(string=lambda text: isinstance(text, Comment))
    for comment in comments:
        comment.extract()

    return soup


def extract_text_content(soup: BeautifulSoup) -> str:
    """
    Extracts clean, readable text from the soup object.
    """
    # get_text with separator adds space between block elements
    text = soup.get_text(separator=' ', strip=True)

    # Collapse multiple spaces into one
    text = re.sub(r'\s+', ' ', text)

    return text[:5000]  # Limit to 20k chars to avoid overloading AI later