import html2canvas from 'html2canvas';
import { getInTooltip, getOutTooltip, positionTooltip } from './tooltip';
import { setRRSSLinks } from './rrss';
import { numberWithCommas, numberWithCommas2 } from './helpers';
import 'url-search-params-polyfill';
import * as d3 from 'd3';

//Necesario para importar los estilos de forma automática en la etiqueta 'style' del html final
import '../css/main.scss';

///// VISUALIZACIÓN DEL GRÁFICO //////
let dataSources = [
    'https://raw.githubusercontent.com/CarlosMunozDiazCSIC/edv_saludable/main/data/ine_data.csv', 
    'https://raw.githubusercontent.com/CarlosMunozDiazCSIC/edv_saludable/main/data/echo_data.csv', 
    'https://raw.githubusercontent.com/CarlosMunozDiazCSIC/edv_saludable/main/data/renteria_data.csv'];
let tooltip = d3.select('#tooltip');

let ineData = [], echoData = [], renteriaData = [];
let chartMenBlock = d3.select('#chartMen'), chartMen, xChartMen, xAxisChartMen, yChartMen, yAxisChartMen;
let chartWomenBlock = d3.select('#chartWomen'), chartWomen, xChartWomen, xAxisChartWomen, yChartWomen, yAxisChartWomen;
let colors = ['','','',''];

initChart();

function initChart() {
    let q = d3.queue();
    let csv = d3.dsvFormat(';');

    q.defer(d3.text, dataSources[0]);
    q.defer(d3.text, dataSources[1]);
    q.defer(d3.text, dataSources[2]);

    q.await(function(err, ine, echo, renteria) {
        if (err) throw err;

        ineData = csv.parse(ine);
        echoData = csv.parse(echo);
        renteriaData = csv.parse(renteria);
    });
    
    // d3.text(dataSource, function (error, d) {
    //     if (error) throw error;

    //     let dsv = d3.dsvFormat(',');
    //     let data = dsv.parse(d);

    //     data = data.map(function(d){
    //         return {
    //             anio: d.periodo,
    //             ccaa: d.comunidades,
    //             ccaa_searchable: d.comunidades.replace(/\s/g, '-').replace(/[\(\)\,]/g, '').toLowerCase().substr(3,),
    //             ex_0: +d.e_0,
    //             ex_65: +d.ex_6569,
    //             ex_80: +d.ex_8084
    //         }           
    //     });

    //     innerData = data.slice();

    //     //Filtramos los datos de Andalucía por defecto
    //     let nacData = innerData.filter(function(item){if(item.ccaa_searchable == 'andalucia'){ return item;}});
    //     currentData = nacData.slice();

    //     //Desarrollo del gráfico > Debemos hacer muchas variables genéricas para luego actualizar el gráfico
    //     let margin = {top: 5, right: 22.5, bottom: 25, left: 24.5};
    //     let width = parseInt(chartBlock.style('width')) - margin.left - margin.right,
    //         height = parseInt(chartBlock.style('height')) - margin.top - margin.bottom;

    //     chart = chartBlock
    //         .append('svg')
    //         .lower()
    //         .attr('width', width + margin.left + margin.right)
    //         .attr('height', height + margin.top + margin.bottom)
    //         .append('g')
    //         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //     //Eje X
    //     x_c = d3.scaleLinear()
    //         .domain([0,25])
    //         .range([0, width])
    //         .nice();

    //     x_cAxis = function(g){
    //         g.call(d3.axisBottom(x_c).ticks(5).tickFormat(function(d) { return numberWithCommas2(d); }))
    //         g.call(function(g){
    //             g.selectAll('.tick line')
    //                 .attr('y1', '0%')
    //                 .attr('y2', '-' + height + '')
    //         })
    //         g.call(function(g){g.select('.domain').remove()});
    //     }

    //     chart.append("g")
    //         .attr("transform", "translate(0," + height + ")")
    //         .attr('class','x_c-axis')
    //         .call(x_cAxis);

    //     //Eje Y
    //     y_c = d3.scaleLinear()
    //         .domain([0,12])
    //         .range([height,0])
    //         .nice();
    
    //     y_cAxis = function(svg){
    //         svg.call(d3.axisLeft(y_c).ticks(5).tickFormat(function(d) { return numberWithCommas2(d); }))
    //         svg.call(function(g){
    //             g.selectAll('.tick line')
    //                 .attr('class', function(d,i) {
    //                     if (d == 0) {
    //                         return 'line-special';
    //                     }
    //                 })
    //                 .attr("x1", '0')
    //                 .attr("x2", '' + width + '')
    //         })
    //         svg.call(function(g){g.select('.domain').remove()})
    //     }        
        
    //     chart.append("g")
    //         .attr('class','y_c-axis')
    //         .call(y_cAxis);

    //     //Línea
    //     line = d3.line()
    //         .x(function(d) { return x_c(d.ex_65); })
    //         .y(function(d) { return y_c(d.ex_80); })
    //         .curve(d3.curveMonotoneX);

    //     path_1 = chart.append("path")
    //         .data([currentData])
    //         .attr("class", 'line-chart_1')
    //         .attr("fill", "none")
    //         .attr("stroke", '' + enr_color_1 + '')
    //         .attr("stroke-width", '1.5px')
    //         .attr("d", line);

    //     length_1 = path_1.node().getTotalLength();

    //     path_1.attr("stroke-dasharray", length_1 + " " + length_1)
    //         .attr("stroke-dashoffset", length_1)
    //         .transition()
    //         .ease(d3.easeLinear)
    //         .attr("stroke-dashoffset", 0)
    //         .duration(3000);

    //     chart.selectAll('circles')
    //         .data(currentData)
    //         .enter()
    //         .append('circle')
    //         .attr('class', 'circle-chart_2_1')
    //         .attr("r", function(d,i){
    //             if(i == 0 || i == currentData.length -1) {
    //                 return '5'
    //             } else {
    //                 return '2.5';
    //             }
    //         })
    //         .attr("cx", function(d) { return x_c(d.ex_65); })
    //         .attr("cy", function(d) { return y_c(d.ex_80); })
    //         .style("fill", function(d,i) { 
    //             if(i == 0) {
    //                 return '' + circle_color_1 + '';
    //             } else if (i == currentData.length - 1) {
    //                 return '' + circle_color_2 + '';
    //             } else {
    //                 return '#fff';
    //             }
    //         })
    //         .style("stroke", function(d,i) {
    //             if(i == 0 || i == currentData.length -1) {
    //                 return 'none'
    //             } else {
    //                 return '' + enr_color_1 + '';
    //             }
    //         })
    //         .style("stroke-width", function(d,i) {
    //             if(i == 0 || i == currentData.length -1) {
    //                 return '0'
    //             } else {
    //                 return '0.5';
    //             }
    //         })
    //         .style('opacity', '0')
    //         .on('mouseenter mousedown mousemove mouseover', function(d, i, e) {                
    //             //Texto
    //             let html = '<p class="chart__tooltip--title">' + d.ccaa + ' (' + d.anio + ')</p>' + '<p class="chart__tooltip--text">Esperanza de vida a los 65-69 años:' + numberWithCommas(d.ex_65.toFixed(1)) + ' años</p>' + '<p class="chart__tooltip--text">Esperanza de vida a los 80-84 años:' + numberWithCommas(d.ex_80.toFixed(1)) + '</p>';

    //             tooltip.html(html);

    //             //Tooltip
    //             positionTooltip(window.event, tooltip);
    //             getInTooltip(tooltip);               
    //         })
    //         .on('mouseout', function(d, i, e) {
    //             //Quitamos el tooltip
    //             getOutTooltip(tooltip);                
    //         })
    //         .transition()
    //         .delay(function(d,i) { return i * (3000 / currentData.length - 1)})
    //         .style('opacity', '1');

    //     setTimeout(() => {
    //         setChartCanvas(); 
    //     }, 4000);
    // });
}

function updateChart(tipo) {

}

document.getElementById('replay').addEventListener('click', function() {
    updateChart(currentSelected);
});
///// REDES SOCIALES /////
setRRSSLinks();

///// ALTURA DEL BLOQUE DEL GRÁFICO //////
function getIframeParams() {
    const params = new URLSearchParams(window.location.search);
    const iframe = params.get('iframe');

    if(iframe == 'fijo') {
        setChartHeight('fijo');
    } else {
        setChartHeight();
    }
}

///Si viene desde iframe con altura fija, ejecutamos esta función. Si no, los altos son dinámicos a través de PYMJS
function setChartHeight(iframe_fijo) {
    if(iframe_fijo) {
        //El contenedor y el main reciben una altura fija
        //La altura del gráfico se ajusta más a lo disponible en el main, quitando títulos, lógica, ejes y pie de gráfico
        document.getElementsByClassName('container')[0].style.height = '612px';
        document.getElementsByClassName('main')[0].style.height = '580px';

        let titleBlock = document.getElementsByClassName('b-title')[0].clientHeight;
        let logicBlock = document.getElementsByClassName('chart__logics')[0].clientHeight;
        let footerBlock = document.getElementsByClassName('chart__footer')[0].clientHeight;
        let footerTop = 8, containerPadding = 8, marginTitle = 8, marginLogics = 12;

        //Comprobar previamente la altura que le demos al MAIN. El estado base es 588 pero podemos hacerlo más o menos alto en función de nuestros intereses

        let height = 580; //Altura total del main
        document.getElementsByClassName('chart__viz')[0].style.height = height - titleBlock - logicBlock - footerBlock - footerTop - containerPadding - marginTitle - marginLogics + 'px';
    } else {
        document.getElementsByClassName('main')[0].style.height = document.getElementsByClassName('main')[0].clientHeight + 'px';
    }    
}

getIframeParams();

///// DESCARGA COMO PNG O SVG > DOS PASOS/////
let innerCanvas;
let pngDownload = document.getElementById('pngImage');

function setChartCanvas() {
    html2canvas(document.querySelector("#chartBlock"), {width: document.querySelector('#chartBlock').clientWidth, height: document.querySelector('#chartBlock').clientHeight, imageTimeout: 12000, useCORS: true}).then(canvas => { innerCanvas = canvas; });
}

function setChartCanvasImage() {    
    var image = innerCanvas.toDataURL();
    // Create a link
    var aDownloadLink = document.createElement('a');
    // Add the name of the file to the link
    aDownloadLink.download = 'edv_saludable.png';
    // Attach the data to the link
    aDownloadLink.href = image;
    // Get the code to click the download link
    aDownloadLink.click();
}

pngDownload.addEventListener('click', function(){
    setChartCanvasImage();
});

///// JUEGO DE PESTAÑAS /////
//Cambios de pestañas
let tabs = document.getElementsByClassName('tab');
let contenidos = document.getElementsByClassName('content');

for(let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function(e) {
        document.getElementsByClassName('main')[0].scrollIntoView();
        displayContainer(e.target);
    });
}

function displayContainer(elem) {
    let content = elem.getAttribute('data-target');

    //Poner activo el botón
    for(let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    elem.classList.add('active');

    //Activar el contenido
    for(let i = 0; i < contenidos.length; i++) {
        contenidos[i].classList.remove('active');
    }

    document.getElementsByClassName(content)[0].classList.add('active');
}

///// USO DE SELECTORES //////
let x, i, j, l, ll, selElmnt, a, b, c;
let currentSelected = 'ine';
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    let valores = selElmnt.options[j].value.split("_");
    c.setAttribute('data-value', valores[0]);
    c.setAttribute('data-type', valores[1]);
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        let y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        currentSelected = e.target.getAttribute('data-value');   
        updateChart(currentSelected);

        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  let x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);
