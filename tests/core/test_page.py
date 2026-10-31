from core.page import MAX_TEXT_CHARS, main_text

ARTICLE = """<html lang="en"><head><title>Grandma's oyakodon</title>
<meta property="og:image" content="https://e.x/photo.jpg"></head><body>
<nav><a href="/">Home</a> <a href="/shop">Shop our knives</a></nav>
<article><h1>Grandma's oyakodon</h1>
<p>This is the oyakodon my grandmother made every Sunday, simmered in a light dashi broth.</p>
<p>You need two eggs, one chicken thigh, half an onion and a cup of dashi for two bowls.</p>
<p>Simmer the onion and chicken in the dashi for five minutes, then pour over the beaten eggs.</p>
<p>Cover and cook for one more minute, then slide everything onto a bowl of hot rice.</p>
</article><footer>Subscribe to our newsletter for weekly deals!</footer></body></html>"""


def test_keeps_the_article_and_drops_the_chrome():
    page = main_text(ARTICLE, "https://e.x/oyakodon")
    assert "dashi broth" in page.text
    assert "Shop our knives" not in page.text and "newsletter" not in page.text
    assert page.image_url == "https://e.x/photo.jpg"


def test_text_is_capped():
    huge = ARTICLE.replace("</article>", "<p>" + "More family stories. " * 2000 + "</p></article>")
    assert len(main_text(huge, "https://e.x/oyakodon").text) == MAX_TEXT_CHARS
