//8th November, 2020: end of forceSimulation map, in homework #5
//2:43am , 8th November, code that works
let svgInnovative = d3.select('#innovative');
// let svgWidth = svgInnovative.node().clientWidth;
// let svgHeight = svgInnovative.node().clientHeight;

var margin = { top: 10, right: 3, bottom: 15, left: 40 };

const width = +svgInnovative.style('width').replace('px','');
const height = +svgInnovative.style('height').replace('px','');
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);



var xScale_middle = d3.scaleTime();

var time_year;
var start_date = '1950-07-22';
var start_date_parsed = d3.timeParse('%Y-%m-%d')(start_date);
//console.log(start_date_parsed);

var end_date = '1967-02-22';
var end_date_parsed = d3.timeParse('%Y-%m-%d')(end_date);
// console.log(end_date_parsed);
let green_links;
let linksData;

var flight_dates = [];
var single_dates = [];
var complete_data = [];
// var data;
var dogs_green = [];
var dogs_red = [];
var yAxis_dogs = ["Dezik", "Tsygan", "Lisa", "Chizhik", "Mishka", "Ryzhik", "Smeliy", "Neputeviy", "ZIB", "Lisa-2", "Ryzhik-2", "Damka", "Mishka-2", "Ryzhik-3", "Rita", "Linda", "Bulba", "Knopka", "Malyshka", "Albina", "Kozyavka", "Damka-2", "Dzhoyna", "Ryzhaya", "Belka", "Modnitsa", "Laika", "Palma", "Pushok", "Kusachka ", "Palma-2", "Belyanka", "Pestraya", "Zhulba", "Snezhinka ", "Malyok", "Lisichka", "Bars ", "Strelka", "Neva", "Mushka", "Pchyolka", "Shutka", "Chernuskha", "Kometka", "Zvezdochka", "Ugolyok ","Veterok "];
var index_dogs = [];
for(var k=0; k<yAxis_dogs.length;k++)
{
    var index_dogs_obj = {
        "name": yAxis_dogs[k],
        'index': k
    }
    index_dogs.push(index_dogs_obj);
}
// console.log(index_dogs[3]['name']);

var count_dogs = [];
for(var k=0; k<yAxis_dogs.length; k++)
{
    var count_dogs_obj = {
        "name": yAxis_dogs[k],
        "count": 0
    }
    // count_dogs.push(count_dogs_obj);
}

var link_hashcode = [];


// console.log(count_dogs);

var yScale = d3.scalePoint()
.domain(yAxis_dogs)
.range([7, innerHeight-5]);

function findName(name){
    if(name.includes("/")){
        let temp_name = [];
        temp_name = name.split('/');
       return temp_name[0];
    }
    else{
        return name;
    }
}

var all_dogs = [];
var links= [];
var all_dogs_array = [];
let flightData;


document.addEventListener('DOMContentLoaded',function() {
	svgInnovative = d3.select('#innovative');
	Promise.all([d3.csv('/data/Flights-Database.csv'),
				d3.csv('/data/Dogs-Database.csv')])
				.then(function(values) {
                    // flightData = values[0];
                    values[0].forEach(d=> 
                                {
									if(d['Dogs'].includes(',')){
										let temp_dogs_together_array = d['Dogs'].split(',');
										let link_dogs_obj = {
											source: temp_dogs_together_array[0],
											target: temp_dogs_together_array[1]
										}
										links.push(link_dogs_obj);
									}
									else{
										links.push(d['Dogs']);
									}
								})
					 values[1].forEach(d=>{
									if(d['Fate'].includes('Survived')){
										let temp_flights_array = d['Flights'].split(',');
										let temp_flights_array_count = temp_flights_array.length;
											let temp_all_dogs ={
											  "date" : temp_flights_array[temp_flights_array_count-1],
											  "date_parsed" : d3.timeParse('%Y-%m-%d')(temp_flights_array[temp_flights_array_count-1]),
											  "name" : d['Name (Latin)'],
											  "gender" : d['Gender'],
                                              "fate" : 'survived',
                                              "notes" : d.notes
											}
											all_dogs_array.push(temp_all_dogs);
									}
									else if(d['Fate'].includes('Died')){
										let temp_flights_array = d['Flights'].split(',');
										let temp_flights_array_count = temp_flights_array.length;
										let temp_all_dogs ={
											"date" : temp_flights_array[temp_flights_array_count-1],
											"date_parsed" : d3.timeParse('%Y-%m-%d')(temp_flights_array[temp_flights_array_count-1]),
											"name" : d['Name (Latin)'],
											"gender" : d['Gender'],
                                            "fate" : 'died',
                                            "notes" : d.notes
										  }
										  all_dogs_array.push(temp_all_dogs);
										}
                                });
					xScale_middle.domain([start_date_parsed, end_date_parsed])
								 .range([0, innerWidth]);
					drawCircles();
				});
});


// console.log("Printing links: ",links);


var dog_x = {};
var dog_y = {};

var x_cord = [];
function updateLayout1(nodes, labels) {
    nodes.attr('cx', function(d){d.cx = xScale_middle(d.date_parsed);
        dog_x[d.name] = d.cx;
        //console.log(d.cx);
        return xScale_middle(d.date_parsed)})
    .attr('cy', function(d) {
        if(d.gender == "Female")
        {
            dog_y[d.name]=d.y-300;
            return d.y-300;
        }
        else
        {
            dog_y[d.name]=d.y+300;
            return d.y+300;
        }
    });
    labels.attr('x', d=> xScale_middle(d.date_parsed))
    .attr('y', d => d.gender == 'Female' ? d.y-300 : d.y+300);
}


function updateLayout2(nodes, labels) {
    nodes.attr('cx', d=> xScale_middle(d.date_parsed))
        .attr('cy', d => d.gender == 'Female' ? d.y-200 : d.y+200);
    labels.attr('x', d=> xScale_middle(d.date_parsed))
    .attr('y', d => d.gender == 'Female' ? d.y-200 : d.y+200);
}


function drawCircles(){
    const g = svgInnovative.append('g')
                    .attr('transform', `translate(${margin.left},${margin.right})`);

    g.append('g')
    .attr("class","xAxis_middle")
    .attr('transform', `translate(${-18},${innerHeight/2+113})`)
    .call(d3.axisBottom(xScale_middle));

    // g.append('g')
    // .attr('class','yAxis')
    // .call(d3.axisLeft(yScale));

    var repelForce = d3.forceManyBody().strength(-150).distanceMax(250).distanceMin(50);
    var attractForce = d3.forceManyBody().strength(100).distanceMax(10).distanceMin(120);

    let green_simulation = d3.forceSimulation(all_dogs_array)
    .force('charge',d3.forceManyBody()) 
    // .force("y", d3.forceY(10))
    // .force("x", d3.forceX(10))
    .alphaDecay(0.15)
    .force("attractForce", attractForce)
    .force("repelForce", repelForce)
    .force("collide", d3.forceCollide())
    .force('center', d3.forceCenter( innerWidth/2, innerHeight/2+50 ));

    for (var i = 0; i < all_dogs_array.length; ++i){ 
        green_simulation.tick();
        green_simulation.stop();
    }


    let greenNodes = svgInnovative.selectAll('.node_green')
                        .data(all_dogs_array)
                        .join('circle')
                        .classed('node_green',true)
                        .style('fill', d => d.fate == 'survived' ? '#389168' : '#e2434b')
                        .attr('r', 23)
                        .on("mouseover", function(d) {		
                            div.transition()		
                                .duration(40)		
                                .style("opacity", .9);		
                            div.html("Name: "+d.name + "<br/>" +"Flight: " + d.date)	
                                .style("left", (d3.event.pageX) + "px")		
                                .style("top", (d3.event.pageY - 28) + "px");	
                            })					
                        .on("mouseout", function(d) {		
                            div.transition()		
                                .duration(500)		
                                .style("opacity", 0);	
                        });
    let greenNodeLabels = svgInnovative.selectAll('.node-label_green')
                        .data(all_dogs_array)
                        .join('text')
                        .classed('node-label_green', true)
                        .style('fill','#522e24')
                        .style('stroke-width','0.8em')
                        .style('font-width','500')
                        .text(function(d){
                            return findName(d.name);
                        });
                        //d => d.name
    green_simulation.on('tick', updateLayout1(greenNodes, greenNodeLabels))
    .on('end', () => { console.log(greenNodes); });

    /*let linkForce1 = d3.forceLink(links)
                               .id(d => d.name);
    
    green_simulation.force('links', linkForce1)
    .on('tick', updateLayout3);
    green_simulation.force('links', linkForce1)
    // console.log(link_hashcode);*/

   svgInnovative.selectAll('.link')
                .data(links)
                .join('line')
                .classed('link',true)
                .attr('x1',function(d){
                    // console.log("Printing x1: ");//,dog_x[d.source.name])
                    return dog_x[d.source];
                })
                .attr('y1',function(d){
                    return dog_y[d.source];
                })
                .attr('x2',function(d){
                    return dog_x[d.target];
                })
                .attr('y2',function(d){
                    return dog_y[d.target];
                });
    
    // console.log("Printing links: ",links);
    // console.log(linksData);

    // svgInnovative.selectAll('.link')
    //                 .data(links)
    //                 .join('line')
    //                 .classed('link', true)
    //                 .attr('x1', 1002.722891566265)
    //                 .attr('y1', 655.2828974157496)
    //                 .attr('x2', 1002.722891566265)
    //                 .attr('y2', 726.4488250818583);

    svgInnovative.append("text")
                .attr("id", "axisLabel")
                .attr("transform",
                    "translate(" + (width / 10 + 40) + " ," +
                    (height - 1200) + ")")
                .style("text-anchor", "middle")
                .style("font-size","70px")
                .style("opacity","0.5")
                .style("fill","rgb(231, 226, 226)")
                .style("font-weight","bold")
                .text("Female");

    svgInnovative.append("text")
                    .attr("id", "axisLabel")
                    .attr("transform",
                        "translate(" + (width / 10 + 15) + " ," +
                        (height - 40) + ")")
                    .style("text-anchor", "middle")
                    .style("font-size","70px")
                    .style("opacity","0.5")
                    .style("fill","rgb(231, 226, 226)")
                    .style("font-weight","bold")
                    .text("Male");

    svgInnovative.selectAll(".link").lower();

    // svgInnovative.append('text')
    // .attr('x',928)
    // .attr('y',45)
    // .style('font-size', "1.1em")
    // .style('font-weight','bold')
    // .style('fill','#522e24')
    // .style('text-decoration', 'underline')
    // .text('Legends :');

    svgInnovative.append("circle")
    .attr("cx",950)
    .attr("cy",80)
    .attr("r", 20)
    .attr('stroke','#522e24')
    .attr("stroke-width", 3)
    .style("fill", "#389168")
    .on("mouseover", function(d) {		
        div.transition()		
            .duration(100)		
            .style("opacity", .9);		
        div.html('Dog has survived')	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })					
    .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });
    svgInnovative.append('text')
    .attr('x',980)
    .attr('y',85)
    .style('font-size', "0.8em")
    .style('fill','#522e24')
    .text('Survived');

    svgInnovative.append("circle")
    .attr("cx",950)
    .attr("cy",129)
    .attr("r", 20)  
    .attr('stroke','#522e24')
    .attr("stroke-width", 3)
    .style("fill", "#e2434b")
    .on("mouseover", function(d) {		
        div.transition()		
            .duration(100)		
            .style("opacity", .9);		
        div.html('Dog has died')	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })					
    .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });
    svgInnovative.append('text')
    .attr('x',980)
    .attr('y',131)
    .style('font-size', "0.8em")
    .style('fill','#522e24')
    .text('Died');
}





































// console.log(temp1_dogs_green);
    // console.log(temp2_dogs_green);
    // for(var i=0; i< temp1_dogs_green.length; i++){
    //     dogs_green[temp1_dogs_green[i]] = temp2_dogs_green[i];
    // }
    // console.log(dogs_red);




    // let green_simulation = d3.forceSimulation(dogs_green)
    // .force('charge',d3.forceManyBody()) 
    // .force("y", d3.forceY(90))
    // // .force("x", d3.forceX(2))
    // .force("collide", d3.forceCollide().radius(40))
    // .force("manyBody", d3.forceManyBody().strength(15))
    // .stop();

// console.log(dogs_green);
// single_dates.sort();
// console.log(single_dates);
// console.log(complete_data);
// console.log(data);
// console.log(dogs_green);

// console.log(single_dates);

// console.log("12");

//console.log(d);
        // for(var key in d){
        //     var temp = 'Flights';
        //     if(key==temp){
        //         console.log(d['Flights']);
        //     }
        // }


// dogs_green.forEach(d=>{
        //     for(var key in d){
        //         if('key'=='date_parsed'){
        //             console.log("in");
        //             d.date_parsed = d3.timeParse('%Y-%m-%d')(d.date_parsed);
        //         }
        //         else{
        //             d[key] = d[key];
        //         }
        //     }
        // })

        // data.forEach(d=>{
        //     if(d['Flights'].includes(single_dates[i]) && d['Fate'].includes("Died")){
        //         let temp_died = [];
        //         temp_died =  d['Fate'].split(" ");
        //         temp_died_date = temp_died[1];
        //         let temp_obj_dogs_red = {
        //             "date" : single_dates[i],
        //             "date_parsed" : d3.timeParse('%Y-%m-%d')(temp_died_date),
        //             "name" : d['Name (Latin)'],
        //             "gender" : d['Gender']
        //         }
        //         dogs_red.push(temp_obj_dogs_red);
        //     }
        // })


// svgInnovative.selectAll('.link')
    //         .data(linksData)
    //         .join('path')
    //         .classed('link',true)
    //         .attr('d', d => {
    //             // console.log(d);
    //             let start = xScale_middle(linksData['source']); // x position of source node
    //             let end = xScale_middle(linksData['source']);   // x position of ending node
    //             return ['M', start, svgHeight*.75,   // arc starts at source node's coordinates
    //                     'A',                         // this means we're creating an elliptical arc
    //                     (start - end)/2, ',',        // the coordinates of the inflection point
    //                     (start - end)/2, 0, 0, ',',    
    //                     1,                           // put the arcs on top (0 = underneath)
    //                     end, ',', svgHeight*.75]     // arc ends at target node's coordinates
    //                 .join(' ');
    //         });

    //         // put the arcs behind the nodes and labels
    // svgInnovative.selectAll('.link').lower();


//     var repelForce1 = d3.forceManyBody().strength(-250).distanceMax(50).distanceMin(10);
//     var attractForce1 = d3.forceManyBody().strength(200).distanceMax(40).distanceMin(10);

//     let red_simulation = d3.forceSimulation(dogs_red)
//     .force('charge',d3.forceManyBody()) 
//     // .force("y", d3.forceY(250))
//     // .force("x", d3.forceX(30))
//     .alphaDecay(0.15)
//     .force("attractForce", attractForce1)
//     .force("repelForce", repelForce1)
//     .force("collide", d3.forceCollide())
//     .force('center', d3.forceCenter( innerWidth/2, innerHeight/2 ));

//     for (var i = 0; i < dogs_red.length; ++i){ 
//         red_simulation.tick();
//         red_simulation.stop();
//     }

//     let redNodes = svgInnovative.selectAll('.node_red')
//                                 .data(dogs_red)
//                                 .enter()
//                                 .append('circle')
//                                 .classed('node_red',true)
//                                 .style('fill', 'red')
//                                 .attr('r',10);
// //d => d.gender == 'Female' ? 'yellow' : 'green'
//     let redNodeLabels = svgInnovative.selectAll('.node-label_red')
//                                     .data(dogs_red)
//                                     .enter()
//                                     .append('text')
//                                     .classed('.node-label_red',true)
//                                     .attr('font-size','0.2em')
//                                     .style('text-anchor', 'middle')
//                                     .style('aligment-baseline','middle')
//                                     .text(d => d.name);
//     red_simulation.on('tick', updateLayout2(redNodes, redNodeLabels))
//     .on('end', () => { console.log(redNodes); });




    //console.log(linksData)

    //  let linkForce1 = d3.forceLink(linksData)
    //  .id(d => d.name);

    //  green_simulation.force('links', linkForce1)
    //                     .on('tick', updateLayout3);

    // green_links = svgInnovative.selectAll('.link')
    //                     .data(linksData)
    //                     .join('line')
    //                     .classed('link',true);

    // linkForce1.distance(100) // default distance is 30
    //         .strength(.33)   // default strength is 1
    // green_simulation.force('charge', d3.forceManyBody().strength(-400));

    // svgInnovative.selectAll('.node_green').raise();
    // svgInnovative.selectAll('.node-label_green').raise();

    // d3.csv('/data/Dogs-Database.csv').then(data => {
//     // data.forEach(d=> {
//     //     // console.log(d['Flights']);
//     //     // console.log(d);
//     //     complete_data.push(d);
//     //     var check = d['Flights'];
//     //     flight_dates.push(check);
//     //     // console.log(check.includes(','));
//     //     d.date_new = d3.timeParse('%Y-%m-%d')(d['Flights']);
//     //     all_dogs.push(findName(d['Name (Latin)']));
        
//     // });
// // console.log(all_dogs);
// // console.log(all_dogs[37]);
// // all_dogs[37] = 'Bars';
// // all_dogs[]
//     //console.log(data);
//     // complete_data = data;
//     xScale_middle.domain([start_date_parsed, end_date_parsed])
//                 .range([0, innerWidth]);
    
//     // var xAxis = d3.svgInnovative.axis()
//     //                 .attr("transform", "translate(0," + (innerHeight/2) + ")")
//     //                 .scale(xScale_middle);
//     // linksData = [];
//     // for(var i=0; i<all_dogs.length; i++){
//     //     let linksData_obj = {
//     //         'source' : all_dogs[i],
//     //         'target' : all_dogs[i]
//     //     }
//     //     linksData.push(linksData_obj); 
//     // }
    
//     // for(var i=0; i<all_dogs.length; i++){
//     //     let linksData_obj1 = {
//     //         'source' : all_dogs[i],
//     //         'target' : all_dogs[i]
//     //     }
//     //     links.push(
//     //         {
//     //         'source' : all_dogs[i],
//     //         'target' : all_dogs[i]
//     //       }
//     //       ); 
//     // }
//     // console.log(links);

//     // for(var date in flight_dates)
//     // {
//     //     // console.log(flight_dates[date]);
//     //     if(flight_dates[date].includes(',')){
//     //         var temp_arr = flight_dates[date].split(",");
//     //         for(var i in temp_arr){
//     //             single_dates.push(temp_arr[i]);
//     //         }
//     //     }
//     //     else{
//     //         single_dates.push(flight_dates[date]);
//     //     }
//     // }
//     // single_dates = single_dates.filter((c, index) => {
//     //     return single_dates.indexOf(c) === index;
    
//     // });

//     data.forEach(d=>{
//         if(d['Fate'].includes('Survived')){
//             let temp_flights_array = d['Flights'].split(',');
//             let temp_flights_array_count = temp_flights_array.length;
//                 let temp_all_dogs ={
//                   "date" : temp_flights_array[temp_flights_array_count-1],
//                   "date_parsed" : d3.timeParse('%Y-%m-%d')(temp_flights_array[temp_flights_array_count-1]),
//                   "name" : d['Name (Latin)'],
//                   "gender" : d['Gender'],
//                   "fate" : 'survived'
//                 }
//                 all_dogs_array.push(temp_all_dogs);
//         }
//         else if(d['Fate'].includes('Died')){
//             let temp_flights_array = d['Flights'].split(',');
//             let temp_flights_array_count = temp_flights_array.length;
//             let temp_all_dogs ={
//                 "date" : temp_flights_array[temp_flights_array_count-1],
//                 "date_parsed" : d3.timeParse('%Y-%m-%d')(temp_flights_array[temp_flights_array_count-1]),
//                 "name" : d['Name (Latin)'],
//                 "gender" : d['Gender'],
//                 "fate" : 'died'
//               }
//               all_dogs_array.push(temp_all_dogs);
//             }
//     });




//     // console.log(single_dates.length);
//     // for(var i in single_dates){
//     //     // console.log(single_dates[i]);
//     //     data.forEach(d=>{

            
//     //             // console.log(all_dogs_array);
//     //         if(d['Flights'].includes(single_dates[i]) && d['Fate'] == 'Survived'){
//     //             for(var x = 0; x<index_dogs.length; x++){
//     //                 if(findName(d['Name (Latin)'])==index_dogs[x]['name']){
//     //                     // console.log("inside")
//     //                     var t1 = index_dogs[x]['index'];
//     //                 }
//     //             }
//     //             for(var x = 0; x<count_dogs.length; x++){
//     //                 if(count_dogs[x]['name']==findName(d['Name (Latin)'])){
//     //                     var t2 = count_dogs[x]['count'];
//     //                     t2 = t2+1;
//     //                 }
//     //             }
//     //             var t_hashcode = "" +t1 + t2;
//     //             let temp_obj_dogs_green = {
//     //                 "date" : single_dates[i],
//     //                 "date_parsed" : d3.timeParse('%Y-%m-%d')(single_dates[i]),
//     //                 "name" : findName(d['Name (Latin)']),
//     //                 "gender" : d['Gender'],
//     //                 "fate" : 'survived',
//     //                 "hashcode": t_hashcode
//     //             }
//     //             dogs_green.push(temp_obj_dogs_green);
//     //         }
//     //         else if(d['Flights'].includes(single_dates[i]) && d['Fate'].includes("Died")){
                
//     //             let temp_obj_dogs_red;
//     //             let temp_died = [];
//     //             temp_died =  d['Fate'].split(" ");
//     //             temp_died_date = temp_died[1];
//     //             if(temp_died[1] == single_dates[i]){
//     //             for(var x = 0; x<index_dogs.length; x++){
//     //                 if(index_dogs[x]['name']==findName(d['Name (Latin)'])){
//     //                     var t1 = index_dogs[x]['index'];
//     //                 }
//     //             }
//     //             for(var x = 0; x<count_dogs.length; x++){
//     //                 if(count_dogs[x]['name']==findName(d['Name (Latin)'])){
//     //                     var t2 = count_dogs[x]['count'];
//     //                     t2 = t2+1;
//     //                 }
//     //             }
//     //             var t_hashcode = "" +t1 + t2;
//     //             temp_obj_dogs_red = {
//     //                 "date" : single_dates[i],
//     //                 "date_parsed" : d3.timeParse('%Y-%m-%d')(single_dates[i]),
//     //                 "name" : findName(d['Name (Latin)']),
//     //                 "gender" : d['Gender'],
//     //                 "fate" : 'died',
//     //                 "hashcode": t_hashcode
//     //             }
//     //             }
//     //             else if(temp_died[1] != single_dates[i])
//     //             {
//     //                 for(var x = 0; x<index_dogs.length; x++){
//     //                     if(index_dogs[x]['name']==findName(d['Name (Latin)'])){
//     //                         var t1 = index_dogs[x]['index'];
//     //                     }
//     //                 }
//     //                 for(var x = 0; x<count_dogs.length; x++){
//     //                     if(count_dogs[x]['name']==findName(d['Name (Latin)'])){
//     //                         var t2 = count_dogs[x]['count'];
//     //                         t2 = t2+1;
//     //                     }
//     //                 }
//     //                 var t_hashcode = "" +t1 + t2;
//     //                 temp_obj_dogs_red = {
//     //                     "date" : single_dates[i],
//     //                     "date_parsed" : d3.timeParse('%Y-%m-%d')(single_dates[i]),
//     //                     "name" : findName(d['Name (Latin)']),
//     //                     "gender" : d['Gender'],
//     //                     "fate" : 'survived',
//     //                     "hashcode": t_hashcode
//     //             }
//     //         }
//     //             dogs_green.push(temp_obj_dogs_red);
//     //         }
//     //         //console.log(d['Name (Latin)']);
//     //     });
        
//     // }
//     console.log("Printing All dog array :",all_dogs_array);
//     console.log("Printing dogs green :",dogs_green);
//     drawCircles();


// });


// d3.csv('/data/Flights-Database.csv').then(data =>{
//     data.forEach(d=> {
//         if(d['Dogs'].includes(',')){
//             let temp_dogs_together_array = d['Dogs'].split(',');
//             let link_dogs_obj = {
//                 source: temp_dogs_together_array[0],
//                 target: temp_dogs_together_array[1]
//             }
//             links.push(link_dogs_obj);
//         }
//         else{
//             links.push(d['Dogs']);
//         }
//     })
// });

/*
function updateLayout3() {
    greenNodes.attr('cx', d=> xScale_middle(d.date_parsed))
    .attr('cy', d => d.gender == 'Female' ? d.y-200 : d.y+200);
    greenNodeLabels.attr('x', d=> xScale_middle(d.date_parsed))
    .attr('y', d => d.gender == 'Female' ? d.y-200 : d.y+200);
    green_links.attr('x1', function(d){
        console.log("Printing x1: ",dog_x[d.source])
        return dog_x[d.source];
    })
    .attr('y1', function(d){
        return dog_y[d.source];
    })
    .attr('x2',function(d){
        return dog_x[d.target];
    })
    .attr('y2', function(d){
        return dog_y[d.target];
    });
}*/
//
//d=> yScale(d.name)

// var link_hashcode_obj = {
//     source: "161",
//     target: "111"
// }
// link_hashcode.push(link_hashcode_obj);
// console.log(link_hashcode);

// d3.csv('/data/Flights-Database.csv').then(data => {
//     data.forEach(d=> {
//         var temp_dog1;
//         var temp_dog2;
//         var temp_dog;
//         // console.log(d['Dogs']);
//         if(d['Dogs'].includes(",")){
//             var temp_dog1;
//             var temp_dog2;
//             var temp1_flight_name_arr = [];
//             temp1_flight_name_arr = d['Dogs'].split(",");
//             if(temp1_flight_name_arr.length==2){
//                 temp_dog1 = temp1_flight_name_arr[0];
//                 temp_dog2 = temp1_flight_name_arr[0];
//             }
//             for(var x1=0; x1<flight_dates.length;x1++)
//             {
//                 for(var x2=0; x2<dogs_green.length; x2++)
//                 {
//                 if(flight_dates[x1]==d['Date'] && flight_dates[x1]== dogs_green[x2]['date']){
//                     if(dogs_green['name']==temp_dog1){
//                         var s1 = dogs_green['hashcode'];
//                     }
//                     else if(dogs_green['name']==temp_dog2){
//                         var t1 = dogs_green['hashcode'];
//                     }
//                 }
//                 }
//             }
            
//         }else{
//             temp_dog =d['Dogs'];
//             var s1 = dogs_green['hashcode'];
//             var t1 = dogs_green['hashcode'];
//             var link_hashcode_obj = {
//                 "source" : s1,
//                 "Target" : t1
//             }
//             link_hashcode.push(link_hashcode_obj);
//         }
//         // console.log(link_hashcode);
//     })}); d=> xScale_middle(d.date_parsed)