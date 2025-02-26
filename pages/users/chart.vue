<script setup>
    import { ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import { initializeApp } from 'firebase/app';
    import { getFirestore, doc, getDoc } from 'firebase/firestore';
    import VueApexCharts from 'vue3-apexcharts';

    const firebaseConfig = {
        apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
        authDomain: "checklogin-67a92.firebaseapp.com",
        projectId: "checklogin-67a92",
        storageBucket: "checklogin-67a92.appspot.com",
        messagingSenderId: "246538906966",
        appId: "1:246538906966:web:2e4399caaa96210df23af7",
        measurementId: "G-X3068LRCWT"
    };

    definePageMeta({
        layout: "defaultuser"
    });

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const route = useRoute();
    const uid = route.query.uid;
    const error = ref(null);
    const showChart = ref(false);
    const googleSheetURL = ref('');
    const currentDayOffset = ref(0);
    const displayDate = ref('');

    // Chart Options
    const chartOptions = ref({
        chart: {
            type: 'line',
            height: 350,
            animations: {
                enabled: true
            },
            background: 'transparent'
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        colors: ['#00E396', '#008FFB', '#FEB019'],
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: [],
            labels: {
                rotate: -45,
                rotateAlways: true,
                style: {
                    colors: '#fff'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Values',
                style: {
                    color: '#fff'
                }
            },
            labels: {
                style: {
                    colors: '#fff'
                }
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (val) {
                    return `${val} units`;
                }
            }
        },
        grid: {
            borderColor: '#535A6C',
            xaxis: {
                lines: {
                    show: true
                }
            }
        }
    });

    // Series Data
    const seriesDataTemp = ref([
        { name: 'อุณหภูมิ', data: [] },
        { name: 'อุณหภูมิดิน', data: [] }
    ]);
    const seriesDataHumi = ref([
        { name: 'ความชื้น', data: [] },
        { name: 'ความชื้นดิน', data: [] }
    ]);
    const seriesDataMatters = ref([
        { name: 'ไนโตรเจน', data: [] },
        { name: 'ฟอสฟอรัส', data: [] },
        { name: 'โพแทสเซียม', data: [] }
    ]);
    const seriesDataPH = ref([{ name: 'PH', data: [] }]);
    const seriesDataSEC = ref([{ name: 'ความเค็ม', data: [] }]);
    const seriesDataOthers = ref([
        { name: 'ความเข้มแสง', data: [] },
        { name: 'แรงดัน', data: [] },
        { name: 'ความเร็วลม', data: [] }
    ]);

    async function fetchGoogleSheetURL() {
        try {
            error.value = null;
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                googleSheetURL.value = docSnap.data().googleSheet;
                console.log('Google Sheet URL:', googleSheetURL.value);
                await fetchDataAndCreateCharts();
                showChart.value = true;
            } else {
                error.value = 'No document found!';
                console.log('No such document!');
            }
        } catch (err) {
            error.value = `Error fetching document: ${err.message}`;
            console.error('Error fetching document:', err);
        }
    }

    async function fetchDataAndCreateCharts() {
        try {
            error.value = null;
            const response = await fetch(googleSheetURL.value);
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                let latestDate = new Date(data[data.length - 1].TimeStamp);
                let filteredData = data.filter(row => {
                    let rowDate = new Date(row.TimeStamp);
                    return rowDate.toDateString() === latestDate.toDateString();
                });

                if (filteredData.length > 0) {
                    updateChartData(filteredData, latestDate);
                } else {
                    error.value = 'No data found for the selected date range';
                }
            } else {
                error.value = 'Invalid data format or empty data';
            }
        } catch (err) {
            error.value = `Error fetching data: ${err.message}`;
            console.error('Error:', err);
        }
    }

    function updateChartData(filteredData, date) {
        displayDate.value = date.toDateString();

        // Update all series data
        seriesDataTemp.value[0].data = filteredData.map(row => row.อุณหภูมิ_c ? parseFloat(row.อุณหภูมิ_c).toFixed(1) : 0);
        seriesDataTemp.value[1].data = filteredData.map(row => row.อุณหภูมิดิน_c ? parseFloat(row.อุณหภูมิดิน_c).toFixed(1) : 0);
        seriesDataHumi.value[0].data = filteredData.map(row => row.ความชื้น_เปอร์เซ็นต์ ? parseFloat(row.ความชื้น_เปอร์เซ็นต์).toFixed(1) : 0);
        seriesDataHumi.value[1].data = filteredData.map(row => row.ความชื้นดิน_เปอร์เซ็นต์ ? parseFloat(row.ความชื้นดิน_เปอร์เซ็นต์).toFixed(1) : 0);
        seriesDataMatters.value[0].data = filteredData.map(row => row.ไนโตรเจน_เปอร์เซ็นต์ ? parseFloat(row.ไนโตรเจน_เปอร์เซ็นต์).toFixed(1) : 0);
        seriesDataMatters.value[1].data = filteredData.map(row => row.ฟอสฟอรัส_เปอร์เซ็นต์ ? parseFloat(row.ฟอสฟอรัส_เปอร์เซ็นต์).toFixed(1) : 0);
        seriesDataMatters.value[2].data = filteredData.map(row => row.โพแทสเซียม_เปอร์เซ็นต์ ? parseFloat(row.โพแทสเซียม_เปอร์เซ็นต์).toFixed(1) : 0);
        seriesDataPH.value[0].data = filteredData.map(row => row.PH ? parseFloat(row.PH).toFixed(1) : 0);
        seriesDataSEC.value[0].data = filteredData.map(row => row.ความเค็ม_เปอร์เซ็นต์ ? parseFloat(row.ความเค็ม_เปอร์เซ็นต์).toFixed(1) : 0);
        seriesDataOthers.value[0].data = filteredData.map(row => row.ความเข้มแสง_lux ? parseFloat(row.ความเข้มแสง_lux).toFixed(1) : 0);
        seriesDataOthers.value[1].data = filteredData.map(row => row.แรงดัน_hPa ? parseFloat(row.แรงดัน_hPa).toFixed(1) : 0);
        seriesDataOthers.value[2].data = filteredData.map(row => row.ความเร็วลม_กิโลเมตรต่อชั่วโมง ? parseFloat(row.ความเร็วลม_กิโลเมตรต่อชั่วโมง).toFixed(1) : 0);

        // Update x-axis categories
        chartOptions.value.xaxis.categories = filteredData.map(row => {
            let date = new Date(row.TimeStamp);
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        });

        // Force chart update
        chartOptions.value = { ...chartOptions.value };
    }

    async function fetchDataByDateRange(startDate, endDate) {
        try {
            const response = await fetch(googleSheetURL.value);
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                let filteredData = data.filter(row => {
                    let rowDate = new Date(row.TimeStamp);
                    return rowDate >= startDate && rowDate <= endDate;
                });

                if (filteredData.length > 0) {
                    updateChartData(filteredData, endDate);
                } else {
                    error.value = 'No data found for the selected date range';
                }
            }
        } catch (err) {
            error.value = `Error fetching data: ${err.message}`;
            console.error('Error:', err);
        }
    }

    function fetchDataAndCreateCharts7days() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        fetchDataByDateRange(startDate, endDate);
    }

    function fetchDataAndCreateCharts30Days() {
        const currentDate = new Date();
        const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        fetchDataByDateRange(firstDayOfLastMonth, lastDayOfLastMonth);
    }

    function fetchDataAndCreateChartsCurrentMonth() {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        fetchDataByDateRange(firstDayOfMonth, lastDayOfMonth);
    }

    function fetchDataAndCreateChartsByOffset(offset) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - offset);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        fetchDataByDateRange(startOfDay, endOfDay);
    }

    onMounted(async () => {
        await fetchGoogleSheetURL();
    });
</script>

<template>
    <div v-if="showChart" class="h-full w-full pr-28 pl-28 space-y-16 pt-20">
        <!-- Error Display -->
        <div v-if="error" class="bg-red-500 text-white p-4 rounded-lg mb-4">
            {{ error }}
        </div>

        <!-- Navigation Buttons -->
        <div class="button-container flex space-x-5 items-baseline w-full justify-center">
            <button @click="fetchDataAndCreateChartsByOffset(currentDayOffset++)"
                class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                วันก่อนหน้า
            </button>
            <button @click="fetchDataAndCreateCharts7days"
                class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                อาทิตย์ก่อนหน้า
            </button>
            <button @click="fetchDataAndCreateCharts30Days"
                class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                เดือนก่อนหน้า
            </button>
            <button @click="fetchDataAndCreateChartsCurrentMonth"
                class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                เดือนปัจจุบัน
            </button>
            <button @click="fetchDataAndCreateCharts"
                class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                วันปัจจุบัน
            </button>
            <button @click="currentDayOffset > 0 ? fetchDataAndCreateChartsByOffset(--currentDayOffset) : null"
                class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                วันถัดไป
            </button>
        </div>
        
        <!-- Chart สำหรับ Temperature และ Soil Temp -->
        <div v-if="seriesDataTemp[0].data.length > 0" class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟอุณหภูมิ</h2>
                <p class="text-xl text-gray-300 leading-relaxed">วันที่: {{ displayDate }}</p>
            </div>
            <client-only>
                <apexchart type="line" :options="chartOptions" :series="seriesDataTemp" height="350" />
            </client-only>
        </div>

        <!-- Chart สำหรับ Humidity และ Soil Humidity -->
        <div v-if="seriesDataHumi[0].data.length > 0" class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟความชื้น</h2>
                <p class="text-xl text-gray-300 leading-relaxed">วันที่: {{ displayDate }}</p>
            </div>
            <client-only>
                <apexchart type="line" :options="chartOptions" :series="seriesDataHumi" height="350" />
            </client-only>
        </div>

        <!-- Chart สำหรับ Soil Matters -->
        <div v-if="seriesDataMatters[0].data.length > 0" class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟค่าสารในดิน</h2>
                <p class="text-xl text-gray-300 leading-relaxed">วันที่: {{ displayDate }}</p>
            </div>
            <client-only>
                <apexchart type="line" :options="chartOptions" :series="seriesDataMatters" height="350" />
            </client-only>
        </div>

        <!-- Chart สำหรับ PH -->
        <div v-if="seriesDataPH[0].data.length > 0" class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟค่า PH</h2>
                <p class="text-xl text-gray-300 leading-relaxed">วันที่: {{ displayDate }}</p>
            </div>
            <client-only>
                <apexchart type="line" :options="chartOptions" :series="seriesDataPH" height="350" />
            </client-only>
        </div>

        <!-- Chart สำหรับ SEC -->
        <div v-if="seriesDataSEC[0].data.length > 0" class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟค่าความเค็ม</h2>
                <p class="text-xl text-gray-300 leading-relaxed">วันที่: {{ displayDate }}</p>
            </div>
            <client-only>
                <apexchart type="line" :options="chartOptions" :series="seriesDataSEC" height="350" />
            </client-only>
        </div>

        <!-- Chart Others -->
        <div v-if="seriesDataOthers[0].data.length > 0" class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟค่าอื่นๆ</h2>
                <p class="text-xl text-gray-300 leading-relaxed">วันที่: {{ displayDate }}</p>
            </div>
            <client-only>
                <apexchart type="line" :options="chartOptions" :series="seriesDataOthers" height="350" />
            </client-only>
        </div>

        <!-- Loading State -->
        <div v-else class="flex justify-center items-center h-64">
            <p class="text-white text-xl">Loading data...</p>
        </div>
    </div>

    <!-- Initial Loading State -->
    <div v-else class="h-full w-full flex justify-center items-center">
        <p class="text-white text-xl">Loading charts...</p>
    </div>
</template>

<style scoped>
    .chart-container {
        max-width: 1000px;
        margin: auto;
        display: flex;
        flex-direction: column;
    }

    .button-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px; /* ระยะห่างระหว่างปุ่ม */
    }

@media (max-width: 768px) and (min-width: 340px) {

    .button-container {
        display: grid; /* ใช้ Grid Layout */
        grid-template-columns: repeat(2, 1fr); /* 3 ปุ่มต่อแถว */
        gap: 10px; /* ระยะห่างระหว่างปุ่ม */
    }

    button {
        font-size: 0.9rem; /* ขนาดตัวหนังสือเล็กลง */
        padding: 8px; /* ลดขนาด padding */
    }

    .text-3xl {
        font-size: 1.5rem;
    }

    .text-xl {
        font-size: 1rem;
    }

    .chart-container {
        max-width: 90%;
    }

    .h-full {
        padding: 10px;
    }

    .pt-20 {
        padding-top: 10px;
    }

    .pr-28,
    .pl-28 {
        padding-left: 10px;
        padding-right: 10px;
    }
}
</style>