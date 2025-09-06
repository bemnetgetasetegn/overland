// ==============================
// tours-slider.js
// Full tours + image slider logic
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

// Setup accordions
function setupAccordions() {
    // Tour accordions
    const tourHeaders = document.querySelectorAll('.tour-accordion-header');
    tourHeaders.forEach(header => {
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

// Initialize slider for all tours
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

// Render tours
function renderTours() {
    const toursContainer = document.getElementById('tours-container');
    toursContainer.innerHTML = '';

    const params = getUrlParams();
    const category = params.category || null;
    const tourId = params.tour || null;

    // Update page title
    const pageTitle = document.querySelector('h1');
    pageTitle.textContent = category ? getCategoryDisplayName(category) : 'Tour Packages';

    const filteredTours = filterToursByCategory(category);

    if (filteredTours.length === 0) {
        toursContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">No tours found</h3>
                <p class="text-gray-600">There are no tours available for the selected category.</p>
                <a href="./pages/tour.html" class="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                    View All Tours
                </a>
            </div>
        `;
        return;
    }

    filteredTours.forEach(tour => {
        // ✅ Use tour.image array or fallback
        const tourImages = Array.isArray(tour.image)
            ? tour.image
            : (tour.image ? [tour.image] : ['https://via.placeholder.com/400x300?text=No+Image']);

        const tourElement = document.createElement('div');
        tourElement.className = 'bg-white rounded-lg shadow-md overflow-hidden tour-accordion-item';
        tourElement.id = `tour-${tour.id}`;

        const shouldExpand = tourId === tour.id;

        tourElement.innerHTML = `
            <div class="tour-accordion-header flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 cursor-pointer">
                <div class="w-full md:w-1/3 mb-4 md:mb-0 relative">
                    <div class="tour-slideshow relative overflow-hidden rounded-lg">
                        ${tourImages.map((img, index) => `
                            <img src="${img}" alt="${tour.title} image ${index+1}" 
                                class="w-full h-48 md:h-56 object-cover ${index===0?'block':'hidden'}">
                        `).join('')}
                        ${tourImages.length > 1 ? `
                            <button class="prev absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded">‹</button>
                            <button class="next absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded">›</button>
                        ` : ''}
                    </div>
                </div>
                <div class="flex-1 md:px-6">
                    <h2 class="text-xl font-bold text-[#ee3054]">${tour.title}</h2>
                    <p class="text-sm text-gray-600 mt-1">Tour Code: ${tour.id} | Duration: ${tour.duration}</p>
                    <p class="text-sm text-gray-600">Transport: ${tour.transport}</p>
                </div>
                <svg class="h-5 w-5 transform transition-transform mt-4 md:mt-0 ${shouldExpand ? 'rotate-180' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="tour-accordion-content overflow-y-auto transition-all duration-300 ${shouldExpand ? '' : 'max-h-0'}" ${shouldExpand ? 'style="max-height: ' + ((tour.days?.length || 0) * 200 + 400) + 'px;"' : ''}>
                <div class="p-4 md:p-6 border-t border-gray-200">
                    <div class="flex flex-col md:flex-row gap-4 md:gap-6 mb-6">
                        <div class="w-full">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Tour Overview</h3>
                            <p class="text-gray-600">${tour.description}</p>
                        </div>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Itinerary</h3>
                    <div class="space-y-3" id="days-container-${tour.id}">
                        <!-- Days will be populated here -->
                    </div>
                </div>
            </div>
        `;

        toursContainer.appendChild(tourElement);

        // Populate days
        (tour.days || []).forEach(day => {
            const daysContainer = document.getElementById(`days-container-${tour.id}`);
            const dayElement = document.createElement('div');
            dayElement.className = 'day-accordion-item bg-gray-50 rounded-lg';
            dayElement.innerHTML = `
                <div class="day-accordion-header flex justify-between items-center p-3 md:p-4 cursor-pointer">
                    <div class="flex items-center">
                        <span class="bg-red-100 text-red-800 text-sm font-medium mr-3 px-2.5 py-0.5 rounded">Day ${day.day}</span>
                        <span class="text-gray-700 text-sm md:text-base">${day.title}</span>
                    </div>
                    <svg class="h-4 w-4 transform transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="day-accordion-content overflow-hidden transition-all duration-300 max-h-0">
                    <div class="p-3 md:p-4 border-t border-gray-200">
                        <img src="${day.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${day.title}" class="w-full h-40 object-cover rounded mb-2">
                        <p class="text-gray-600 text-sm md:text-base">${day.description}</p>
                    </div>
                </div>
            `;
            daysContainer.appendChild(dayElement);
        });

        if (shouldExpand) {
            setTimeout(() => {
                tourElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    });

    setupAccordions();
    initSliders();
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderTours();
});
