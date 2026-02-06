from bs4 import BeautifulSoup
from urllib.parse import urljoin


def make_absolute_url(base_url: str, relative_url: str) -> str:
    """
    Converts relative paths (/about) to full URLs (https://site.com/about).
    """
    if not relative_url:
        return None
    return urljoin(base_url, relative_url)


def extract_navigation(soup: BeautifulSoup, base_url: str) -> list:
    """
    Finds extraction links from <nav>, <header>, or common menu classes.
    Returns a list of dicts: [{'label': 'Home', 'link': '...'}]
    """
    nav_links = []

    # 1. Define where to look (in order of priority)
    # We look for <nav> tags, or divs with 'nav'/'menu' in their class/id
    search_targets = [
        soup.find_all('nav'),
        soup.find_all(attrs={"role": "navigation"}),
        soup.find_all(class_=lambda x: x and ('nav' in x.lower() or 'menu' in x.lower() or 'header' in x.lower())),
    ]

    # Flatten list and remove None
    containers = [item for sublist in search_targets for item in sublist if item]

    # If no specific container found, fall back to the first <ul> in the body
    if not containers:
        body = soup.find('body')
        if body:
            first_ul = body.find('ul')
            if first_ul:
                containers = [first_ul]

    # 2. Extract links from the best container found
    seen_links = set()

    for container in containers:
        # Stop if we already have enough links
        if len(nav_links) >= 15:
            break

        anchors = container.find_all('a', href=True)
        for a in anchors:
            text = a.get_text(strip=True)
            href = a['href']

            # Skip empty links or internal page anchors (#section)
            if not text or href.startswith('#') or href.startswith('javascript:'):
                continue

            full_url = make_absolute_url(base_url, href)

            # Avoid duplicates
            if full_url not in seen_links:
                seen_links.add(full_url)
                nav_links.append({
                    "label": text[:30],  # Truncate long labels
                    "link": full_url
                })

    return nav_links[:15]  # Return max 15 items