// RSS URL
const rssUrls = {
  sondakika: [
    "https://www.denizhaber.com/rss",
    "https://www.denizticaretgazetesi.org/rss/genel-0",
    "https://www.7deniz.net/rss/guncel",
    "https://www.turksail.com/?format=feed&type=rss",
    //"http://denizdenhaber.com/sondakika.xml", (üstüne logo resmi geliyor güzel gözükmüyo)
    "https://arkasnews.com/feed/"
  ],
  arkas: [
    "https://www.denizhaber.com/rss",
    "https://www.denizticaretgazetesi.org/rss/genel-0",
    "https://www.7deniz.net/rss/guncel",
    "https://www.turksail.com/?format=feed&type=rss",
    "https://arkasnews.com/feed/",
    "https://www.cumhuriyet.com.tr/rss/10.xml",
    "https://www.ntv.com.tr/teknoloji.rss",
    "http://www.star.com.tr/rss/teknoloji.xml",
    "www.yenisafak.com/rss?xml=teknoloji",
    "https://www.virahaber.com/rss/",
    "https://www.denizbulten.com/rss/",
    //"https://www.denizhaber.com/rss/gundem",
    //"https://www.denizticaretgazetesi.org/rss/gundem-1",
    "https://www.7deniz.net/rss/sektorden",
    "https://www.denizticaretgazetesi.org/rss/lojistik-14",
    "https://www.denizhaber.com/rss/lojistik",
    "https://www.7deniz.net/rss/lojistik",
    //"https://www.denizticaretgazetesi.org/rss/dunya-2",
    "https://www.denizhaber.com/rss/dunya"
  ],
  turkiye: [
    "https://www.egetelgraf.com/rss",
    "https://arkasnews.com/feed/",
    //"https://www.24saatgazetesi.com/rss",
    "http://www.cumhuriyet.com.tr/rss/son_dakika.xml"
  ],
  denizcilik: [
    "https://www.virahaber.com/rss/",
    "https://www.denizbulten.com/rss/",
    "https://www.denizhaber.com/rss/gundem",
    "https://www.denizticaretgazetesi.org/rss/gundem-1",
    "https://www.7deniz.net/rss/sektorden",
    "https://www.denizticaretgazetesi.org/rss/lojistik-14",
    "https://www.denizhaber.com/rss/lojistik",
    "https://www.7deniz.net/rss/lojistik",
    "https://www.denizticaretgazetesi.org/rss/dunya-2",
    "https://www.denizhaber.com/rss/dunya"
  ],
  dunya: [
    "https://www.denizticaretgazetesi.org/rss/dunya-2",
    "https://www.denizhaber.com/rss/dunya",
    //"https://www.7deniz.net/rss/dunya",
    "https://www.marinelink.com/news/rss",
    "https://www.marinetechnologynews.com/rss/news.aspx",
    "https://www.maritime-executive.com/rss/all-news",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://gcaptain.com/rss/",
    "https://www.ship-technology.com/feed/",
    "https://www.independent.co.uk/news/world/rss",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    
  ],
  teknoloji: [
    "https://www.cumhuriyet.com.tr/rss/10.xml",
    "https://www.ntv.com.tr/teknoloji.rss",
    //"http://www.star.com.tr/rss/teknoloji.xml",
    "www.yenisafak.com/rss?xml=teknoloji"
  ],
  turkiye: [
    "https://www.egetelgraf.com/rss",
    "https://arkasnews.com/feed/",
    //"https://www.24saatgazetesi.com/rss",
    "http://www.cumhuriyet.com.tr/rss/son_dakika.xml"
  ]
}


const newsContainer = document.getElementById("news-area");
const categoryTitle = document.getElementById("category-title");
const pagesContainer = document.getElementById("pagination");
const last24hButton = document.getElementById("last-24h-button");

let currentCategory = 'sondakika';
let currentPage = 1;
const itemsPerPage = 15;

// Cache object and duration
const newsCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // cache süresini 5 dkya cıkardım + offline cache eklenebilirv

// Fetch news function
const fetchNews = async (category, page = 1, last24h = false) => {
  const cacheKey = `${category}_${page}_${last24h}`;
  const now = Date.now();

  if (newsCache[cacheKey] && now - newsCache[cacheKey].timestamp < CACHE_DURATION) {
    return newsCache[cacheKey].data;
  }

  newsContainer.innerHTML = "<p>Haberler yükleniyor...</p>";

  const categoryTitles = {
    sondakika: "Son Dakika Haberleri",
    arkas: "Arkas'ın Basındaki Haberleri",
    denizcilik: "Denizcilik Haberleri",
    dunya: "Dünya Haberleri",
    teknoloji: "Teknoloji Haberleri"
  };
  categoryTitle.innerText = categoryTitles[category] || "";

  const urls = rssUrls[category];
  const newsPromises = urls.map(url =>
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        return Array.from(xml.querySelectorAll("item"));
      })
      .catch(error => {
        console.error(`Error fetching news from ${url}:`, error);
        return [];
      })
  );

  try {
    const newsArrays = await Promise.all(newsPromises);
    let allNews = newsArrays.flat();

    if (category === 'arkas') {
      const arkasKeywords = ['arkas', 'arkas holding', 'arkas line'];
      allNews = allNews.filter(item => {
        const title = item.querySelector("title")?.textContent?.toLowerCase() || '';
        const description = item.querySelector("description")?.textContent?.toLowerCase() || '';
        return arkasKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
      });
    } else {
      // Filter news based on the publication date
      const now = new Date();
      const timeThreshold = last24h ? 24 : (now.getDay() >= 1 && now.getDay() <= 5 ? 24 : 72);
      const timeThresholdMillis = timeThreshold * 60 * 60 * 1000; // Convert hours to milliseconds
      allNews = allNews.filter(item => {
        const pubDate = new Date(item.querySelector("pubDate").textContent);
        return now - pubDate < timeThresholdMillis;
      });
    }

    if (allNews.length === 0) {
      throw new Error('No news found');
    }
    allNews.sort((a, b) => new Date(b.querySelector("pubDate").textContent) - new Date(a.querySelector("pubDate").textContent));

    const paginatedNews = allNews.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    newsCache[cacheKey] = {
      timestamp: now,
      data: paginatedNews
    };

    // Update total pages in cache
    const totalPages = Math.ceil(allNews.length / itemsPerPage);
    newsCache[`${category}_${last24h}_total`] = totalPages;

    return paginatedNews;
  } catch (error) {
    console.error("Error loading news:", error);
    newsContainer.innerHTML = "<p>Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>";
    return [];
  }
};
// Display news function
const displayNews = (items, page) => {
  newsContainer.innerHTML = "";
  items.forEach(item => {
    const title = item.querySelector("title")?.textContent || "Başlık bulunamadı";
    const link = item.querySelector("link")?.textContent || "#";
    const description = item.querySelector("description")?.textContent || "Açıklama bulunamadı";
    const content = item.querySelector("content\\:encoded")?.textContent || item.querySelector("description")?.textContent || "İçerik bulunamadı";
    const pubDate = new Date(item.querySelector("pubDate")?.textContent || new Date());
    const imageElement = item.querySelector("enclosure, media\\:content");
    const imageUrl = imageElement?.getAttribute("url") || "img/logo.png";

    const newsCard = document.createElement("div");
    newsCard.className = "news";
    newsCard.innerHTML = `
      <a href="${link}" target="_blank" rel="nofollow">
        <img src="img/placeholder.jpg" data-src="${imageUrl}" class="lazy-load" alt="${title}" loading="lazy" width="312" height="200" title="${title}">
        <div class="news-info">
          <span><i class="bi bi-clock"></i> ${formatTimeDiff(pubDate)}</span>
        </div>
        <h2>${title}</h2>
        <p>${description.slice(0, 100)}...</p>
      </a>
      <div class="news-buttons">
        <button class="read-more" data-content="${encodeURIComponent(content)}">Devamını Oku</button>
        <a href="${link}" target="_blank" rel="nofollow" class="go-to-news">Habere Git</a>
      </div>
    `;
    newsContainer.appendChild(newsCard);
  });
  lazyLoadImages();
  updatePagination(page);
};
// Update pagination function  
const updatePagination = (currentPage) => {
  pagesContainer.innerHTML = '';

  const totalPages = newsCache[`${currentCategory}_${last24hButton.classList.contains('active')}_total`];

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement('a');
    pageLink.href = '#';
    pageLink.textContent = i;

    if (i === currentPage) {
      pageLink.className = 'active';
    }

    pageLink.addEventListener('click', (e) => {
      e.preventDefault();
      fetchNews(currentCategory, i, last24hButton.classList.contains('active')).then((news) => displayNews(news, i));
    });

    pagesContainer.appendChild(pageLink);
  }
};

// Lazy loading improvements
const lazyLoadImages = () => {
  const lazyImages = document.querySelectorAll("img.lazy-load");
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = image.dataset.src;
        image.classList.remove("lazy-load");
        observer.unobserve(image);
      }
    });
  }, {
    rootMargin: '0px 0px 200px 0px', // Load images 200px before they become visible
    threshold: 0.01 // Trigger lazy loading even if a small part of the image is visible
  });

  lazyImages.forEach(img => imageObserver.observe(img));
};

// Time difference formatting function
const formatTimeDiff = (pubDate) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - pubDate) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} saniye önce`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  return pubDate.toLocaleDateString('tr-TR');
};
// Change category function
const changeCategory = (category) => {
currentCategory = category;
currentPage = 1;
last24hButton.style.display = category === 'arkas' ? 'none' : 'none';
  fetchNews(category, currentPage, last24hButton.classList.contains('active')).then((news) => displayNews(news, currentPage));
  updateActiveCategory(category);
};

// Update active category function
const updateActiveCategory = (category) => {
document.querySelectorAll('.category li').forEach(li => {
li.classList.remove('active');
if (li.getAttribute('onclick').includes(category)) {
li.classList.add('active');
}
});
};
// Update clock function
const updateClock = () => {
const now = new Date();
const clock = document.querySelector(".clock");
clock.innerHTML = '<i class="bi bi-clock"></i> ' + now.toLocaleTimeString('tr-TR');
const welcome = document.querySelector(".wellcome");
const hour = now.getHours();
if (hour < 5) welcome.innerHTML = "<i class='bi bi-moon-stars'></i> İyi geceler!";
else if (hour < 12) welcome.innerHTML = "<i class='bi bi-sunrise'></i> Günaydın!";
else if (hour < 18) welcome.innerHTML = "<i class='bi bi-sun'></i> İyi günler!";
else welcome.innerHTML = "<i class='bi bi-moon'></i> İyi akşamlar!";
};
// Toggle dark mode function
const toggleDarkMode = () => {
document.body.classList.toggle('dark-mode');
localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
};
// Search functionality
const searchNews = (query) => {
const newsItems = document.querySelectorAll('.news');
newsItems.forEach(item => {
const title = item.querySelector('h2').textContent.toLowerCase();
const description = item.querySelector('p').textContent.toLowerCase();
if (title.includes(query.toLowerCase()) || description.includes(query.toLowerCase())) {
item.style.display = 'block';
} else {
item.style.display = 'none';
}
});
};
// Initialize search input
const initSearchInput = () => {
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Haber ara...';
searchInput.classList.add('search-input');
searchInput.addEventListener('input', (event) => {
const query = event.target.value;
searchNews(query);
});
const rightInfo = document.querySelector('.right-info');
rightInfo.insertBefore(searchInput, rightInfo.firstChild);
};
// Last 24 hours button click event
last24hButton.addEventListener('click', () => {
last24hButton.classList.toggle('active');
currentPage = 1;
fetchNews(currentCategory, currentPage, last24hButton.classList.contains('active')).then((news) => displayNews(news, currentPage));
});
// ... (previous code)

// Function to swap price and change percentage
function swapPriceAndChangePercentage() {
  const widgetElement = document.querySelector('.tradingview-widget-container__widget');
  const rowElements = widgetElement.querySelectorAll('.tv-ticker-item');

  rowElements.forEach(row => {
    const descriptionElement = row.querySelector('.tv-ticker-item__description');
    const lastElement = row.querySelector('.tv-ticker-item__last');
    const changePercentElement = row.querySelector('.tv-ticker-item__change-percent');

    row.insertBefore(changePercentElement, descriptionElement);
    row.insertBefore(lastElement, changePercentElement);
  });
}

// Page load functions
document.addEventListener("DOMContentLoaded", () => {
  fetchNews(currentCategory, currentPage).then((news) => displayNews(news, currentPage));
  updateClock();
  setInterval(updateClock, 1000);

  // Add dark mode toggle button
  const footer = document.querySelector('footer');
  const darkModeToggle = document.createElement('button');
  darkModeToggle.innerHTML = '<i class="bi bi-moon"></i>';
  darkModeToggle.id = 'dark-mode-toggle';
  darkModeToggle.addEventListener('click', toggleDarkMode);
  footer.appendChild(darkModeToggle);

  // Apply saved mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Initialize search input
  initSearchInput();

  // Swap price and change percentage when the widget is loaded
  const widgetScript = document.querySelector('.tradingview-widget-container script[src*="embed-widget-ticker-tape.js"]');
  widgetScript.addEventListener('load', swapPriceAndChangePercentage);
});

// Mobile menu functionality
const menuIcon = document.querySelector("#webapp_cover");
const inputCheckbox = document.querySelector("#menu_checkbox");
const rightCategoryArea = document.querySelector(".right-category-area");
const rightCategoryClose = document.querySelector(".right-category-close");

menuIcon.addEventListener("click", () => {
  rightCategoryArea.style.left = rightCategoryArea.style.left === "0px" ? "-100%" : "0px";
});

rightCategoryClose.addEventListener("click", () => {
  rightCategoryArea.style.left = "-100%";
  inputCheckbox.checked = false;
});

const displayReadMorePopup = (content) => {
  const popup = document.createElement('div');
  popup.className = 'read-more-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <span class="close-popup">&times;</span>
      ${decodeURIComponent(content)}
    </div>
  `;
  document.body.appendChild(popup);

  const closePopup = popup.querySelector('.close-popup');
  closePopup.addEventListener('click', () => {
    popup.remove();
  });
};

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('read-more')) {
    const content = event.target.dataset.content;
    displayReadMorePopup(content);
  }
});

const handleReadMoreClick = async (link) => {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(link)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "text/xml");
    const fullDescription = xml.querySelector("description").textContent;
    displayReadMorePopup(fullDescription);
  } catch (error) {
    console.error('Error fetching full article:', error);
  }
};

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('read-more')) {
    const link = event.target.parentElement.previousElementSibling.href;
    handleReadMoreClick(link);
  }
});