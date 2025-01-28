<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

definePageMeta({
    layout: "defaultuser"
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const route = useRoute();
const uid = route.query.uid;

console.log('User UID:', uid);

const googleSheetURL = ref('');
const dataOptions = ref([]);
const selectedData = ref('');
const usersData = ref([]);

async function fetchGoogleSheetURL() {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            googleSheetURL.value = docSnap.data().googleSheet;
            console.log('Google Sheet URL:', googleSheetURL.value);
            await selectData();
            setLatestMonth();
        } else {
            console.error('No such document!');
        }
    } catch (error) {
        console.error('Error fetching document:', error);
    }
}

function selectData() {
    if (!googleSheetURL.value) {
        console.error('Google Sheet URL is not set');
        return;
    }

    return fetch(googleSheetURL.value)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data:', data);

            if (Array.isArray(data) && data.length > 0) {
                const availableMonths = [];
                data.forEach(row => {
                    console.log('Row TimeStamp:', row.TimeStamp);
                    
                    const [datePart] = row.TimeStamp.split(',');
                    const [month, day, year] = datePart.trim().split('/');
                    
                    const date = new Date(year, parseInt(month) - 1, day);
                    
                    if (isNaN(date.getTime())) {
                        console.error('Invalid Date:', row.TimeStamp);
                    } else {
                        const monthStr = String(date.getMonth() + 1).padStart(2, '0');
                        const yearStr = date.getFullYear();
                        const monthYear = `${monthStr}-${yearStr}`;

                        if (!availableMonths.includes(monthYear)) {
                            availableMonths.push(monthYear);
                        }
                    }
                });

                const monthNames = [
                    "ม.ค", "ก.พ", "มี.ค", "เม.ย", "พ.ค", "มิ.ย",
                    "ก.ค", "ส.ค", "ก.ย", "ต.ค", "พ.ย", "ธ.ค"
                ];
                dataOptions.value = availableMonths.map(monthYear => {
                    const [month, year] = monthYear.split('-');
                    return {
                        value: monthYear,
                        text: `${monthNames[parseInt(month) - 1]} ${year}`
                    };
                }).sort((a, b) => b.value.localeCompare(a.value));
            }
        });
}

function setLatestMonth() {
    if (dataOptions.value.length > 0) {
        selectedData.value = dataOptions.value[0].value;
    }
}

function updateTableData(selectedValue, allData) {
    const [month, year] = selectedValue.split('-');
    usersData.value = allData.filter(row => {
        const date = new Date(row.TimeStamp);
        return date.getMonth() + 1 === parseInt(month) && date.getFullYear() === parseInt(year);
    });
}

watch(selectedData, (newVal) => {
    if (newVal && googleSheetURL.value) {
        fetch(googleSheetURL.value)
            .then(response => response.json())
            .then(data => {
                updateTableData(newVal, data);
            });
    }
});

function downloadCSV() {
    const csvRows = [];
    const headers = Object.keys(usersData.value[0] || {}).join(',');
    csvRows.push(headers);

    usersData.value.forEach(user => {
        csvRows.push(Object.values(user).join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'data.csv');
    a.click();
}

onMounted(() => {
    fetchGoogleSheetURL();
});
</script>

<template>
    <div class="h-full w-full px-4 md:px-28 space-y-8 md:space-y-16 pt-10 md:pt-20">
        <div class="w-full flex flex-col md:flex-row md:space-x-14 space-y-4 md:space-y-0 items-baseline">
            <div class="w-full flex flex-col md:flex-row items-baseline gap-2 md:gap-4">
                <h2 class="text-xl md:text-3xl text-white font-bold mb-2 md:mb-8">เลือกข้อมูล:</h2>
                <select 
                    v-model="selectedData" 
                    class="w-full px-4 py-2 md:py-3 rounded-lg bg-slate-200 text-gray-500 border border-none text-base md:text-lg"
                >
                    <option v-for="option in dataOptions" :key="option.value" :value="option.value">
                        {{ option.text }}
                    </option>
                </select>
            </div>
            <button 
                @click="downloadCSV"
                class="w-full md:w-auto px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30"
            >
                ดาวน์โหลดข้อมูล
            </button>
        </div>

        <div class="table-container bg-white p-2 md:p-4 rounded-lg shadow-lg overflow-x-auto w-full md:w-[90%] mx-auto">
            <table class="custom-table min-w-full border border-gray-800 border-collapse rounded-lg overflow-hidden shadow-md">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">วันที่</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">อุณหภูมิ (°C)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">อุณหภูมิดิน (°C)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">ความชื้น (%)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">ความชื้นดิน (%)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">แรงดัน (hPa)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">ความเข้มแสง (lux)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">ลูกลอย</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">PH</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">ความเค็ม (%)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">ไนโตรเจน (%)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">ฟอสฟอรัส (%)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">โพแทสเซียม (%)</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">ความเร็วลม (km/hr)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, index) in usersData" :key="index" class="bg-white hover:bg-gray-100">
                        <td class="px-4 py-2 border border-gray-300">{{ user.TimeStamp }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.อุณหภูมิ_c }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.อุณหภูมิดิน_c }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.ความชื้น_เปอร์เซ็นต์ }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.ความชื้นดิน_เปอร์เซ็นต์ }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.แรงดัน_hPa }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.ความเข้มแสง_lux }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.ลูกลอย }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.PH }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.ความเค็ม_เปอร์เซ็นต์ }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.ไนโตรเจน_เปอร์เซ็นต์ }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.ฟอสฟอรัส_เปอร์เซ็นต์ }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.โพแทสเซียม_เปอร์เซ็นต์ }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.ความเร็วลม_กิโลเมตรต่อชั่วโมง }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.table-container {
    max-width: 100%;
    -webkit-overflow-scrolling: touch;
}

.custom-table {
    width: 100%;
    min-width: 1000px;
}

@media (max-width: 768px) {
    th, td {
        padding: 8px !important;
        font-size: 14px !important;
        white-space: nowrap;
    }

    select {
        width: 100% !important;
        min-width: 200px;
    }

    .table-container {
        margin: 0 !important;
        padding: 8px !important;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .table-container {
        width: 95% !important;
    }
}
</style>