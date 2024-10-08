/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)


let time = 0
let interval
let formattedData

// Tooltip
const tip = d3.tip()
  .attr('class', 'd3-tip')
	.html(d => {
		let text = `<strong>Country:</strong> <span style='color:red;text-transform:capitalize'>${d.country}</span><br>`
		text += `<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>${d.continent}</span><br>`
		text += `<strong>Life Expectancy:</strong> <span style='color:red'>${d3.format(".2f")(d.life_exp)}</span><br>`
		text += `<strong>GDP Per Capita:</strong> <span style='color:red'>${d3.format("$,.0f")(d.income)}</span><br>`
		text += `<strong>Population:</strong> <span style='color:red'>${d3.format(",.0f")(d.population)}</span><br>`
		return text
	})
g.call(tip)

g.append("text")
		.attr("class", "x axis-label")
		.attr("x", WIDTH / 2)
		.attr("y", HEIGHT + 50)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("GDP Per Capita ($)")

g.append("text")
	.attr("class", "y axis-label")
	.attr("x", -(HEIGHT / 2))
	.attr("y", -60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Life Expectancy (Years)")


// Scales
const x = d3.scaleLog()
    .domain([100, 150000]) // Get max income from all countries
    .range([0, WIDTH]); // Typically x-axis range is from 0 to WIDTH
const y = d3.scaleLinear()
    .domain([0, 90])
    .range([HEIGHT, 0]);

const radius = d3.scaleLinear()
    .domain([2000, 1400000000]) 
    .range([5, 70]); 

const continentColor = d3.scaleOrdinal()
    .domain(["asia", "europe", "africa", "americas", "oceania"]) // List of continents
    .range(d3.schemeCategory10); // Use a D3 color scheme for diversity
const xAxisCall = d3.axisBottom(x)
	.ticks(3)
	.tickFormat(d => '$' + d)
	.tickValues([400, 4000, 40000])
const yAxisCall = d3.axisLeft(y)
	.ticks(10)
	.tickFormat(d => d)
g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${HEIGHT})`)
    .call(xAxisCall);
g.append("g")
  .attr("class", "y axis")
  .call(yAxisCall)

const timeLabel = g.append("text")
  .attr("y", HEIGHT - 10)
  .attr("x", WIDTH - 40)
  .attr("font-size", "40px")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle")
  .text("1800")


// Legend

const legend = g.append("g")
  .attr("transform", `translate(${WIDTH - 10}, ${HEIGHT - 150})`); 

const continents = ["africa", "americas", "asia", "europe", "oceania"];

// Create a group for each continent's legend item
continents.forEach((continent, i) => {
  const legendRow = legend.append("g")
	  .attr("transform", `translate(0, ${i * 20})`);  // Spacing for each row in the legend

  // Add a colored rectangle for each continent
  legendRow.append("rect")
	  .attr("width", 10)
	  .attr("height", 10)
	  .attr("fill", continentColor(continent));

  // Add a label next to each rectangle
  legendRow.append("text")
	  .attr("x", -10)  // Position the text
	  .attr("y", 10)
	  .attr("text-anchor", "end")
	  .style("text-transform", "capitalize")
	  .text(continent);
});





d3.json("data/data.json").then(function(data){
	// clean data
	formattedData = data.map(year => {
		return year["countries"].filter(country => {
			const dataExists = (country.income && country.life_exp)
			return dataExists
		}).map(country => {
			country.income = Number(country.income)
			country.life_exp = Number(country.life_exp)
			return country
		})
	})
	/*
	d3.interval(function(){
		// at the end of our data, loop back
		time = (time < 214) ? time + 1 : 0
		update(formattedData[time])
	}, 100)
	*/
	// first run of the visualization
	update(formattedData[0])
})

function step() {
	// at the end of our data, loop back
	time = (time < 214) ? time + 1 : 0
	update(formattedData[time])
}

$("#play-button")
	.on("click", function() {
		const button = $(this)
		if (button.text() === "Play") {
			button.text("Pause")
			interval = setInterval(step, 100)
		}
		else {
			button.text("Play")
			clearInterval(interval)
		}
	})

$("#reset-button")
	.on("click", () => {
		time = 0
		update(formattedData[0])
	})

$("#continent-select")
	.on("change", () => {
		update(formattedData[time])
	})

$("#date-slider").slider({
		min: 1800,
		max: 2014,
		step: 1,
		slide: (event, ui) => {
			time = ui.value - 1800
			update(formattedData[time])
		}
	})

function update(data) {
	// Define transition
	const t = d3.transition()
		.duration(100);

	const continent = $("#continent-select").val()

	const filteredData = data.filter(d => {
		if (continent === "all") return true
		else {
			return d.continent == continent
		}
	})


	// JOIN new data with old elements
	const circles = g.selectAll("circle")
		.data(filteredData, d => d.country);  // Use country name as the key for data binding

	// EXIT old elements not present in new data
	circles.exit().remove()

	// ENTER new elements
	circles.enter().append("circle")
		.attr("fill", d => continentColor(d.continent))
		.attr('stroke', 'black')
		.attr("stroke-width", 1)  // Set stroke width
    	.attr("fill-opacity", 0.7)  // Set fill transparency (alpha)
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.merge(circles)  // MERGE enter and update selections
		.transition(t)  // Apply transition to both new and updating elements
			.attr("cx", d => x(d.income))  // Update x position
			.attr("cy", d => y(d.life_exp))  // Update y position
			.attr("r", d => radius(d.population));

	timeLabel.text(String(time + 1800))

	$("#year")[0].innerHTML = String(time + 1800)
	$("#date-slider").slider("value", Number(time + 1800))
}
