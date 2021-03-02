let url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";
let width = 700;
let height = 360;
let barWidth = (width / 275) * 0.8; // width of svg divided by how many bars there are.  * .8 to have a little gap between each bar

let svgContainer = d3
  .select("#chart") // The div the container is going inside
  .append("svg")
  .attr("width", width)
  .attr("height", height + 75); // Add the 40 so the axis on bottom can be shown.

// Tooltip
let tooltip = d3
  .select("#chart")
  .append("div")
  .style("opacity", "0")
  .attr("id", "tooltip");

d3.json(
  // This gets us the data we want to use. First parameter is the url we want to get info from and the second is the function displaying all of the data
  url,
  function (data) {
    let xPaddingLeft = 60;
    let xPaddingRight = 30;
    // Start xScale (year)
    // Map through data array in url. years are in first index. This gives a new date
    let year = data.data.map((item) => new Date(item[0]));

    // Text under x axis that gives link to more information about the graph.
    svgContainer
      .append("text")
      .attr("x", width - 330) // Places the text 330px away from the right edge
      .attr("y", height + 50) // Places the text 50px underneath the graph
      .attr("id", "more-info-text")
      .text("More Information: http://www.bea.gov/national/pdf/nipaguid.pdf"); // Gives it a text

    // This map will give year for each rectangle so we can display it in tooltip as a string
    let yearString = data.data.map((item) => {
      var quarter = "";
      var temp = item[0].slice(5, 7);
      // Take slice of item array to return month of the year. Depending on the month set the quarter element to display in tooltip
      if (temp == "01") {
        quarter = "Q1";
      } else if (temp == "04") {
        quarter = "Q2";
      } else if (temp == "07") {
        quarter = "Q3";
      } else if (temp == "10") {
        quarter = "Q4";
      }
      // returns the first 4 elemnts of the string (the year) and adds what Quarter it is
      return item[0].slice(0, 4) + " " + quarter;
    });

    // Must add new Date() method so works well with d3.time.scale()
    let maxYear = new Date(d3.max(year));
    console.log(maxYear);
    const xScale = d3
      .scaleTime() //scaleTime is the same as scaleLinear except it returns dates (like years) instead of linear number
      .domain([d3.min(year), maxYear])
      .range([xPaddingLeft, width - xPaddingRight]); // Use padding to convert scale as the axis must be inside the

    const xAxis = d3.axisBottom().scale(xScale);

    svgContainer
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("id", "x-axis")
      .call(xAxis);

    // Start yScale (GDP)
    let GDP = data.data.map((item) => item[1]);
    let maxGDP = d3.max(GDP);

    // Need to make the height of rectangle bars the same as scaled value. Thus, we need to scale the GDP values and then put them in height attribute
    let scaledGDP = [];
    let linearScaleGDP = d3
      .scaleLinear()
      .domain([0, maxGDP])
      .range([0, height]);

    scaledGDP = GDP.map((item) => linearScaleGDP(item));

    // Start for yScale
    const yScale = d3.scaleLinear().domain([0, maxGDP]).range([height, 0]);
    const yAxis = d3.axisLeft(yScale);

    svgContainer
      .append("g")
      .attr("transform", "translate(" + xPaddingLeft + ",0)")
      .attr("id", "y-axis")
      .call(yAxis);

    // Gives yScale a text
    svgContainer
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -250) // Moves text up and down due to rotation transformation. Moves down 200 pixels.
      .attr("y", xPaddingLeft + 15) // Moves it left and right due to rotation transformation. Moved 15 pixels right of axis.
      .attr("id", "yScale-text")
      .text("Gross Domestic Product"); // Gives it a text

    // Begin calling on each rectangle (bar)
    svgContainer
      .selectAll("rect") // call on all rectangles (before they're actually there)
      .data(data.data)
      .enter()
      .append("rect") // Append all the rectangles made with data()
      .attr("x", (d, i) => xScale(year[i])) // Must use xScale the year's index.
      .attr("y", (d, i) => yScale(GDP[i])) // yScale already flipped the position.
      .attr("width", barWidth) // Set width to barWidth variable (barWidth divides the width of container by how many bars there are (275)) * .8 to have a little gap between each bar
      .attr("height", (d, i) => scaledGDP[i])
      /* Can't be normal GDP for height. If not scaled then the height will go one for thousands of pixels down. Thus will cover the axis and no way to push the chart up with padding. So we scale the GDP array into a new variable and use that here to set height.
         for height we could have just done height - yScale(d[1]). As this takes the gdp to scale and places the height accordingly */
      .attr("class", "bar") // give each rect a class bar.

      // Adding data-date and data-gdp to rectangles for challenges and tooltip info later.
      .attr("data-date", (d, i) => data.data[i][0])
      .attr("data-gdp", (d, i) => data.data[i][1])

      // Add the mouseover with a function to call on tooltip and tooltip-container divs by changing opacity
      .on("mouseover", function (d, i) {
        tooltip.style("opacity", ".8"); // Can't be with the rest. If it is there is a bug where the mouse lands on tooltip and then nothing shows. (also moves tooltip left position somehow)
        tooltip
          .html(
            yearString[i] +
              "<br> $" +
              GDP[i].toFixed(1).replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,") +
              " Billion"
          ) // displays the year and quarter (using yearString from before...) Then displays GDP with a comma for every three numbers using regex
          .style("left", d3.event.pageX + 16 + "px") // Places the tooltip 16px to the right of the mouse position...
          .style("top", height + "px") // Moves the tooltip to the bottom of the svgContainer
          .attr("data-date", data.data[i][0]); // Added this for line for challenge requirement
      })

      .on("mouseout", function (d, i) {
        tooltip.style("opacity", "0");
      });
  }
);
