// ==============================
// tours-slider.js
// Full tours + image slider logic with sidebar layout
// ==============================

// Function to get category display name
function getCategoryDisplayName(category) {
    const categoryNames = {
        'bird-watching': 'Bird Watching Tours',
        'city-tour': 'City Tours',
        'combinations': 'Combination Tours',
        'day-trips': 'Day Trips',
        'festival-holidays': 'Festival & Holidays Tours',
        'festival-tour': 'Fixed Departure Tours',
        'historic-route': 'Historic Route Tours',
        'bale-mountains': 'Bale Mountains Tours',
        'omo-valley': 'Omo Valley Tours',
        'trekking-hiking': 'Trekking & Hiking Tours'
    };
    return categoryNames[category] || 'Tour Packages';
}

// Function to get URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    return params;
}

// Function to filter tours by category
function filterToursByCategory(category) {
    if (!category) return birdWatchingTours;
    return birdWatchingTours.filter(tour => tour.category === category);
}

// Setup accordions for day details
function setupAccordions() {
    // Day accordions
    const dayHeaders = document.querySelectorAll('.day-accordion-header');
    dayHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('svg');
            if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                content.style.maxHeight = '0';
                icon.classList.remove('rotate-180');
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.classList.add('rotate-180');
            }
        });
    });
}

// Initialize slider for tour images
function initSliders() {
    document.querySelectorAll('.tour-slideshow').forEach(container => {
        const slides = container.querySelectorAll('img');
        if (slides.length <= 1) return; // only 1 image, no slider needed

        let current = 0;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
        };

        showSlide(current);

        const prevBtn = container.querySelector('.prev');
        const nextBtn = container.querySelector('.next');

        const nextSlide = () => {
            current = (current + 1) % slides.length;
            showSlide(current);
        };
        const prevSlide = () => {
            current = (current - 1 + slides.length) % slides.length;
            showSlide(current);
        };

        prevBtn?.addEventListener('click', e => {
            e.stopPropagation();
            prevSlide();
            resetAutoplay();
        });

        nextBtn?.addEventListener('click', e => {
            e.stopPropagation();
            nextSlide();
            resetAutoplay();
        });

        // autoplay every 3 seconds
        let autoplayInterval = setInterval(nextSlide, 3000);

        function resetAutoplay() {
            clearInterval(autoplayInterval);
            autoplayInterval = setInterval(nextSlide, 3000);
        }
    });
}

// Render tour sidebar
function renderTourSidebar() {
    const sidebar = document.getElementById('tour-sidebar');
    sidebar.innerHTML = '';
    
    const params = getUrlParams();
    const category = params.category || null;
    const filteredTours = filterToursByCategory(category);

    if (filteredTours.length === 0) {
        sidebar.innerHTML = `
            <div class="text-center py-4">
                <p class="text-gray-600">No tours found</p>
            </div>
        `;
        return;
    }

    filteredTours.forEach((tour, index) => {
        const tourElement = document.createElement('div');
        tourElement.className = `tour-card bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${index === 0 ? 'active' : ''}`;
        tourElement.setAttribute('data-tour-id', tour.id);
        
        // Get first image for thumbnail
        const thumbnailImage = Array.isArray(tour.image) ? tour.image[0] : tour.image;
        
        tourElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 truncate">${tour.title}</h3>
                    <p class="text-xs text-gray-500">${tour.duration}</p>
                    <p class="text-xs text-gray-400">${tour.id}</p>
                </div>
            </div>
        `;
        
        tourElement.addEventListener('click', () => {
            // Remove active class from all tour cards
            document.querySelectorAll('.tour-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active class to clicked tour card
            tourElement.classList.add('active');
            
            // Render main tour content
            renderMainTour(tour);
            
            // Update URL without page reload
            const url = new URL(window.location);
            url.searchParams.set('tour', tour.id);
            window.history.pushState({}, '', url);
        });
        
        sidebar.appendChild(tourElement);
    });
}

// Render main tour content
function renderMainTour(tour) {
    const mainContent = document.getElementById('tour-main');
    
    // Add fade effect
    mainContent.classList.remove('fade-in');
    void mainContent.offsetWidth; // Trigger reflow
    mainContent.classList.add('fade-in');
    
    // Get tour images
    const tourImages = Array.isArray(tour.image)
        ? tour.image
        : (tour.image ? [tour.image] : ['https://via.placeholder.com/400x300?text=No+Image']);

    mainContent.innerHTML = `
        <div class="tour-image-container overflow-hidden">
            <div class="tour-slideshow relative">
                ${tourImages.map((img, index) => `
                    <img src="${img}" alt="${tour.title} image ${index+1}" 
                        class="w-full h-64 md:h-80 object-cover ${index===0?'block':'hidden'}">
                `).join('')}
                ${tourImages.length > 1 ? `
                    <button class="prev absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded">‹</button>
                    <button class="next absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded">›</button>
                ` : ''}
            </div>
        </div>
        <div class="p-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h2 class="text-2xl font-bold text-gray-800">${tour.title}</h2>
                <div class="mt-2 md:mt-0 flex items-center space-x-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        ${tour.duration}
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ${tour.transport}
                    </span>
                </div>
            </div>
            
            <div class="mb-6">
                <p class="text-gray-600 leading-relaxed">${tour.description}</p>
            </div>
            
            <div class="border-t border-gray-200 pt-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Tour Itinerary</h3>
                <div class="space-y-4" id="days-container-${tour.id}">
                    <!-- Days will be populated here -->
                </div>
            </div>
            
            <div class="mt-8 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 pt-6">
                <div class="mb-4 sm:mb-0">
                    <p class="text-lg font-semibold text-gray-800">Tour Code: ${tour.id}</p>
                </div>
            </div>
        </div>
    `;
    
    // Populate days
    (tour.days || []).forEach(day => {
        const daysContainer = document.getElementById(`days-container-${tour.id}`);
        const dayElement = document.createElement('div');
        dayElement.className = 'day-accordion-item border border-gray-200 rounded-lg overflow-hidden';
        dayElement.innerHTML = `
            <div class="day-accordion-header flex justify-between items-center p-4 bg-gray-50 cursor-pointer">
                <div class="flex items-center">
                    <span class="bg-red-100 text-red-800 text-sm font-medium mr-3 px-2.5 py-0.5 rounded">Day ${day.day}</span>
                    <span class="text-gray-700">${day.title}</span>
                </div>
                <svg class="h-5 w-5 text-gray-500 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="day-accordion-content">
                <div class="p-4 bg-white">
                    <p class="text-gray-600 mb-4">${day.description}</p>
                    <div class="flex justify-center">
                        <img src="${day.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${day.title}" class="rounded-lg max-w-full h-auto max-h-64 object-cover">
                    </div>
                </div>
            </div>
        `;
        daysContainer.appendChild(dayElement);
    });
    
    // Initialize functionality
    setupAccordions();
    initSliders();
    
    // Open first day by default
    setTimeout(() => {
        const firstDayHeader = mainContent.querySelector('.day-accordion-header');
        if (firstDayHeader) {
            firstDayHeader.click();
        }
    }, 100);
}

// Initialize page with sidebar layout
function initializePage() {
    const params = getUrlParams();
    const category = params.category || null;
    const tourId = params.tour || null;

    // Update page title
    const pageTitle = document.querySelector('h1');
    pageTitle.textContent = category ? getCategoryDisplayName(category) : 'Tour Packages';

    // Render sidebar
    renderTourSidebar();

    // Find and render the selected tour or first tour
    const filteredTours = filterToursByCategory(category);
    
    if (filteredTours.length === 0) {
        document.getElementById('tour-main').innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">No tours found</h3>
                <p class="text-gray-600">There are no tours available for the selected category.</p>
                <a href="./tourfinal.html" class="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                    View All Tours
                </a>
            </div>
        `;
        return;
    }

    // Find the tour to display
    let tourToDisplay;
    if (tourId) {
        tourToDisplay = filteredTours.find(tour => tour.id === tourId);
    }
    if (!tourToDisplay && filteredTours.length > 0) {
        tourToDisplay = filteredTours[0];
    }

    if (tourToDisplay) {
        renderMainTour(tourToDisplay);
        
        // Activate the corresponding sidebar card
        setTimeout(() => {
            const activeCard = document.querySelector(`[data-tour-id="${tourToDisplay.id}"]`);
            if (activeCard) {
                document.querySelectorAll('.tour-card').forEach(card => {
                    card.classList.remove('active');
                });
                activeCard.classList.add('active');
            }
        }, 100);
    }
}

// Handle browser back/forward navigation
window.addEventListener('popstate', function(event) {
    initializePage();
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});