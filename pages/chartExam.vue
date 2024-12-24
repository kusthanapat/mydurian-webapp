<script setup>
import { ref, onMounted } from 'vue';

const app = ref(null);
const db = ref(null);
const dataOptions = ref([]);
const selectedData = ref("");
const googleSheetURL = ref('');
const VueApexCharts = ref(null);
const displayDate = ref('');
const error = ref(null);

// Chart data series
const seriesDataTemp = ref([
    { name: 'Temperature', data: [] },
    { name: 'Soil Temperature', data: [] }
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
const seriesDataPH = ref([
    { name: 'PH', data: [] }
]);
const seriesDataSEC = ref([
    { name: 'Soil Electric', data: [] }
]);
const seriesDataOthers = ref([
    { name: 'Lux', data: [] },
    { name: 'Pressure', data: [] },
    { name: 'Wind', data: [] }
]);

// Chart configuration
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
        width: 2
    },
    markers: {
        size: 4
    },
    xaxis: {
        categories: []
    },
    yaxis: {
        labels: {
            style: {
                colors: '#fff'
            }
        }
    },
    theme: {
        mode: 'dark'
    }
});

onMounted(async () => {
    const { initializeApp } = await import("firebase/app");
    const { getFirestore } = await import("firebase/firestore");
    const { default: ApexCharts } = await import("vue3-apexcharts");
    VueApexCharts.value = ApexCharts;
    
    const firebaseConfig = {
        apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
        authDomain: "checklogin-67a92.firebaseapp.com",
        projectId: "checklogin-67a92",
        storageBucket: "checklogin-67a92.appspot.com",
        messagingSenderId: "246538906966",
        appId: "1:246538906966:web:2e4399caaa96210df23af7",
        measurementId: "G-X3068LRCWT",
    };

    app.value = initializeApp(firebaseConfig);
    db.value = getFirestore(app.value);
    await fetchUserList();
});

const fetchUserList = async () => {
    const { collection, getDocs } = await import("firebase/firestore");
    const querySnapshot = await getDocs(collection(db.value, "users"));
    dataOptions.value = querySnapshot.docs.map((doc) => ({
        text: doc.data().firstName,
        value: doc.id,
    }));
};

const fetchUserData = async (uid) => {
    const { doc, getDoc } = await import("firebase/firestore");
    try {
        const docRef = doc(db.value, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            googleSheetURL.value = docSnap.data().googleSheet;
            fetchDataAndCreateCharts();
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

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

    chartOptions.value = { ...chartOptions.value };
}

definePageMeta({
    layout: "default"
});
</script>

<template>
    <div class="flex flex-col justify-center items-center space-y-8 mt-14">
        <div class="flex space-x-10 p-2 w-3/4 items-center">
            <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">เลือกผู้ใช้งาน :</h2>
            <select
                v-model="selectedData"
                class="w-1/2 h-1/6 px-4 py-3 rounded-lg bg-slate-200 text-gray-500 border border-none"
                @change="fetchUserData(selectedData)"
            >
                <option disabled value="">เลือกผู้ใช้งาน</option>
                <option v-for="option in dataOptions" :key="option.value" :value="option.value">
                    {{ option.text }}
                </option>
            </select>
        </div>

        <div v-if="error" class="text-red-500 text-xl">{{ error }}</div>

        <ClientOnly>
            <div class="w-full px-6 md:px-28 space-y-8">
                <!-- Temperature Chart -->
                <div v-if="seriesDataTemp[0].data.length > 0" class="chart-container space-y-5">
                    <div class="flex space-x-5 items-baseline">
                        <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟอุณหภูมิ</h2>
                        <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
                    </div>
                    <apexchart type="line" :options="chartOptions" :series="seriesDataTemp" height="350" />
                </div>

                <!-- Humidity Chart -->
                <div v-if="seriesDataHumi[0].data.length > 0" class="chart-container space-y-5">
                    <div class="flex space-x-5 items-baseline">
                        <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟความชื้น</h2>
                        <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
                    </div>
                    <apexchart type="line" :options="chartOptions" :series="seriesDataHumi" height="350" />
                </div>

                <!-- Soil Matters Chart -->
                <div v-if="seriesDataMatters[0].data.length > 0" class="chart-container space-y-5">
                    <div class="flex space-x-5 items-baseline">
                        <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟค่าสารในดิน</h2>
                        <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
                    </div>
                    <apexchart type="line" :options="chartOptions" :series="seriesDataMatters" height="350" />
                </div>

                <!-- PH Chart -->
                <div v-if="seriesDataPH[0].data.length > 0" class="chart-container space-y-5">
                    <div class="flex space-x-5 items-baseline">
                        <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟค่า PH</h2>
                        <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
                    </div>
                    <apexchart type="line" :options="chartOptions" :series="seriesDataPH" height="350" />
                </div>

                <!-- SEC Chart -->
                <div v-if="seriesDataSEC[0].data.length > 0" class="chart-container space-y-5">
                    <div class="flex space-x-5 items-baseline">
                        <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟค่าความเค็ม</h2>
                        <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
                    </div>
                    <apexchart type="line" :options="chartOptions" :series="seriesDataSEC" height="350" />
                </div>

                <!-- Others Chart -->
                <div v-if="seriesDataOthers[0].data.length > 0" class="chart-container space-y-5">
                    <div class="flex space-x-5 items-baseline">
                        <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">กราฟค่าอื่นๆ</h2>
                        <p class="text-xl text-gray-300 leading-relaxed">Date: {{ displayDate }}</p>
                    </div>
                    <apexchart type="line" :options="chartOptions" :series="seriesDataOthers" height="350" />
                </div>

                <!-- Loading State -->
                <div v-if="!seriesDataTemp[0].data.length" class="flex justify-center items-center h-64">
                    <p class="text-white text-xl">Loading data...</p>
                </div>
            </div>
        </ClientOnly>
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