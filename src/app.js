const DEFAULT_LANG = 'es';
const FALLBACK = {
  es: 'Pendiente',
  en: 'Pending',
};
const MENU_TITLE = {
  es: 'Menú',
  en: 'Menu',
};
const HOURS_TITLE = {
  es: 'Horarios',
  en: 'Hours',
};
const LOCATION_TITLE = {
  es: 'Ubicación',
  en: 'Location',
};
const SOCIAL_TITLE = {
  es: 'Redes',
  en: 'Social',
};
const WHATSAPP_LABEL = {
  es: 'WhatsApp',
  en: 'WhatsApp',
};

const elements = {
  name: document.getElementById('restaurant-name'),
  tagline: document.getElementById('restaurant-tagline'),
  menuTitle: document.getElementById('menu-title'),
  menuContainer: document.getElementById('menu-container'),
  hoursTitle: document.getElementById('hours-title'),
  hoursContainer: document.getElementById('hours-container'),
  locationTitle: document.getElementById('location-title'),
  locationContainer: document.getElementById('location-container'),
  whatsappContainer: document.getElementById('whatsapp-container'),
  socialTitle: document.getElementById('social-title'),
  socialContainer: document.getElementById('social-container'),
  socialSection: document.getElementById('social-section'),
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const getLanguageValue = (value, lang) => {
  if (!value || typeof value !== 'object') {
    return FALLBACK[lang];
  }
  return value[lang] || FALLBACK[lang];
};

const buildPending = (lang) => {
  const span = document.createElement('span');
  span.className = 'pending';
  span.textContent = FALLBACK[lang];
  return span;
};

const resolveSlug = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const rIndex = parts.indexOf('r');
  if (rIndex !== -1 && parts[rIndex + 1]) {
    return parts[rIndex + 1];
  }
  return parts[0] || 'restaurante-963';
};

const fetchRestaurant = async (slug) => {
  const response = await fetch(`/data/restaurants/${slug}.json`);
  if (!response.ok) {
    throw new Error('Missing data');
  }
  return response.json();
};

const renderMenu = (menu = [], lang) => {
  elements.menuContainer.innerHTML = '';

  if (!Array.isArray(menu) || menu.length === 0) {
    elements.menuContainer.appendChild(buildPending(lang));
    return;
  }

  menu.forEach((section) => {
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'menu-section';

    const header = document.createElement('h3');
    header.className = 'menu-category';
    header.textContent = getLanguageValue(section.category, lang);
    sectionWrapper.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'menu-list';

    const items = Array.isArray(section.items) ? section.items : [];
    const visibleItems = items.filter((item) => item && item.price !== undefined && item.price !== null);

    if (visibleItems.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'menu-item';
      emptyItem.appendChild(buildPending(lang));
      list.appendChild(emptyItem);
    } else {
      visibleItems.forEach((item) => {
        const row = document.createElement('li');
        row.className = 'menu-item';

        const name = document.createElement('span');
        name.className = 'menu-item-name';
        name.textContent = getLanguageValue(item.name, lang);

        const price = document.createElement('span');
        price.className = 'menu-item-price';
        price.textContent = formatCurrency(Number(item.price));

        row.appendChild(name);
        row.appendChild(price);
        list.appendChild(row);
      });
    }

    sectionWrapper.appendChild(list);
    elements.menuContainer.appendChild(sectionWrapper);
  });
};

const renderHours = (hours, lang) => {
  elements.hoursContainer.innerHTML = '';
  const schedule = hours?.schedule;

  if (!Array.isArray(schedule) || schedule.length === 0) {
    elements.hoursContainer.appendChild(buildPending(lang));
    return;
  }

  const validRows = schedule.filter((row) => row?.days || row?.open || row?.close);
  if (validRows.length === 0) {
    elements.hoursContainer.appendChild(buildPending(lang));
    return;
  }

  const list = document.createElement('ul');
  list.className = 'info-list';

  validRows.forEach((row) => {
    const item = document.createElement('li');
    const dayText = row.days || FALLBACK[lang];
    const openText = row.open || FALLBACK[lang];
    const closeText = row.close || FALLBACK[lang];
    item.textContent = `${dayText}: ${openText} - ${closeText}`;
    list.appendChild(item);
  });

  elements.hoursContainer.appendChild(list);
};

const renderLocation = (location, lang) => {
  elements.locationContainer.innerHTML = '';
  const address = location?.address || '';
  const city = location?.city || '';
  const state = location?.state || '';
  const mapsUrl = location?.googleMapsUrl || '';

  const parts = [address, city, state].filter(Boolean);

  if (parts.length === 0 && !mapsUrl) {
    elements.locationContainer.appendChild(buildPending(lang));
    return;
  }

  if (parts.length > 0) {
    const line = document.createElement('p');
    line.textContent = parts.join(', ');
    elements.locationContainer.appendChild(line);
  }

  if (mapsUrl) {
    const link = document.createElement('a');
    link.href = mapsUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = lang === 'es' ? 'Ver en Google Maps' : 'View on Google Maps';
    elements.locationContainer.appendChild(link);
  }
};

const renderWhatsapp = (contact, lang) => {
  elements.whatsappContainer.innerHTML = '';
  const whatsapp = contact?.whatsapp;

  if (!whatsapp) {
    return;
  }

  const message = getLanguageValue(contact?.whatsappMessage, lang);
  const url = `https://wa.me/${encodeURIComponent(whatsapp)}?text=${encodeURIComponent(message)}`;
  const button = document.createElement('a');
  button.href = url;
  button.className = 'whatsapp-button';
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.textContent = WHATSAPP_LABEL[lang];
  elements.whatsappContainer.appendChild(button);
};

const renderSocial = (social, lang) => {
  elements.socialContainer.innerHTML = '';

  const entries = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'website', label: lang === 'es' ? 'Sitio web' : 'Website' },
  ];

  const active = entries.filter((entry) => social?.[entry.key]);

  if (active.length === 0) {
    elements.socialSection.classList.add('is-hidden');
    return;
  }

  elements.socialSection.classList.remove('is-hidden');

  active.forEach((entry) => {
    const link = document.createElement('a');
    link.href = social[entry.key];
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = entry.label;
    elements.socialContainer.appendChild(link);
  });
};

const applyLanguage = (data, lang) => {
  elements.name.textContent = getLanguageValue(data.name, lang);
  elements.tagline.textContent = getLanguageValue(data.tagline, lang);
  elements.menuTitle.textContent = MENU_TITLE[lang];
  elements.hoursTitle.textContent = HOURS_TITLE[lang];
  elements.locationTitle.textContent = LOCATION_TITLE[lang];
  elements.socialTitle.textContent = SOCIAL_TITLE[lang];

  renderMenu(data.menu, lang);
  renderHours(data.hours, lang);
  renderLocation(data.location, lang);
  renderWhatsapp(data.contact, lang);
  renderSocial(data.social, lang);
};

const setupLanguageToggle = (data) => {
  const buttons = document.querySelectorAll('.lang-button');
  let currentLang = DEFAULT_LANG;

  const setActive = (lang) => {
    currentLang = lang;
    buttons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.lang === lang);
    });
    applyLanguage(data, lang);
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => setActive(button.dataset.lang));
  });

  setActive(currentLang);
};

const init = async () => {
  const slug = resolveSlug();
  try {
    const data = await fetchRestaurant(slug);
    setupLanguageToggle(data);
  } catch (error) {
    const fallbackData = {
      name: { es: FALLBACK.es, en: FALLBACK.en },
      tagline: { es: FALLBACK.es, en: FALLBACK.en },
      menu: [],
      hours: {},
      location: {},
      contact: {},
      social: {},
    };
    setupLanguageToggle(fallbackData);
  }
};

init();
