<script setup>
import { ref, onMounted } from 'vue';
import VueApexCharts from "vue3-apexcharts";

const app = ref(null);
const db = ref(null);
const dataOptions = ref([]);
const selectedData = ref("");
const seriesData = ref([]);
const googleSheetURL = ref('');
// const VueApexCharts = ref(null);

// Chart configurations
const createRadialBarConfig = (label, min = '', max = '', unit = '') => ({
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
                    fontSize: '22px',
                    color: '#ffffff',
                    formatter: function (val) {
                        let normalizedVal = ((val - 0) / (max - 0)) * 100;
                        return `${normalizedVal.toFixed(1)} ${unit}`;
                    }
                }
            }
        }
    },
    labels: [label],
});

const sphChart = ref({
   chart: {
       type: 'radialBar',
       height: 350,
   },
   plotOptions: {
       radialBar: {
           min: 0,
           max: 100,
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
                   fontSize: '22px',
                   color: '#ffffff',
                   formatter: function (val) {
                       return (val).toFixed(1);
                   }
               }
           }
       }
   },
   labels: ['PH'],
   series: [function(val) {
       return (val / 9) * 100;
   }]
});

const tempChart = ref(createRadialBarConfig('อุณหภูมิ', 0, 100, '°C'));
const humiChart = ref(createRadialBarConfig('ความชื้น', 0, 100, '%'));
const luxChart = ref(createRadialBarConfig('ความเข้มแสง', 0, 10000, 'lux'));
const pressureChart = ref(createRadialBarConfig('แรงดัน', 0, 1000, 'hPa'));
const stChart = ref(createRadialBarConfig('อุณหภูมิดิน', 0, 100, '°C'));
const shChart = ref(createRadialBarConfig('ความชื้นดิน', 0, 100, '%'));
// const sphChart = ref(createRadialBarConfig('PH', 3, 9, 'unit'));
const secChart = ref(createRadialBarConfig('ความเค็ม', 0, 2, ''));
const snChart = ref(createRadialBarConfig('ไนโตรเจน', 0, 100, '%'));
const spChart = ref(createRadialBarConfig('ฟอสฟอรัส', 0, 100, '%'));
const skChart = ref(createRadialBarConfig('โพแทสเซียม', 0, 100, '%'));
const windChart = ref(createRadialBarConfig('ความเร็วลม', 0, 100, 'km/hr'));

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

const columnMapping = {
    temperature: "อุณหภูมิ_c",
    soilTemperature: "อุณหภูมิดิน_c",
    humidity: "ความชื้น_เปอร์เซ็นต์",
    soilMoisture: "ความชื้นดิน_เปอร์เซ็นต์",
    pressure: "แรงดัน_hPa",
    lightIntensity: "ความเข้มแสง_lux",
    foat: "ลูกลอย",
    ph: "PH",
    salinity: "ความเค็ม_เปอร์เซ็นต์",
    nitrogen: "ไนโตรเจน_เปอร์เซ็นต์",
    phosphorus: "ฟอสฟอรัส_เปอร์เซ็นต์",
    potassium: "โพแทสเซียม_เปอร์เซ็นต์",
    windSpeed: "ความเร็วลม_กิโลเมตรต่อชั่วโมง"
};

const fetchDataAndCreateCharts = () => {
    if (!googleSheetURL.value) return;

    fetch(googleSheetURL.value)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const latestRow = data[data.length - 1];
                seriesData.value = [
                    parseFloat(latestRow[columnMapping.temperature]) || 0,
                    parseFloat(latestRow[columnMapping.soilTemperature]) || 0,
                    parseFloat(latestRow[columnMapping.humidity]) || 0,
                    parseFloat(latestRow[columnMapping.soilMoisture]) || 0,
                    parseFloat(latestRow[columnMapping.pressure]) || 0,
                    parseFloat(latestRow[columnMapping.lightIntensity]) || 0,
                    latestRow[columnMapping.foat],
                    parseFloat(latestRow[columnMapping.ph]) || 0,
                    parseFloat(latestRow[columnMapping.salinity]) || 0,
                    parseFloat(latestRow[columnMapping.nitrogen]) || 0,
                    parseFloat(latestRow[columnMapping.phosphorus]) || 0,
                    parseFloat(latestRow[columnMapping.potassium]) || 0,
                    parseFloat(latestRow[columnMapping.windSpeed]) || 0
                ];
            }
        })
        .catch(error => console.error('Error fetching data:', error));
};

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

        <ClientOnly>
            <template v-if="VueApexCharts">
                <div class="h-full w-full flex flex-col md:flex-row justify-between md:space-x-20 space-y-4 md:space-y-0 pr-6 md:pr-28 pl-6 md:pl-28 mt-10">
                    <div class="temperature flex flex-col w-full md:w-1/2 justify-between items-center bg-slate-500 bg-opacity-20 rounded-lg">
                        <div class="w-full flex justify-start pt-4 pl-6">
                            <p class="text-3xl md:text-3xl text-white font-bold mb-2">อุณหภูมิ</p>
                        </div>
                        <div class="flex justify-between items-center w-full">
                            <component :is="VueApexCharts" type="radialBar" :options="tempChart" :series="[seriesData[0]]" height="350" />
                            <component :is="VueApexCharts" type="radialBar" :options="stChart" :series="[seriesData[1]]" height="350" />
                        </div>
                    </div>

                    <div class="humidity flex flex-col w-full md:w-1/2 justify-between items-center bg-slate-500 bg-opacity-20 rounded-lg">
                        <div class="w-full flex justify-start pt-4 pl-6">
                            <p class="text-3xl md:text-3xl text-white font-bold mb-2">ความชื้น</p>
                        </div>
                        <div class="flex justify-between items-center w-full">
                            <component :is="VueApexCharts" type="radialBar" :options="humiChart" :series="[seriesData[2]]" height="350" />
                            <component :is="VueApexCharts" type="radialBar" :options="shChart" :series="[seriesData[3]]" height="350" />
                        </div>
                    </div>
                </div>

                <div class="flex flex-col w-10/12 justify-center items-center bg-slate-500 bg-opacity-20 rounded-lg">
                    <div class="w-full flex justify-start pt-4 pl-6">
                        <p class="text-3xl md:text-3xl text-white font-bold mb-2">ค่าในดิน</p>
                    </div>
                    <div class="flex justify-between items-center w-full">
                        <component :is="VueApexCharts" type="radialBar" :options="sphChart" :series="[seriesData[7]]" height="300" />
                        <component :is="VueApexCharts" type="radialBar" :options="snChart" :series="[seriesData[9]]" height="300" />
                        <component :is="VueApexCharts" type="radialBar" :options="spChart" :series="[seriesData[10]]" height="300" />
                        <component :is="VueApexCharts" type="radialBar" :options="skChart" :series="[seriesData[11]]" height="300" />
                    </div>
                </div>

                <div class="flex flex-col w-10/12 justify-center items-center bg-slate-500 bg-opacity-20 rounded-lg">
                    <div class="w-full flex justify-start pt-4 pl-6">
                        <p class="text-3xl md:text-3xl text-white font-bold mb-2">ค่าอื่นๆ</p>
                    </div>
                    <div class="flex justify-between items-center w-full">
                        <component :is="VueApexCharts" type="radialBar" :options="secChart" :series="[seriesData[8]]" height="300" />
                        <component :is="VueApexCharts" type="radialBar" :options="pressureChart" :series="[seriesData[4]]" height="300" />
                        <component :is="VueApexCharts" type="radialBar" :options="luxChart" :series="[seriesData[5]]" height="300" />
                        <component :is="VueApexCharts" type="radialBar" :options="windChart" :series="[seriesData[12]]" height="300" />
                    </div>
                </div>
            </template>
        </ClientOnly>
    </div>
</template>

<style scoped>
.chart-container {
  max-width: 300px;
}

/* Media query for small screens */
@media (min-width: 340px) and (max-width: 768px) {
    .flex {
    flex-direction: column; /* เปลี่ยนจาก row เป็น column */
    align-items: center; /* จัดให้อยู่ตรงกลาง */
    justify-content: center; /* จัดให้อยู่ตรงกลาง */
  }

  .space-x-20 {
    gap: 1rem; /* ปรับช่องว่างสำหรับ column */
  }

  .h-full {
    height: auto; /* ให้ปรับความสูงอัตโนมัติ */
  }

  .w-full {
    width: 100% !important; /* ใช้เต็มความกว้าง */
  }

  .pl-28, .pr-28 {
    padding-left: 1rem; /* ลด padding ซ้ายขวา */
    padding-right: 1rem;
  }

  .VueApexCharts {
    height: 250px; /* ลดขนาดของ radialBar */
    width: 90%; /* ให้ radialBar มีความกว้าง 90% */
  }

  .temperature, .humidity {
    width: 90% !important; /* ใช้เต็มความกว้าง */
    flex-direction: column; /* จัดให้อยู่ในแนว column */
    padding-left: 1rem; /* ลด padding ซ้าย */
    padding-right: 1rem; /* ลด padding ขวา */
    align-items: center; /* จัดให้อยู่ตรงกลาง */
    justify-content: center; /* จัดให้อยู่ตรงกลาง */
  }
}
</style>