document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const investmentAmountInput = document.getElementById('investment-amount');
  const investmentTermSelect = document.getElementById('investment-term');
  const customDurationContainer = document.getElementById('custom-duration-container');
  const customDurationInput = document.getElementById('custom-duration');
  const calculateBtn = document.getElementById('calculate-btn');
  const sofiposContainer = document.getElementById('sofipos-container');
  const resultsSection = document.getElementById('results-section');
  const resultsTableBody = document.getElementById('results-table-body');
  const eligibleCountElement = document.getElementById('eligible-count');
  const selectAllBtn = document.getElementById('select-all');
  const deselectAllBtn = document.getElementById('deselect-all');
  const toggleAllSofiposBtn = document.getElementById('toggle-all-sofipos');
  const chartSection = document.getElementById('chart-section');
  const darkModeToggleBtn = document.getElementById('dark-mode-toggle-btn');
  
  // Global variables
  let sofiposData = [];
  let eligibleSofipos = [];
  let earningsChart = null;
  let showAllSofipos = false;
  
  // Check for saved theme preference or use system preference
  if (localStorage.getItem('darkMode') === 'true' || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches && 
       localStorage.getItem('darkMode') === null)) {
    document.documentElement.classList.add('dark');
  }
  
  // Dark mode toggle event listener
  if (darkModeToggleBtn) {
    darkModeToggleBtn.addEventListener('click', function() {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      }
      
      // Update chart if it exists
      if (earningsChart) {
        updateChartTheme();
      }
    });
  } else {
    console.warn('Dark mode toggle button not found in the DOM');
  }
  
  // Format currency function
  function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  // Fetch SOFIPO data
  fetchSofiposData();
  
  // Event Listeners
  if (investmentTermSelect) {
    investmentTermSelect.addEventListener('change', function() {
      handleTermChange();
      // Auto-refresh chart and table when term changes
      calculateReturns();
    });
  }
  
  if (investmentAmountInput) {
    investmentAmountInput.addEventListener('input', function() {
      updateSofiposDisplay();
      calculateReturns();
    });
  }
  
  if (customDurationInput) {
    customDurationInput.addEventListener('input', function() {
      if (investmentTermSelect && investmentTermSelect.value === 'f') {
        updateSofiposDisplay();
        calculateReturns();
      }
    });
  }
  
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateReturns);
  }
  
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', selectAllSofipos);
  }
  
  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', deselectAllSofipos);
  }
  
  if (toggleAllSofiposBtn) {
    toggleAllSofiposBtn.addEventListener('click', toggleAllSofiposVisibility);
  }
  
  // Functions
  function fetchSofiposData() {
    fetch('/api/sofipos')
      .then(response => response.json())
      .then(data => {
        sofiposData = data;
        console.log('SOFIPO data loaded:', sofiposData);
        // Trigger initial display with pre-selected 7 days
        updateSofiposDisplay();
        // Initialize chart and table with default data
        calculateReturns();
      })
      .catch(error => {
        console.error('Error fetching SOFIPO data:', error);
      });
  }
  
  function handleTermChange() {
    if (!investmentTermSelect || !customDurationContainer) return;
    
    const selectedTerm = investmentTermSelect.value;
    
    if (selectedTerm === 'f') {
      customDurationContainer.classList.remove('hidden');
    } else {
      customDurationContainer.classList.add('hidden');
    }
    
    updateSofiposDisplay();
  }
  
  function updateSofiposDisplay() {
    if (!investmentAmountInput || !investmentTermSelect || !sofiposContainer || !eligibleCountElement) return;
    
    const amount = parseFloat(investmentAmountInput.value);
    const term = investmentTermSelect.value;
    
    if (!term) {
      sofiposContainer.innerHTML = `
        <p class="text-gray-500 dark:text-gray-400 text-center col-span-3 py-8">
          Selecciona un plazo para ver las SOFIPOS disponibles
        </p>
      `;
      eligibleCountElement.textContent = '0';
      return;
    }
    
    // Filter eligible SOFIPOs
    eligibleSofipos = sofiposData.filter(sofipo => {
      // Check if amount is within range
      const minAmount = parseFloat(sofipo.minAmount);
      const maxAmount = parseFloat(sofipo.maxAmount);
      const isAmountValid = amount >= minAmount && amount <= maxAmount;
      
      // Check if term is supported
      let isTermSupported = false;
      if (term === 'f') {
        isTermSupported = sofipo.duration.includes('f');
      } else {
        isTermSupported = sofipo.duration.split(',').map(t => t.trim()).includes(term);
      }
      
      return isAmountValid && isTermSupported;
    });
    
    // Update the count of eligible SOFIPOs
    eligibleCountElement.textContent = eligibleSofipos.length;
    
    renderSortedSofipos(term, amount);
  }
  
  function getInterestRate(sofipo, term) {
    if (term === 'f') {
      return parseFloat(sofipo.intRateF) || 0;
    } else {
      switch(term) {
        case '7': return parseFloat(sofipo.intRate7) || 0;
        case '30': return parseFloat(sofipo.intRate30) || 0;
        case '60': return parseFloat(sofipo.intRate60) || 0;
        case '90': return parseFloat(sofipo.intRate90) || 0;
        case '120': return parseFloat(sofipo.intRate120) || 0;
        case '150': return parseFloat(sofipo.intRate150) || 0;
        case '180': return parseFloat(sofipo.intRate180) || 0;
        case '210': return parseFloat(sofipo.intRate210) || 0;
        case '240': return parseFloat(sofipo.intRate240) || 0;
        case '270': return parseFloat(sofipo.intRate270) || 0;
        case '360': return parseFloat(sofipo.intRate360) || 0;
        case '540': return parseFloat(sofipo.intRate540) || 0;
        case '720': return parseFloat(sofipo.intRate720) || 0;
        case '1080': return parseFloat(sofipo.intRate1080) || 0;
        case '1440': return parseFloat(sofipo.intRate1440) || 0;
        case '1800': return parseFloat(sofipo.intRate1800) || 0;
        default: return 0;
      }
    }
  }
  
  function calculateEarnings(amount, interestRate, duration) {
    return amount * (interestRate / 100) * (duration / 365);
  }
  
  function calculateGAT(interestRate) {
    // GAT is essentially the annual interest rate
    return interestRate;
  }
  
  function formatDurations(durationsString) {
    if (!durationsString) return '';
    
    const durations = durationsString.split(',').map(d => d.trim());
    
    // Format numeric durations
    const numericDurations = durations
      .filter(d => d !== 'f')
      .map(d => `${d} días`);
    
    // Check if "A la vista" is included
    const hasALaVista = durations.includes('f');
    
    // Combine formatted durations
    let result = numericDurations.join(', ');
    
    // Add "A la vista" if present
    if (hasALaVista) {
      if (result) {
        result += ' y A la vista';
      } else {
        result = 'A la vista';
      }
    }
    
    return result;
  }
  
  function renderSortedSofipos(term, amount) {
    if (!sofiposContainer) return;
    
    sofiposContainer.innerHTML = '';
    
    if (sofiposData.length === 0) {
      sofiposContainer.innerHTML = `
        <p class="text-gray-500 dark:text-gray-400 text-center col-span-3 py-8">
          No hay datos de SOFIPOS disponibles
        </p>
      `;
      if (eligibleCountElement) {
        eligibleCountElement.textContent = '0';
      }
      return;
    }
    
    // Prepare data for sorting
    const sofiposWithMetadata = sofiposData.map((sofipo, index) => {
      // Check if this SOFIPO is eligible
      const minAmount = parseFloat(sofipo.minAmount) || 0;
      const maxAmount = parseFloat(sofipo.maxAmount) || Infinity;
      const isAmountValid = amount >= minAmount && amount <= maxAmount;
      
      let isTermSupported = false;
      if (term === 'f') {
        isTermSupported = sofipo.duration && sofipo.duration.includes('f');
      } else {
        isTermSupported = sofipo.duration && sofipo.duration.split(',').map(t => t.trim()).includes(term);
      }
      
      const isEligible = isAmountValid && isTermSupported;
      
      // Calculate potential earnings for sorting
      let interestRate = getInterestRate(sofipo, term);
      let duration = term === 'f' ? 
        (customDurationInput && customDurationInput.value ? parseInt(customDurationInput.value) : 365) : 
        parseInt(term);
      
      const earnings = isEligible ? calculateEarnings(amount, interestRate, duration) : 0;
      
      // Create tooltip message for ineligible SOFIPOs
      let tooltipMessage = '';
      if (!isAmountValid) {
        tooltipMessage = `Monto fuera de rango (Min: ${formatCurrency(minAmount)}, Max: ${maxAmount === Infinity ? 'Sin límite' : formatCurrency(maxAmount)})`;
      }
      if (!isTermSupported) {
        tooltipMessage = tooltipMessage ? 
          `${tooltipMessage} y plazo no soportado` : 
          'Plazo no soportado';
      }
      
      return {
        sofipo,
        index,
        isEligible,
        earnings,
        tooltipMessage
      };
    });
    
    // Sort SOFIPOs: eligible ones by earnings (descending), then ineligible ones alphabetically
    sofiposWithMetadata.sort((a, b) => {
      if (a.isEligible && b.isEligible) {
        // Both eligible, sort by earnings
        return b.earnings - a.earnings;
      } else if (a.isEligible) {
        // a is eligible, b is not, a comes first
        return -1;
      } else if (b.isEligible) {
        // b is eligible, a is not, b comes first
        return 1;
      } else {
        // Both ineligible, sort alphabetically
        return a.sofipo.financialInstitution.localeCompare(b.sofipo.financialInstitution);
      }
    });
    
    // Filter out ineligible SOFIPOs if not showing all
    const sofiposToDisplay = showAllSofipos ? 
      sofiposWithMetadata : 
      sofiposWithMetadata.filter(item => item.isEligible);
    
    // Render sorted SOFIPOs
    if (sofiposToDisplay.length === 0) {
      sofiposContainer.innerHTML = `
        <p class="text-gray-500 dark:text-gray-400 text-center col-span-3 py-8">
          No hay SOFIPOS disponibles para los criterios seleccionados
        </p>
      `;
      return;
    }
    
    sofiposToDisplay.forEach(({ sofipo, index, isEligible, tooltipMessage }) => {
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = `checkbox-container relative ${isEligible ? '' : 'disabled tooltip'} dark:bg-gray-700 dark:border-gray-600`;
      
      let checkboxHtml = `
        <input type="checkbox" id="sofipo-${index}" class="sofipo-checkbox" 
          data-index="${index}" ${isEligible ? 'checked' : 'disabled'}>
        <label for="sofipo-${index}" class="flex flex-col">
          <span class="font-medium dark:text-white">${sofipo.financialInstitution}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">${sofipo.productName}</span>
        </label>
      `;
      
      if (!isEligible) {
        checkboxHtml += `<span class="tooltip-text">${tooltipMessage}</span>`;
      }
      
      checkboxContainer.innerHTML = checkboxHtml;
      sofiposContainer.appendChild(checkboxContainer);
    });
    
    // Add event listeners to checkboxes to update chart on change
    document.querySelectorAll('.sofipo-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', updateEarningsChart);
    });
  }
  
  function toggleAllSofiposVisibility() {
    showAllSofipos = !showAllSofipos;
    if (toggleAllSofiposBtn) {
      toggleAllSofiposBtn.textContent = showAllSofipos ? 
        'Mostrar solo SOFIPOS disponibles' : 
        'Mostrar todas las SOFIPOS';
    }
    updateSofiposDisplay();
  }
  
  function selectAllSofipos() {
    const checkboxes = document.querySelectorAll('.sofipo-checkbox:not([disabled])');
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
    });
    updateEarningsChart();
  }
  
  function deselectAllSofipos() {
    const checkboxes = document.querySelectorAll('.sofipo-checkbox:not([disabled])');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    updateEarningsChart();
  }
  
  function calculateReturns() {
    if (!investmentAmountInput || !investmentTermSelect || !resultsTableBody) return;
    
    const amount = parseFloat(investmentAmountInput.value);
    const term = investmentTermSelect.value;
    let duration;
    
    if (!amount || !term) {
      alert('Por favor ingresa el monto y selecciona un plazo');
      return;
    }
    
    if (term === 'f') {
      duration = customDurationInput ? parseInt(customDurationInput.value) || 365 : 365;
    } else {
      duration = parseInt(term);
    }
    
    const selectedSofipos = [];
    const checkboxes = document.querySelectorAll('.sofipo-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
      const index = parseInt(checkbox.dataset.index);
      selectedSofipos.push(sofiposData[index]);
    });
    
    // MODIFIED: Replaced the logic to use eligible SOFIPOs with a simple check
    // If no SOFIPOs are selected or eligible, we'll show the "No hay SOFIPOS disponibles" message
    if (selectedSofipos.length === 0) {
      displayNoSofiposMessage();
      return;
    }
    
    const results = selectedSofipos.map(sofipo => {
      let interestRate = getInterestRate(sofipo, term);
      
      // Calculate estimated earnings
      const earnings = calculateEarnings(amount, interestRate, duration);
      const finalAmount = amount + earnings;
      const gat = calculateGAT(interestRate);
      
      return {
        financialInstitution: sofipo.financialInstitution,
        productName: sofipo.productName,
        interestRate: interestRate,
        gat: gat,
        earnings: earnings,
        finalAmount: finalAmount,
        productUrl: sofipo.productUrl,
        notes: sofipo.notes,
        duration: sofipo.duration,
        minAmount: sofipo.minAmount,
        maxAmount: sofipo.maxAmount
      };
    });
    
    // Sort results by earnings (highest first)
    results.sort((a, b) => b.earnings - a.earnings);
    
    displayResults(results, amount, term, duration);
    updateEarningsChart();
  }
  
  // New function to display the "No hay SOFIPOS disponibles" message
  function displayNoSofiposMessage() {
    if (resultsTableBody) {
      resultsTableBody.innerHTML = `
        <tr>
          <td colspan="11" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
            No hay SOFIPOS disponibles para los criterios seleccionados
          </td>
        </tr>
      `;
    }
    
    // Also clear the chart
    if (earningsChart) {
      earningsChart.destroy();
      earningsChart = null;
    }
  }
  
  function displayResults(results, amount, term, duration) {
    if (!resultsTableBody) return;
    
    resultsTableBody.innerHTML = '';
    
    if (results.length === 0) {
      resultsTableBody.innerHTML = `
        <tr>
          <td colspan="11" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
            No hay SOFIPOS disponibles para los criterios seleccionados
          </td>
        </tr>
      `;
      return;
    }
    
    // Format duration display
    let durationDisplay;
    if (term === 'f') {
      durationDisplay = `${duration} días (A la vista)`;
    } else {
      durationDisplay = `${duration} días`;
    }
    
    results.forEach(result => {
      const row = document.createElement('tr');
      row.className = "dark:bg-gray-800";
      
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="font-medium text-gray-900 dark:text-gray-100">${result.financialInstitution}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-gray-100">${result.productName}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-gray-100">${formatCurrency(amount)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-gray-100">${result.interestRate.toFixed(2)}%</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-gray-100">${durationDisplay}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-gray-100">${formatCurrency(result.earnings)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${formatCurrency(result.finalAmount)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-gray-100">${formatDurations(result.duration)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-gray-100">${formatCurrency(result.minAmount)} - ${result.maxAmount >= 1000000000 ? 'Sin límite' : formatCurrency(result.maxAmount)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900 dark:text-gray-100">${result.notes}</div>
        </td>
        <td class="hidden px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          <a href="${result.productUrl}" target="_blank" class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">Ver detalles</a>
        </td>
      `;
      
      resultsTableBody.appendChild(row);
    });
  }
  
  function updateEarningsChart() {
    if (!investmentAmountInput || !investmentTermSelect) return;
    
    const amount = parseFloat(investmentAmountInput.value);
    const term = investmentTermSelect.value;
    
    if (!amount || !term) {
      return;
    }
    
    let duration;
    if (term === 'f') {
      duration = customDurationInput ? parseInt(customDurationInput.value) || 365 : 365;
    } else {
      duration = parseInt(term);
    }
    
    const selectedSofipos = [];
    const checkboxes = document.querySelectorAll('.sofipo-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
      const index = parseInt(checkbox.dataset.index);
      selectedSofipos.push(sofiposData[index]);
    });
    
    // MODIFIED: Replaced the logic to use eligible SOFIPOs with a simple check
    // If no SOFIPOs are selected, we'll clear the chart
    if (selectedSofipos.length === 0) {
      if (earningsChart) {
        earningsChart.destroy();
        earningsChart = null;
      }
      return;
    }
    
    const chartData = selectedSofipos.map(sofipo => {
      const interestRate = getInterestRate(sofipo, term);
      const earnings = calculateEarnings(amount, interestRate, duration);
      
      return {
        institution: sofipo.financialInstitution,
        product: sofipo.productName,
        earnings: earnings
      };
    });
    
    // Sort by earnings (highest first)
    chartData.sort((a, b) => b.earnings - a.earnings);
    
    // Prepare data for Chart.js
    const labels = chartData.map(item => `${item.institution} - ${item.product}`);
    const data = chartData.map(item => item.earnings);
    
    // Generate colors based on the number of items
    const colors = generateColors(chartData.length);
    
    // Create or update chart
    createOrUpdateChart(labels, data, colors);
  }
  
  function updateChartTheme() {
    if (!earningsChart) return;
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Update chart text color based on theme
    earningsChart.options.scales.x.ticks.color = isDarkMode ? '#D1D5DB' : '#6B7280';
    earningsChart.options.scales.y.ticks.color = isDarkMode ? '#D1D5DB' : '#6B7280';
    earningsChart.options.scales.x.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    earningsChart.options.scales.y.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update chart
    earningsChart.update();
  }
  
  function createOrUpdateChart(labels, data, colors) {
    const canvas = document.getElementById('earnings-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (earningsChart) {
      earningsChart.destroy();
    }
    
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#D1D5DB' : '#6B7280';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Calculate dynamic height based on number of items
    // Set a minimum height and add height per item
    const baseHeight = 300; // Minimum height in pixels
    const heightPerItem = 40; // Additional height per item in pixels
    const dynamicHeight = Math.max(baseHeight, labels.length * heightPerItem);
    
    // Set the canvas container height
    const chartContainer = canvas.parentElement;
    if (chartContainer) {
      chartContainer.style.height = `${dynamicHeight}px`;
    }
    
    // Create new chart
    earningsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Rendimiento estimado (MXN)',
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                // Use the formatCurrency function to ensure consistent formatting with 2 decimal places
                return formatCurrency(context.raw);
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              callback: function(value) {
                return formatCurrency(value);
              }
            },
            grid: {
              color: gridColor
            }
          },
          y: {
            ticks: {
              color: textColor,
              callback: function(value, index) {
                const label = this.getLabelForValue(value);
                // Truncate long labels
                return label.length > 25 ? label.substr(0, 22) + '...' : label;
              }
            },
            grid: {
              color: gridColor
            }
          }
        },
        // Add plugin to display earnings inside bars
        plugins: [{
          afterDraw: function(chart) {
            var ctx = chart.ctx;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
            
            chart.data.datasets.forEach(function(dataset, i) {
              var meta = chart.getDatasetMeta(i);
              if (!meta.hidden) {
                meta.data.forEach(function(element, index) {
                  // Only draw value if bar is long enough
                  if (dataset.data[index] > chart.scales.x.min + (chart.scales.x.max - chart.scales.x.min) * 0.05) {
                    var dataValue = dataset.data[index];
                    var position = element.getCenterPoint();
                    
                    // Position text at 80% of the bar width to ensure it's inside
                    var xPos = element.x - (element.width * 0.2);
                    
                    ctx.fillText(formatCurrency(dataValue), xPos, position.y);
                  }
                });
              }
            });
          }
        }]
      }
    });
  }
  
  function generateColors(count) {
    const baseColors = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 205, 86, 0.7)',
      'rgba(201, 203, 207, 0.7)',
      'rgba(255, 99, 71, 0.7)',
      'rgba(46, 204, 113, 0.7)',
      'rgba(142, 68, 173, 0.7)'
    ];
    
    // If we have more items than base colors, we'll repeat colors
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
  }
});
