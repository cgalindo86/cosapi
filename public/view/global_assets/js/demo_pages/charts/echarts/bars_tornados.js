/* ------------------------------------------------------------------------------
 *
 *  # Echarts - Bar and Tornado charts
 *
 *  Demo JS code for echarts_bars_tornados.html page
 *
 * ---------------------------------------------------------------------------- */


// Setup module
// ------------------------------

var EchartsBarsTornados = function() {


    //
    // Setup module components
    //

    // Bar and tornado charts
    var _barsTornadosExamples = function() {
        if (typeof echarts == 'undefined') {
            console.warn('Warning - echarts.min.js is not loaded.');
            return;
        }

        // Define elements
        var bars_basic_element = document.getElementById('bars_basic');
        var bars_stacked_element = document.getElementById('bars_stacked');
        var bars_clustered_element = document.getElementById('bars_stacked_clustered');
        var bars_float_element = document.getElementById('bars_float');
        var bars_mix_element = document.getElementById('bars_mix');
        var bars_tornado_negative_element = document.getElementById('bars_tornado_negative');
        var bars_tornado_staggered_element = document.getElementById('bars_tornado_staggered');


        // Mix bars and line
        if (bars_mix_element) {

            // Initialize chart
            var bars_mix = echarts.init(bars_mix_element);


            //
            // Chart config
            //

            // Options
            bars_mix.setOption({

                // Global text styles
                textStyle: {
                    fontFamily: 'Roboto, Arial, Verdana, sans-serif',
                    fontSize: 13
                },

                // Chart animation duration
                animationDuration: 750,

                // Setup grid
                grid: {
                    left: 0,
                    right: 30,
                    top: 30,
                    bottom: 0,
                    containLabel: true
                },

                // Add legend
                legend: {
                    data: ['Customers', 'Returned'],
                    itemHeight: 8,
                    itemGap: 20,
                    textStyle: {
                        padding: [0, 5]
                    }
                },

                // Add tooltip
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    padding: [10, 15],
                    textStyle: {
                        fontSize: 13,
                        fontFamily: 'Roboto, sans-serif'
                    },
                    axisPointer: {
                        type: 'shadow',
                        shadowStyle: {
                            color: 'rgba(0,0,0,0.025)'
                        }
                    }
                },

                // Horizontal axis
                xAxis: [{
                    type: 'value',
                    axisLabel: {
                        color: '#333'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#eee',
                            type: 'dashed'
                        }
                    }
                }],

                // Vertical axis
                yAxis: [{
                    type: 'category',
                    data: ['Oct', 'Sep', 'Aug', 'July', 'June', 'May', 'Apr', 'Mar', 'Feb', 'Jan'],
                    axisLabel: {
                        color: '#333'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: ['#eee']
                        }
                    },
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(250,250,250,0.1)', 'rgba(0,0,0,0.015)']
                        }
                    }
                }],

                // Add series
                series: [
                    {
                        name: 'Customers',
                        type: 'bar',
                        barCategoryGap: '40%',
                        label: {
                            normal: {
                                textStyle: {
                                    color: '#682d19'
                                },
                                position: 'left',
                                show: false,
                                formatter: '{b}'
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: '#6bca6f',
                            }
                        },
                        data: [1900, 1029, 1602, 2004, 1100, 1800, 2800, 1407, 2200, 900]
                    },
                    {
                        name: 'Returned',
                        type: 'line',
                        symbolSize: 7,
                        silent: true,
                        
                        itemStyle: {
                            normal: {
                                color: '#2f4553',
                                borderWidth: 2
                            }
                        },
                        data: [100, 100, 800, 1070, 900, 300, 1200, 900, 1200, 200]
                    }
                ]
            });
        }

        //
        // Resize charts
        //

        // Resize function
        var triggerChartResize = function() {
            bars_basic_element && bars_basic.resize();
            bars_stacked_element && bars_stacked.resize();
            bars_clustered_element && bars_clustered.resize();
            bars_float_element && bars_float.resize();
            bars_mix_element && bars_mix.resize();
            bars_tornado_negative_element && bars_tornado_negative.resize();
            bars_tornado_staggered_element && bars_tornado_staggered.resize();
        };

        // On sidebar width change
        $(document).on('click', '.sidebar-control', function() {
            setTimeout(function () {
                triggerChartResize();
            }, 0);
        });

        // On window resize
        var resizeCharts;
        window.onresize = function () {
            clearTimeout(resizeCharts);
            resizeCharts = setTimeout(function () {
                triggerChartResize();
            }, 200);
        };
    };


    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            _barsTornadosExamples();
        }
    }
}();


// Initialize module
// ------------------------------

document.addEventListener('DOMContentLoaded', function() {
    EchartsBarsTornados.init();
});
