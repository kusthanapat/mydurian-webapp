<script setup>
    import { useRoute } from 'vue-router';
    import { ref, onMounted } from 'vue';
    import { initializeApp } from 'firebase/app';
    import { getFirestore, doc, getDoc } from 'firebase/firestore';
    import { nextTick } from 'vue';
    onMounted(async () => {
        if (process.client) {
            const { default: VueApexCharts } = await import('vue3-apexcharts');
            app.component('apexchart', VueApexCharts); // ลงทะเบียน component
            showChart.value = true; // แสดง chart หลังจากโหลดเสร็จ
        }
    });

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
    })

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const route = useRoute();
    const uid = route.query.uid;

    const googleSheetURL = ref('');
    const currentDayOffset = ref(0);
    const displayDate = ref('');

    // กำหนดข้อมูลสำหรับแผนภูมิแบบเส้น
    const chartOptions = ref({
        chart: {
            type: 'line',
            height: 350
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: [], // จะถูกอัปเดตด้วย labels จาก Google Sheet
            labels: {
                rotate: -45, // เอียง 45 องศา
                rotateAlways: true, // บังคับให้เอียงตลอดเวลา
            }
        },
        yaxis: {
            title: {
                text: 'Values'
            }
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return `${val} units`;
                }
            }
        }
    });

    // series สำหรับ Temperature และอื่นๆ
    const seriesDataTemp = ref([
        { name: 'Temperature', data: [] },
        { name: 'Soil Temp', data: [] }
    ]);
    const seriesDataHumi = ref([
        { name: 'Humidity', data: [] },
        { name: 'Soil Humidity', data: [] }
    ]);
    const seriesDataMatters = ref([
        { name: 'Nitrogen', data: [] },
        { name: 'Phosphorus', data: [] },
        { name: 'Potassium', data: [] }
    ]);
    const seriesDataPH = ref([{ name: 'PH', data: [] }]);
    const seriesDataSEC = ref([{ name: 'Electric', data: [] }]);
    const seriesDataOthers = ref([
        { name: 'Lux', data: [] },
        { name: 'Pressure', data: [] },
        { name: 'Wind', data: [] }
    ]);

    async function fetchGoogleSheetURL() {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                googleSheetURL.value = docSnap.data().googleSheet;
                console.log('Google Sheet URL:', googleSheetURL.value);
                fetchDataAndCreateCharts(); // ดึงข้อมูลเมื่อได้ URL
            } else {
                console.log('No such document!');
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    }

    function fetchDataAndCreateCharts() {
        fetch(googleSheetURL.value)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                let latestDate = new Date(data[data.length - 1].TimeStamp);
    
                // ฟิลเตอร์ข้อมูลให้แสดงเฉพาะวันปัจจุบัน
                let filteredData = data.filter(row => {
                    let rowDate = new Date(row.TimeStamp);
                    return rowDate.toDateString() === latestDate.toDateString(); // ใช้เปรียบเทียบด้วย toDateString()
                });
    
                if (filteredData.length > 0) {
                    displayDate.value = latestDate.toDateString();
                    // สร้างกราฟใหม่
                    seriesDataTemp.value[0].data = filteredData.map(row => row.Temperature ? parseFloat(row.Temperature).toFixed(1) : 0);
                    seriesDataTemp.value[1].data = filteredData.map(row => row.ST ? parseFloat(row.ST).toFixed(1) : 0);
                    seriesDataHumi.value[0].data = filteredData.map(row => row.Humidity ? parseFloat(row.Humidity).toFixed(1) : 0);
                    seriesDataHumi.value[1].data = filteredData.map(row => row.SH ? parseFloat(row.SH).toFixed(1) : 0);
                    seriesDataMatters.value[0].data = filteredData.map(row => row.SN ? parseFloat(row.SN).toFixed(1) : 0);
                    seriesDataMatters.value[1].data = filteredData.map(row => row.SP ? parseFloat(row.SP).toFixed(1) : 0);
                    seriesDataMatters.value[2].data = filteredData.map(row => row.SK ? parseFloat(row.SK).toFixed(1) : 0);
                    seriesDataPH.value[0].data = filteredData.map(row => row.SPH ? parseFloat(row.SPH).toFixed(1) : 0);
                    seriesDataSEC.value[0].data = filteredData.map(row => row.SEC ? parseFloat(row.SEC).toFixed(1) : 0);
                    seriesDataOthers.value[0].data = filteredData.map(row => row.Lux ? parseFloat(row.Lux).toFixed(1) : 0);
                    seriesDataOthers.value[1].data = filteredData.map(row => row.Pressure ? parseFloat(row.Pressure).toFixed(1) : 0);
                    seriesDataOthers.value[2].data = filteredData.map(row => row.Wind ? parseFloat(row.Wind).toFixed(1) : 0);

                    chartOptions.value.xaxis.categories = filteredData.map(row => {
                        let date = new Date(row.TimeStamp);
                        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    });

                    // อัปเดตเพื่อให้ Vue รู้ว่ามีการเปลี่ยนแปลง
                    chartOptions.value = { ...chartOptions.value };
                }
            }
        });
    }

    // ฟังก์ชันดึงข้อมูลย้อนหลัง 1 วัน
    function fetchDataAndCreateChartsByOffset(offset) {
        fetch(googleSheetURL.value)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                let latestDate = new Date(data[data.length - 1].TimeStamp);
                let targetDate = new Date(latestDate);
                targetDate.setDate(latestDate.getDate() - offset); // ย้อนกลับตาม offset
    
                let filteredData = data.filter(row => {
                    let rowDate = new Date(row.TimeStamp);
                    return rowDate.toDateString() === targetDate.toDateString(); // เปรียบเทียบวันที่
                });
    
                if (filteredData.length > 0) {
                    displayDate.value = latestDate.toDateString();
    
                    // สร้างกราฟใหม่
                    seriesDataTemp.value[0].data = filteredData.map(row => row.Temperature ? parseFloat(row.Temperature).toFixed(1) : 0);
                    seriesDataTemp.value[1].data = filteredData.map(row => row.ST ? parseFloat(row.ST).toFixed(1) : 0);
                    seriesDataHumi.value[0].data = filteredData.map(row => row.Humidity ? parseFloat(row.Humidity).toFixed(1) : 0);
                    seriesDataHumi.value[1].data = filteredData.map(row => row.SH ? parseFloat(row.SH).toFixed(1) : 0);
                    seriesDataMatters.value[0].data = filteredData.map(row => row.SN ? parseFloat(row.SN).toFixed(1) : 0);
                    seriesDataMatters.value[1].data = filteredData.map(row => row.SP ? parseFloat(row.SP).toFixed(1) : 0);
                    seriesDataMatters.value[2].data = filteredData.map(row => row.SK ? parseFloat(row.SK).toFixed(1) : 0);
                    seriesDataPH.value[0].data = filteredData.map(row => row.SPH ? parseFloat(row.SPH).toFixed(1) : 0);
                    seriesDataSEC.value[0].data = filteredData.map(row => row.SEC ? parseFloat(row.SEC).toFixed(1) : 0);
                    seriesDataOthers.value[0].data = filteredData.map(row => row.Lux ? parseFloat(row.Lux).toFixed(1) : 0);
                    seriesDataOthers.value[1].data = filteredData.map(row => row.Pressure ? parseFloat(row.Pressure).toFixed(1) : 0);
                    seriesDataOthers.value[2].data = filteredData.map(row => row.Wind ? parseFloat(row.Wind).toFixed(1) : 0);

                    chartOptions.value.xaxis.categories = filteredData.map(row => {
                        let date = new Date(row.TimeStamp);
                        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    });

                    // อัปเดตเพื่อให้ Vue รู้ว่ามีการเปลี่ยนแปลง
                    chartOptions.value = { ...chartOptions.value };
                }
            }
        });
    }

    // ฟังก์ชันดึงข้อมูลย้อนหลัง 7 วัน
    function fetchDataAndCreateCharts7days() {
        fetch(googleSheetURL.value)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                let latestDate = new Date(data[data.length - 1].TimeStamp);
    
                // ฟิลเตอร์ข้อมูลให้แสดงเฉพาะ 7 วันที่ผ่านมา
                let startDate = new Date(latestDate);
                startDate.setDate(latestDate.getDate() - 7); // ย้อนกลับ 7 วัน
    
                let filteredData = data.filter(row => {
                    let rowDate = new Date(row.TimeStamp);
                    return rowDate >= startDate && rowDate <= latestDate; // ตรวจสอบวันที่
                });
    
                if (filteredData.length > 0) {
                    displayDate.value = latestDate.toDateString();
    
                    // สร้างกราฟใหม่สำหรับข้อมูลย้อนหลัง 7 วัน
                    seriesDataTemp.value[0].data = filteredData.map(row => row.Temperature ? parseFloat(row.Temperature).toFixed(1) : 0);
                    seriesDataTemp.value[1].data = filteredData.map(row => row.ST ? parseFloat(row.ST).toFixed(1) : 0);
                    seriesDataHumi.value[0].data = filteredData.map(row => row.Humidity ? parseFloat(row.Humidity).toFixed(1) : 0);
                    seriesDataHumi.value[1].data = filteredData.map(row => row.SH ? parseFloat(row.SH).toFixed(1) : 0);
                    seriesDataMatters.value[0].data = filteredData.map(row => row.SN ? parseFloat(row.SN).toFixed(1) : 0);
                    seriesDataMatters.value[1].data = filteredData.map(row => row.SP ? parseFloat(row.SP).toFixed(1) : 0);
                    seriesDataMatters.value[2].data = filteredData.map(row => row.SK ? parseFloat(row.SK).toFixed(1) : 0);
                    seriesDataPH.value[0].data = filteredData.map(row => row.SPH ? parseFloat(row.SPH).toFixed(1) : 0);
                    seriesDataSEC.value[0].data = filteredData.map(row => row.SEC ? parseFloat(row.SEC).toFixed(1) : 0);
                    seriesDataOthers.value[0].data = filteredData.map(row => row.Lux ? parseFloat(row.Lux).toFixed(1) : 0);
                    seriesDataOthers.value[1].data = filteredData.map(row => row.Pressure ? parseFloat(row.Pressure).toFixed(1) : 0);
                    seriesDataOthers.value[2].data = filteredData.map(row => row.Wind ? parseFloat(row.Wind).toFixed(1) : 0);

                    chartOptions.value.xaxis.categories = filteredData.map(row => {
                        let date = new Date(row.TimeStamp);
                        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    });

                    // อัปเดตเพื่อให้ Vue รู้ว่ามีการเปลี่ยนแปลง
                    chartOptions.value = { ...chartOptions.value };
                }
            }
        });
    }

    // ฟังก์ชันดึงข้อมูลย้อนหลัง 30 วัน
    function fetchDataAndCreateCharts30Days() {
        fetch(googleSheetURL.value)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                let currentDate = new Date();
                let firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1); // วันแรกของเดือนที่แล้ว
                let lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0); // วันสุดท้ายของเดือนที่แล้ว

                // ดึงข้อมูลที่อยู่ในช่วงวันที่กำหนด
                let filteredData = data.filter(row => {
                    let rowDate = new Date(row.TimeStamp);
                    return rowDate >= firstDayOfLastMonth && rowDate <= lastDayOfLastMonth;
                });

                if (filteredData.length > 0) {
                    displayDate.value = latestDate.toDateString();

                    // สร้างกราฟใหม่สำหรับข้อมูลย้อนหลัง 30 วัน
                    seriesDataTemp.value[0].data = filteredData.map(row => row.Temperature ? parseFloat(row.Temperature).toFixed(1) : 0);
                    seriesDataTemp.value[1].data = filteredData.map(row => row.ST ? parseFloat(row.ST).toFixed(1) : 0);
                    seriesDataHumi.value[0].data = filteredData.map(row => row.Humidity ? parseFloat(row.Humidity).toFixed(1) : 0);
                    seriesDataHumi.value[1].data = filteredData.map(row => row.SH ? parseFloat(row.SH).toFixed(1) : 0);
                    seriesDataMatters.value[0].data = filteredData.map(row => row.SN ? parseFloat(row.SN).toFixed(1) : 0);
                    seriesDataMatters.value[1].data = filteredData.map(row => row.SP ? parseFloat(row.SP).toFixed(1) : 0);
                    seriesDataMatters.value[2].data = filteredData.map(row => row.SK ? parseFloat(row.SK).toFixed(1) : 0);
                    seriesDataPH.value[0].data = filteredData.map(row => row.SPH ? parseFloat(row.SPH).toFixed(1) : 0);
                    seriesDataSEC.value[0].data = filteredData.map(row => row.SEC ? parseFloat(row.SEC).toFixed(1) : 0);
                    seriesDataOthers.value[0].data = filteredData.map(row => row.Lux ? parseFloat(row.Lux).toFixed(1) : 0);
                    seriesDataOthers.value[1].data = filteredData.map(row => row.Pressure ? parseFloat(row.Pressure).toFixed(1) : 0);
                    seriesDataOthers.value[2].data = filteredData.map(row => row.Wind ? parseFloat(row.Wind).toFixed(1) : 0);

                    chartOptions.value.xaxis.categories = filteredData.map(row => {
                        let date = new Date(row.TimeStamp);
                        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    });

                    // อัปเดตเพื่อให้ Vue รู้ว่ามีการเปลี่ยนแปลง
                    chartOptions.value = { ...chartOptions.value };
                }
            }
        });
    }

    // ฟังก์ชันดึงข้อมูลเดือนปัจจุบันวัน
    function fetchDataAndCreateChartsCurrentMonth() {
        fetch(googleSheetURL.value)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                let currentDate = new Date();
                let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // วันแรกของเดือน
                let lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // วันสุดท้ายของเดือน

                // ดึงข้อมูลที่อยู่ในช่วงวันที่กำหนด
                let filteredData = data.filter(row => {
                    let rowDate = new Date(row.TimeStamp);
                    return rowDate >= firstDayOfMonth && rowDate <= lastDayOfMonth;
                });

                if (filteredData.length > 0) {
                    displayDate.value = latestDate.toDateString();

                    // สร้างกราฟใหม่สำหรับข้อมูลเดือนปัจจุบัน
                    seriesDataTemp.value[0].data = filteredData.map(row => row.Temperature ? parseFloat(row.Temperature).toFixed(1) : 0);
                    seriesDataTemp.value[1].data = filteredData.map(row => row.ST ? parseFloat(row.ST).toFixed(1) : 0);
                    seriesDataHumi.value[0].data = filteredData.map(row => row.Humidity ? parseFloat(row.Humidity).toFixed(1) : 0);
                    seriesDataHumi.value[1].data = filteredData.map(row => row.SH ? parseFloat(row.SH).toFixed(1) : 0);
                    seriesDataMatters.value[0].data = filteredData.map(row => row.SN ? parseFloat(row.SN).toFixed(1) : 0);
                    seriesDataMatters.value[1].data = filteredData.map(row => row.SP ? parseFloat(row.SP).toFixed(1) : 0);
                    seriesDataMatters.value[2].data = filteredData.map(row => row.SK ? parseFloat(row.SK).toFixed(1) : 0);
                    seriesDataPH.value[0].data = filteredData.map(row => row.SPH ? parseFloat(row.SPH).toFixed(1) : 0);
                    seriesDataSEC.value[0].data = filteredData.map(row => row.SEC ? parseFloat(row.SEC).toFixed(1) : 0);
                    seriesDataOthers.value[0].data = filteredData.map(row => row.Lux ? parseFloat(row.Lux).toFixed(1) : 0);
                    seriesDataOthers.value[1].data = filteredData.map(row => row.Pressure ? parseFloat(row.Pressure).toFixed(1) : 0);
                    seriesDataOthers.value[2].data = filteredData.map(row => row.Wind ? parseFloat(row.Wind).toFixed(1) : 0);

                    chartOptions.value.xaxis.categories = filteredData.map(row => {
                        let date = new Date(row.TimeStamp);
                        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    });

                    // อัปเดตเพื่อให้ Vue รู้ว่ามีการเปลี่ยนแปลง
                    chartOptions.value = { ...chartOptions.value };
                }
            }
        });
    }

    onMounted(() => {
        fetchGoogleSheetURL();
    });
</script>

<template>
    <div class="h-full w-full pr-28 pl-28 space-y-16 pt-20">
        <div class="flex space-x-5 items-baseline w-full justify-center">
                <button @click="fetchDataAndCreateChartsByOffset(currentDayOffset++)"
                    class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                    Previous Day
                </button>
                <button @click="fetchDataAndCreateCharts7days"
                    class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                    Previous Week
                </button>
                <button @click="fetchDataAndCreateCharts30Days"
                    class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                    Previous Month
                </button>
                <button @click="fetchDataAndCreateChartsCurrentMonth"
                    class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                    Current Month
                </button>
                <button @click="fetchDataAndCreateCharts"
                    class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                    Current Day
                </button>
                <button @click="currentDayOffset > 0 ? fetchDataAndCreateChartsByOffset(--currentDayOffset) : null"
                    class="px-4 py-1 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                    Next Day
                </button>
        </div>
        <!-- Chart สำหรับ Temperature และ Soil Temp -->
        <div class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">Temperature Chart</h2>
                <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
            </div>
            <VueApexCharts type="line" :options="chartOptions" :series="seriesDataTemp" height="350" />
        </div>

        <!-- Chart สำหรับ Humidity และ Soil Humidity -->
        <div class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">Humidity Chart</h2>
                <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
            </div>
            <VueApexCharts type="line" :options="chartOptions" :series="seriesDataHumi" height="350" />
        </div>

        <!-- Chart สำหรับ Soil Matters -->
        <div class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">Soil Matters Chart</h2>
                <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
            </div>
            <VueApexCharts type="line" :options="chartOptions" :series="seriesDataMatters" height="350" />
        </div>

        <!-- Chart สำหรับ PH -->
        <div class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">PH Chart</h2>
                <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
            </div>
            <VueApexCharts type="line" :options="chartOptions" :series="seriesDataPH" height="350" />
        </div>

        <!-- Chart สำหรับ SEC -->
        <div class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">Soil Electric Chart</h2>
                <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
            </div>
            <VueApexCharts type="line" :options="chartOptions" :series="seriesDataSEC" height="350" />
        </div>

        <!-- Chart Others -->
        <div class="chart-container space-y-5">
            <div class="flex space-x-5 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">Other Data Chart</h2>
                <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
            </div>
            <VueApexCharts type="line" :options="chartOptions" :series="seriesDataOthers" height="350" />
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    max-width: 1000px;
    margin: auto;
    display: flex;
    flex-direction: column;
}
</style>

