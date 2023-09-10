var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// In mouseover event
tooltip.transition()
    .duration(200)
    .style("opacity", .9);
tooltip.html(`Value: ${d.value}`)
    .style("left", `${(d3.event.pageX)}px`)
    .style("top", `${(d3.event.pageY - 28)}px`);

// In mouseout event
tooltip.transition()
    .duration(500)
    .style("opacity", 0);

let buttons = document.querySelectorAll("#indicatorButtons button");
buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
        buttons.forEach((btn) => {
            btn.classList.remove("selected-button");
        });
        event.currentTarget.classList.add("selected-button");
    });
});


function resize() {
    var margin = { top: 10, right: 30, bottom: 30, left: 30 },
        width = parseInt(d3.select("#canvas").style("width"), 10) - margin.left - margin.right,
        height = parseInt(d3.select("#canvas").style("height"), 10) - margin.top - margin.bottom;
    d3.select("#econChart").select("svg").attr("width", 'calc(100% - 2 * ' + margin.left + 'px)').attr("height", height + margin.top + margin.bottom);
    d3.select("#gdpChart").select("svg").attr("width", 'calc(100% - 2 * ' + margin.right + 'px)').attr("height", height + margin.top + margin.bottom);
}




// Fetch sectors and their indicators
function fetchSectors(countryCode) {
    fetch(`http://localhost:3001/sectors/${countryCode}`)
        .then(response => response.json())
        .then(data => {
            const dropdown = document.querySelector('#sectorDropdown');
            const buttonContainer = document.querySelector('#indicatorButtons');
            populateDropdownAndButtons(data, dropdown, buttonContainer);
        })
        .catch(error => console.error('Error fetching sectors:', error));
}

function drawGraph(data) {
    // Clear existing chart
    d3.select("#sectorGraph").selectAll("*").remove();

    // Get the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 50, left: 60 },
        width = parseInt(d3.select("#sectorG").style("width"), 10) - margin.left - margin.right,
        height = parseInt(d3.select("#sectorG").style("height"), 10) - margin.top - margin.bottom;

    // Append the svg object to the sectorGraph div
    var svg = d3.select("#sectorGraph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.year; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .attr("color", "white");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return +d.value; })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("color", "white")
        .selectAll("text")
        .attr("dx", "-.8em");

    // Add the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.year); })
            .y(function (d) { return y(d.value); })
        )

    // Add X Axis label
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 30) + ")")
        .style("text-anchor", "middle")
        .attr("font-family", "Montserrat")
        .attr("font-size", "16px")
        .attr("fill", "#edf0f1")
        .text("Year");

    // Add Y Axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("font-family", "Montserrat")
        .attr("font-size", "16px")
        .attr("fill", "#edf0f1")
        .text("Value");

}

// Fetch data for a sector and its indicator for a given country
function fetchSectorData(countryId, sectorId, indicatorId) {
    countryId = countryId || 'CN';  // Default to 'CN' if no countryId is provided

    fetch(`http://localhost:3001/sectorData/${countryId}/${sectorId}/${indicatorId}`)
        .then(response => response.json())
        .then(data => drawGraph(data))  // You'll create this function in a later step
        .catch(error => console.error('Error fetching sector data:', error));
}

// Populate dropdown and buttons with fetched data
// Populate dropdown and buttons with fetched data
function populateDropdownAndButtons(data, dropdown, buttonContainer) {
    // Clear dropdown and button container
    dropdown.innerHTML = '';
    buttonContainer.innerHTML = '';

    // Populate dropdown with sectors
    data.forEach(sector => {
        const option = document.createElement('option');
        option.value = sector.sectorId;
        option.innerText = sector.sectorName;
        dropdown.appendChild(option);
    });

    // Add event listener to dropdown to update buttons when value changes
    dropdown.addEventListener('change', (event) => {
        // Clear button container
        buttonContainer.innerHTML = '';

        // Find selected sector
        const selectedSector = data.find(sector => sector.sectorId === event.target.value);

        // Populate button container with indicators of selected sector
        selectedSector.indicators.forEach(indicator => {
            const button = document.createElement('button');
            button.value = indicator.indicatorId;
            button.innerText = indicator.indicatorName;
            button.addEventListener('click', (event) => {
                // Fetch and draw graph when button is clicked
                const selectedCountry = data.countryId;  // Replace with selected country if available
                fetchSectorData(selectedCountry, selectedSector.sectorId, event.target.value);
            });
            buttonContainer.appendChild(button);
        });
    });

    // Manually dispatch a change event to the dropdown to populate the buttons for the initially selected sector
    dropdown.dispatchEvent(new Event('change'));
}

// Call fetchSectors on page load to populate dropdown and buttons
fetchSectors();









function displayGDP(countryCode) {
    console.log('Fetching GDP data for', countryCode);

    d3.json(`http://localhost:3001/economicData/${countryCode}`).then(data => {
        // Assuming data comes in the required format
        // Clear existing chart
        d3.select("#gdpChart").selectAll("*").remove();

        // Set the dimensions and margins of the graph
        var margin = { top: 10, right: 10, bottom: 50, left: 60 },
            width = parseInt(d3.select("#gdpChart").style("width"), 10) - margin.left - margin.right,
            height = parseInt(d3.select("#gdpChart").style("height"), 10) - margin.top - margin.bottom;

        // Append the svg object to the canvas div
        var svg = d3.select("#gdpChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Format the data for GDP
        var gdpData = data.map(function (d) {
            return { year: d.year, value: +d.GDP / 1e9 }; // Convert to billions
        });

        // Create the X axis:
        var x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d => d % 2 === 0 ? d : ''));

        // Add X axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.bottom)
            .style("fill", "black")
            .text("Year");

        // Create the Y axis:
        var y = d3.scaleLinear()
            .domain([0, d3.max(gdpData, d => d.value)])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d => d + 'B')); // append 'B' for billions

        // Add Y axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("fill", "white")
            .attr("transform", "rotate(-90)")
            .text("GDP (in billions)");

        // Create a function that generates the line
        var line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.value));

        // Use this function to draw the line
        svg.append("path")
            .datum(gdpData)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("d", line);

    }).catch(error => {
        console.error("Error fetching or displaying GDP data:", error);
    });
}



function displayEconData(countryCode) {
    console.log('Fetching economic data for', countryCode);

    d3.json(`http://localhost:3001/economicData/${countryCode}`).then(data => {
        // Assuming data comes in the required format

        // Clear existing chart
        d3.select("#econChart").selectAll("*").remove();

        // Set the dimensions and margins of the graph
        var margin = { top: 30, right: 0, bottom: 40, left: 40 },
            width = parseInt(d3.select("#econChart").style("width"), 10) - margin.left - margin.right,
            height = parseInt(d3.select("#econChart").style("height"), 10) - margin.top - margin.bottom;

        // Append the svg object to the canvas div
        var svg = d3.select("#econChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // List of groups
        var allGroup = ["inflation", "unemployment"]

        // Format the data
        var dataReady = allGroup.map(function (grpName) {
            return {
                name: grpName,
                values: data.map(function (d) {
                    return { year: d.year, value: +d[grpName] };
                })
            };
        });

        // A color scale: one color for each group
        var myColor = d3.scaleOrdinal()
            .domain(allGroup)
            .range(['#77b0d4', '#6564DB']);

        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(d => d % 2 === 0 ? d : ''))
            .attr("color", "white");

        // Add X axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .style("fill", "white")
            .text("Year");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(dataReady, d => d3.max(d.values, v => v.value))])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        // Add Y axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("y", -margin.left)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("fill", "white")
            .attr("transform", "rotate(-90)")
            .text("Value");

        // Add the lines
        var line = d3.line()
            .x(function (d) { return x(+d.year) })
            .y(function (d) { return y(+d.value) });

        svg.selectAll("myLines")
            .data(dataReady)
            .enter()
            .append("path")
            .attr("class", d => d.name)
            .attr("d", d => line(d.values))
            .attr("stroke", d => myColor(d.name))
            .style("stroke-width", 4)
            .style("fill", "none");

        // Add the points
        svg.selectAll("myDots")
            .data(dataReady)
            .enter()
            .append('g')
            .style("fill", function (d) { return myColor(d.name) })
            .attr("class", function (d) { return d.name })
            .selectAll("myPoints")
            .data(function (d) { return d.values })
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.year) })
            .attr("cy", function (d) { return y(d.value) })
            .attr("r", 5)
            .attr("stroke", "white");

        // Add a label at the end of each line
        svg.selectAll("myLabels")
            .data(dataReady)
            .enter()
            .append("g")
            .append("text")
            .attr("class", d => d.name)
            .datum(d => { return { name: d.name, value: d.values[d.values.length - 1] }; }) // keep only the last value of each time series
            .attr("transform", d => `translate(${x(d.value.year)}, ${y(d.value.value)})`) // Put the text at the position of the last point
            .attr("x", 12) // shift the text a bit more right
            .text(d => d.name)
            .style("fill", d => myColor(d.name))
            .style("font-size", 15);

        // Add a legend (interactive)
        svg.selectAll("myLegend")
            .data(dataReady)
            .enter()
            .append("g")
            .append("text")
            .attr('x', (d, i) => width - (allGroup.length - i + 1) * 100) // adjust as needed
            .attr('y', -20) // adjust this to move labels up, negative values go above the graph
            .text(d => d.name)
            .style("fill", d => myColor(d.name))
            .style("font-size", 15)
            .on("click", function (event, d) {
                // is the element currently visible ?
                currentOpacity = d3.selectAll("." + d.name).style("opacity");
                // Change the opacity: from 0 to 1 or from 1 to 0
                d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0 : 1);
            });
    });
}





function displayGrossCapitalFormation(countryCode) {
    console.log('Fetching GCF data for', countryCode);

    d3.json(`http://localhost:3001/investmentData/${countryCode}`).then(data => {
        // Assuming data comes in the required format
        // Clear existing chart
        d3.select("#gcfChart").selectAll("*").remove();

        // Set the dimensions and margins of the graph
        var margin = { top: 10, right: 30, bottom: 50, left: 60 }, // Modified to match drawGraph
            width = parseInt(d3.select("#gcfChart").style("width"), 10) - margin.left - margin.right,
            height = parseInt(d3.select("#gcfChart").style("height"), 10) - margin.top - margin.bottom;

        // Append the svg object to the canvas div
        var svg = d3.select("#gcfChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Format the data for GCF
        var gcfData = data.map(function (d) {
            return { year: d.year, value: +d.grossCapitalFormation }; // Changed from gdpData to gcfData for clarity
        });

        // Add X axis
        var x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format("d"))) // Same as drawGraph
            .attr("color", "white");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(gcfData, d => d.value)])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("color", "white")
            .selectAll("text")
            .attr("dx", "-.8em"); // Same as drawGraph

        // Add the line
        svg.append("path")
            .datum(gcfData)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.year))
                .y(d => y(d.value))
            );

        // Add X Axis label
        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 30) + ")")
            .style("text-anchor", "middle")
            .attr("font-family", "Montserrat")
            .attr("font-size", "16px")
            .attr("fill", "#edf0f1")
            .text("Year");

        // Add Y Axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("font-family", "Montserrat")
            .attr("font-size", "16px")
            .attr("fill", "#edf0f1")
            .text("GCF (in millions)"); // Changed from Value to GCF
    }).catch(error => {
        console.error("Error fetching or displaying GCF data:", error);
    });
}



function displayInvestmentData(countryCode) {
    console.log('Fetching economic data for', countryCode);

    d3.json(`http://localhost:3001/investmentData/${countryCode}`).then(data => {
        // Assuming data comes in the required format

        // Clear existing chart
        d3.select("#invChart").selectAll("*").remove();

        // Set the dimensions and margins of the graph
        var margin = { top: 30, right: 0, bottom: 40, left: 60 },
            width = parseInt(d3.select("#invChart").style("width"), 10) - margin.left - margin.right,
            height = parseInt(d3.select("#invChart").style("height"), 10) - margin.top - margin.bottom;

        // Append the svg object to the canvas div
        var svg = d3.select("#invChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // List of groups
        var allGroup = ["FDI", "portfolioInvestment"] // Change here

        // Format the data
        var dataReady = allGroup.map(function (grpName) {
            return {
                name: grpName,
                values: data.map(function (d) {
                    return { year: d.year, value: +d[grpName] };
                })
            };
        });


        var myColor = d3.scaleOrdinal()
            .domain(allGroup)
            .range(['#77b0d4', '#6564DB']); // Light blue for FDI, Light purple for PI


        // Calculate odd years within data range
        var extent = d3.extent(data, d => d.year);
        var oddYears = d3.range(extent[0], extent[1]).filter(d => d % 2 !== 0);
        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
            .domain(extent)
            .range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickValues(oddYears)) // Display only odd years
            .attr("color", "white");
        // Add X axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10) // adjust as needed
            .style("fill", "white")
            .text("Year");


        // Add Y axis
        // Add Y axis that accommodates negative values

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([d3.min(dataReady, d => d3.min(d.values, v => v.value / 1e9)),
            d3.max(dataReady, d => d3.max(d.values, v => v.value / 1e9))])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d => d + 'B')); // append 'B' for billions

        // Add Y axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("y", -margin.left)
            .attr("x", -height / 2)
            .attr("dy", "1em")
            .style("fill", "white")
            .attr("transform", "rotate(-90)")
            .text("Value (in billion USD)");

        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d => d + 'B')); // append 'B' for billions



        // Add the lines
        // Add the lines
        var line = d3.line()
            .x(function (d) { return x(+d.year) })
            .y(function (d) { return y(+d.value / 1e9); }); // Change here

        // Add the points

        svg.selectAll("myLines")
            .data(dataReady)
            .enter()
            .append("path")
            .attr("class", d => d.name)
            .attr("d", d => line(d.values))
            .attr("stroke", d => myColor(d.name))
            .style("stroke-width", 4)
            .style("fill", "none");

        // Add the points
        svg
            .selectAll("myDots")
            .data(dataReady)
            .enter()
            .append('g')
            .style("fill", function (d) { return myColor(d.name) })
            .attr("class", function (d) { return d.name })
            .selectAll("myPoints")
            .data(function (d) { return d.values })
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.year) })
            .attr("cy", function (d) { return y(d.value / 1e9); }) // Change here
            .attr("r", 5)
            .attr("stroke", "white")
            .on("mouseover", function (event, d) {
                d3.select(this).attr('class', 'highlight');
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 7);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Value: ${d.value}`)
                    .style("left", `${(d3.event.pageX)}px`)
                    .style("top", `${(d3.event.pageY - 28)}px`);
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr('class', 'notHighlight');
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 5);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });



        // Add a label at the end of each line
        svg.selectAll("myLabels")
            .data(dataReady)
            .enter()
            .append("g")
            .append("text")
            .attr("class", d => d.name)
            .datum(d => { return { name: d.name, value: d.values[d.values.length - 1] }; }) // keep only the last value of each time series
            .attr("transform", d => `translate(${x(d.value.year)}, ${y(d.value.value)})`) // Put the text at the position of the last point
            .attr("x", 12) // shift the text a bit more right
            .text(d => d.name)
            .style("fill", d => myColor(d.name))
            .style("font-size", 10);
        // Add a legend (interactive)
        svg.selectAll("myLegend")
            .data(dataReady)
            .enter()
            .append("g")
            .append("text")
            .attr('x', (d, i) => width - (allGroup.length - i + 1) * 100) // adjust as needed
            .attr('y', -20) // adjust this to move labels up, negative values go above the graph
            .text(d => d.name)
            .style("fill", d => myColor(d.name))
            .style("font-size", 15) // Increased font size
            .on("click", function (event, d) {
                // is the element currently visible ?
                currentOpacity = d3.selectAll("." + d.name).style("opacity");
                // Change the opacity: from 0 to 1 or from 1 to 0
                d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0 : 1);
            });
    });
}