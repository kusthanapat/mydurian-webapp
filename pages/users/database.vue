<script setup>
    import { useRoute } from 'vue-router';
    import { ref, onMounted, watch } from 'vue';
    import { initializeApp } from 'firebase/app';
    import { getFirestore, doc, getDoc } from 'firebase/firestore';

    definePageMeta({
        layout: "defaultuser"
    });

    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
        authDomain: "checklogin-67a92.firebaseapp.com",
        projectId: "checklogin-67a92",
        storageBucket: "checklogin-67a92.appspot.com",
        messagingSenderId: "246538906966",
        appId: "1:246538906966:web:2e4399caaa96210df23af7",
        measurementId: "G-X3068LRCWT"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const route = useRoute();
    const uid = route.query.uid;

    console.log('User UID:', uid);

    const googleSheetURL = ref('');
    const dataOptions = ref([]);
    const selectedData = ref('');
    const usersData = ref([]);

    // Fetch Google Sheet URL from Firebase
    async function fetchGoogleSheetURL() {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                googleSheetURL.value = docSnap.data().googleSheet;
                console.log('Google Sheet URL:', googleSheetURL.value);
                selectData(); // Call data processing after URL is fetched
            } else {
                console.error('No such document!');
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    }

    // Populate data options and filter data by month/year
    function selectData() {
        if (!googleSheetURL.value) {
            console.error('Google Sheet URL is not set');
            return;
        }

        fetch(googleSheetURL.value)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data);

                if (Array.isArray(data) && data.length > 0) {
                    const availableMonths = [];
                    data.forEach(row => {
                        console.log('Row TimeStamp:', row.TimeStamp);

                        const date = new Date(row.TimeStamp);
                        if (isNaN(date.getTime())) {
                            console.error('Invalid Date:', row.TimeStamp);
                        } else {
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            const monthYear = `${month}-${year}`;

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
                    });

                    console.log('Data options:', dataOptions.value);
                }
            });
    }

    // Filter and display table data based on selected month/year
    function updateTableData(selectedValue, allData) {
        const [month, year] = selectedValue.split('-');
        usersData.value = allData.filter(row => {
            const date = new Date(row.TimeStamp);
            return date.getMonth() + 1 === parseInt(month) && date.getFullYear() === parseInt(year);
        });
    }

    // Watch for changes in selected data
    watch(selectedData, (newVal) => {
        if (newVal && googleSheetURL.value) {
            fetch(googleSheetURL.value)
                .then(response => response.json())
                .then(data => {
                    updateTableData(newVal, data);
                });
        }
    });

    // Simulate CSV download
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

    // Fetch the Google Sheet URL when the page is mounted
    onMounted(() => {
        fetchGoogleSheetURL();
    });
</script>

<template>
    <div class="h-full w-full pr-28 pl-28 space-y-16 pt-20">
        <!-- Dropdown for selecting data -->
        <div class="w-full flex space-x-14 items-baseline">
            <div class="w-2/5 flex space-x-6 items-baseline">
                <h2 class="text-3xl md:text-2xl text-white font-bold mb-8">Select Data:</h2>
                <select v-model="selectedData" class="w-1/2 h-2/4 px-4 py-3 rounded-lg bg-slate-200 text-gray-500 border border-none">
                    <option disabled value="">Select Data</option>
                    <option v-for="option in dataOptions" :key="option.value" :value="option.value">
                        {{ option.text }}
                    </option>
                </select>
            </div>
            <button @click="downloadCSV"
                class="px-4 py-1 w-1/6 h-2/3 bg-lime-500 text-white rounded-lg hover:bg-lime-400 transform hover:scale-105 transition-all shadow-lg hover:shadow-lime-500/30">
                Download Data
            </button>
        </div>

        <!-- Table for displaying data -->
        <div class="bg-white p-4 rounded-lg shadow-lg">
            <table class="min-w-full border border-gray-800 border-collapse rounded-lg overflow-hidden shadow-md">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Time</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Temp</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Humi</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Pressure</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Lux</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Foat</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Soil Temp</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Soil Humi</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">PH</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Soil EC</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">N</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">P</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">K</th>
                        <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Wind</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, index) in usersData" :key="index" class="bg-white hover:bg-gray-100">
                        <td class="px-4 py-2 border border-gray-300">{{ user.TimeStamp }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.Temperature }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.Humidity }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.Pressure }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.Lux }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.Foat }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.ST }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.SH }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.SPH }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.SEC }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.SN }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.SP }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.SK }}</td>
                        <td class="px-4 py-2 border border-gray-300">{{ user.Wind }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
/* Add your styles here */
</style>
