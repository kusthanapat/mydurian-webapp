<script setup>
    import VueApexCharts from 'vue3-apexcharts'
    import { ref, onMounted } from 'vue'

    definePageMeta({
        layout: "defaultuser"
    })

    // temp chart
    const tempChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Temperature'],
    })

    // humi chart
    const humiChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Humidity'],
    })

    // pressure chart
    const pressureChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Pressure'],
    })

    // lux chart
    const luxChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Lux'],
    })

    // st chart
    const stChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Soil Temp'],
    })

    // sh chart
    const shChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Soil Humidity'],
    })

    // sph chart
    const sphChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['PH'],
    })

    // sec chart
    const secChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Soil Electric'],
    })

    // sn chart
    const snChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Nitrogen'],
    })

    // sp chart
    const spChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Phosporus'],
    })

    // sk chart
    const skChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Potassuim'],
    })

    // wind chart
    const windChart = ref({
        chart: {
            type: 'radialBar',
            height: 350,
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '22px',
                    },
                    value: {
                        show: true,
                        fontSize: '16px',
                        formatter: function (val) {
                            return `${val}%`
                        }
                    }
                }
            }
        },
        labels: ['Wind'],
    })

    const seriesData = ref([67]) // เปลี่ยนข้อมูลเป็นเปอร์เซ็นต์หรือค่าที่ต้องการแสดง
</script>

<template>
    <div class="h-full w-full pr-28 pl-28 space-y-16 mt-10">
        <div class="flex w-full justify-between items-center pr-52 pl-52">
            <VueApexCharts type="radialBar" :options="tempChart" :series="seriesData" height="350" />
            <VueApexCharts type="radialBar" :options="humiChart" :series="seriesData" height="350" />
        </div>
    </div>

    <div class="h-full w-full pr-28 pl-28 space-y-16 mt-10">
        <div class="flex w-full justify-between items-center pr-52 pl-52">
            <VueApexCharts type="radialBar" :options="pressureChart" :series="seriesData" height="350" />
            <VueApexCharts type="radialBar" :options="luxChart" :series="seriesData" height="350" />
        </div>
    </div>

    <div class="h-full w-full pr-28 pl-28 space-y-16 mt-10">
        <div class="flex w-full justify-between items-center pr-52 pl-52">
            <VueApexCharts type="radialBar" :options="stChart" :series="seriesData" height="350" />
            <VueApexCharts type="radialBar" :options="shChart" :series="seriesData" height="350" />
        </div>
    </div>

    <div class="h-full w-full pr-28 pl-28 space-y-16 mt-10">
        <div class="flex w-full justify-between items-center pr-52 pl-52">
            <VueApexCharts type="radialBar" :options="sphChart" :series="seriesData" height="350" />
            <VueApexCharts type="radialBar" :options="secChart" :series="seriesData" height="350" />
        </div>
    </div>

    <div class="h-full w-full pr-28 pl-28 space-y-16 mt-10">
        <div class="flex w-full justify-between items-center pr-52 pl-52">
            <VueApexCharts type="radialBar" :options="snChart" :series="seriesData" height="350" />
            <VueApexCharts type="radialBar" :options="spChart" :series="seriesData" height="350" />
        </div>
    </div>

    <div class="h-full w-full pr-28 pl-28 space-y-16 mt-10">
        <div class="flex w-full justify-between items-center pr-52 pl-52">
            <VueApexCharts type="radialBar" :options="skChart" :series="seriesData" height="350" />
            <VueApexCharts type="radialBar" :options="windChart" :series="seriesData" height="350" />
        </div>
    </div>
</template>

<style scoped>
.chart-container {
  max-width: 300px;
  /* margin: auto; */
}
</style>
