<script setup>
    // import ApexCharts from 'apexcharts'
    definePageMeta({
        layout: "defaultuser"
    })

    import VueApexCharts from 'vue3-apexcharts'
    import { ref, onMounted } from 'vue'

    definePageMeta({
    layout: "defaultuser"
    })

    // กำหนดข้อมูลสำหรับแผนภูมิ
    const chartOptions = ref({
    chart: {
        type: 'bar',
        height: 350
    },
    plotOptions: {
        bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
        },
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yaxis: {
        title: {
        text: 'Values'
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
        formatter: function (val) {
            return `${val} units`
        }
        }
    }
    })

    const seriesData = ref([
    {
        name: 'Series 1',
        data: [44, 55, 41, 64, 22, 43, 21, 49, 72, 60, 33, 57]
    },
    {
        name: 'Series 2',
        data: [53, 32, 33, 52, 13, 44, 32, 41, 56, 76, 38, 45]
    }
    ])
</script>

<template>
    <div class="h-full w-full pr-28 pl-28 space-y-16">
        <div class="chart-container">
            <VueApexCharts type="bar" :options="chartOptions" :series="seriesData" height="350" />
        </div>
    </div>
</template>

<style scoped>
.chart-container {
  max-width: 1000px;
  margin: auto;
}
</style>