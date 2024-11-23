<script setup>
    import VueApexCharts from 'vue3-apexcharts';
    import { ref, onMounted } from 'vue';
    import { initializeApp } from 'firebase/app';
    import { getFirestore, collection, getDocs } from 'firebase/firestore';

    definePageMeta({
        layout: "defaultadmin"
    });

    // Firebase configuration
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

    // Refs สำหรับเก็บข้อมูลผู้ใช้
    const usersData = ref([]);

    // ฟังก์ชันดึงข้อมูลจาก Firestore
    const fetchUserData = async () => {
        const querySnapshot = await getDocs(collection(db, "users"));
        usersData.value = querySnapshot.docs.map(doc => ({
            placeNo: doc.data().placeNo || '-',
            placeName: doc.data().placeName || '-',
            firstName: doc.data().firstName || '-',
            poles: doc.data().poles || '-',
            status: 'Good',
            userpage: `${doc.data().firstName || '-'} Page`
        }));
    };

    // ดึงข้อมูลเมื่อคอมโพเนนต์ถูก mount
    onMounted(() => {
        fetchUserData();
    });

    // กำหนดข้อมูลสำหรับแผนภูมิแบบ bar
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
        xaxis: {
            categories: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
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

    // series สำหรับข้อมูลต่าง ๆ
    const seriesData = ref([
        {
            name: 'Temperature',
            data: [20] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Soil Temp',
            data: [5] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Humidity',
            data: [40] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Soil Humidity',
            data: [10] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Nitrogen',
            data: [100] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Phosporus',
            data: [63] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Potassuim',
            data: [75] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'PH',
            data: [50] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Electric',
            data: [20] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Lux',
            data: [10] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Pressure',
            data: [15] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        },
        {
            name: 'Wind',
            data: [80] // จะถูกอัปเดตด้วยข้อมูลจาก Google Sheet
        }
    ]);

    // กำหนดข้อมูลสำหรับแผนภูมิแบบ donut
    const chart7In1= ref({
        chart: {
            type: 'donut',
            height: 350
        },
        dataLabels: {
            enabled: true
        },
        labels: ['Temperature', 'Soil Temp', 'Humidity', 'Soil Humidity', 'Nitrogen', 'Phosporus', 'Potassium'],
        tooltip: {
            y: {
                formatter: function (val) {
                    return `${val} units`;
                }
            }
        }
    });

    // series สำหรับข้อมูลตัวอย่าง (สุ่มค่า)
    const SevenInOneData = ref([
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100)
    ]);
</script>

<template>
    <div class="w-full h-full bg-slate-100 flex flex-col space-y-5">
        <div class="flex">
            <div class="chart-container space-y-3">
                <h2 class="text-3xl md:text-2xl text-gray-700 font-bold mb-8">7 in 1 Errors</h2>
                <VueApexCharts type="donut" :options="chart7In1" :series="SevenInOneData" height="350" />
            </div>  
            <!-- Chart สำหรับข้อมูลต่าง ๆ -->
            <div class="chart-container space-y-3">
                <h2 class="text-3xl md:text-2xl text-gray-700 font-bold mb-8">Errors</h2>
                <VueApexCharts type="bar" :options="chartOptions" :series="seriesData" height="350" />
            </div>     
        </div>
        
        <div class="p-10">
            <h2 class="text-3xl font-bold mb-6 text-gray-700">User Table</h2>
                <div class="bg-white p-4 rounded-lg shadow-lg">
                    <table class="min-w-full border border-gray-800 border-collapse rounded-lg overflow-hidden shadow-md">
                        <thead>
                            <tr class="bg-gray-200">
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Place No</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Place Name</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">FirstName</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Pole</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">Status</th>
                                <th class="px-4 py-2 border border-gray-300 text-left text-gray-600 font-medium">UserPage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, index) in usersData" :key="index" class="bg-white hover:bg-gray-100">
                                <td class="px-4 py-2 border border-gray-300">{{ user.placeNo }}</td>
                                <td class="px-4 py-2 border border-gray-300">{{ user.placeName }}</td>
                                <td class="px-4 py-2 border border-gray-300">{{ user.firstName }}</td>
                                <td class="px-4 py-2 border border-gray-300">{{ user.poles }}</td>
                                <td class="px-4 py-2 border border-gray-300">{{ user.status }}</td>
                                <td class="px-4 py-2 border border-gray-300 cursor-pointer">{{ user.userpage}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
        </div>

    </div>
</template>
