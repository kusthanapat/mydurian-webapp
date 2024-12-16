<script setup>
    import VueApexCharts from "vue3-apexcharts";
    import { useRoute } from 'vue-router';
    import { ref, onMounted } from 'vue';
    import { initializeApp } from 'firebase/app';
    import { getFirestore, doc, getDoc } from 'firebase/firestore';
    // onMounted(async () => {
    //     if (process.client) {
    //         const { default: VueApexCharts } = await import('vue3-apexcharts');
    //         app.component('apexchart', VueApexCharts); // ลงทะเบียน component
    //         showChart.value = true; // แสดง chart หลังจากโหลดเสร็จ
    //     }
    // });

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
    
    definePageMeta({
        layout: "defaultuser"
    })

    console.log('User UID:', uid);

    // ตัวแปรสำหรับเก็บข้อมูลซีรีส์ของกราฟ
    const seriesData = ref([]);
    const googleSheetURL = ref('');

    async function fetchGoogleSheetURL() {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                googleSheetURL.value = docSnap.data().googleSheet;
                console.log('Google Sheet URL:', googleSheetURL.value);
                fetchDataAndCreateCharts(); // เรียกฟังก์ชันดึงข้อมูลหลังจากได้ URL
            } else {
                console.log('No such document!');
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    }

    // ฟังก์ชันดึงข้อมูลจาก Google Sheets
    function fetchDataAndCreateCharts() {
        if (!googleSheetURL.value) {
            console.error('Google Sheet URL is not set');
            return;
        }

        fetch(googleSheetURL.value)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const latestRow = data[data.length - 1]; // ดึงแถวล่าสุด

                    // กำหนดค่าในแต่ละกราฟ
                    seriesData.value = [
                        parseFloat(latestRow.Temperature) || 0,
                        parseFloat(latestRow.Humidity) || 0,
                        parseFloat(latestRow.Lux) || 0,
                        parseFloat(latestRow.Pressure) || 0,
                        parseFloat(latestRow.ST) || 0,
                        parseFloat(latestRow.SH) || 0,
                        parseFloat(latestRow.SPH) || 0,
                        parseFloat(latestRow.SEC) || 0,
                        parseFloat(latestRow.SN) || 0,
                        parseFloat(latestRow.SP) || 0,
                        parseFloat(latestRow.SK) || 0,
                        parseFloat(latestRow.Wind) || 0
                    ];
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // เรียกใช้ฟังก์ชันเมื่อหน้าโหลด
    onMounted(() => {
        fetchGoogleSheetURL();
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 100;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 100;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 1000;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 10000;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 100;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 100;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 14;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 20000;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 1999;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 1999;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 1999;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
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
                            // แปลงค่า val ให้อยู่ในช่วงที่ต้องการ เช่น min = 0, max = 100
                            let min = 0;
                            let max = 100;
                            let normalizedVal = ((val - min) / (max - min)) * 100;
                            return `${normalizedVal.toFixed(1)}%`; // ปรับการแสดงผล
                        }
                    }
                }
            }
        },
        labels: ['Wind'],
    })
</script>

<template>
    <div class="flex flex-col justify-center items-center space-y-8">
        <div class="h-full w-full flex justify-between space-x-20 pr-28 pl-28 mt-20">
            <div class="temperature flex flex-col w-1/2 justify-between items-center bg-slate-500 bg-opacity-20 rounded-lg">
                <div class="w-full flex justify-start pt-4 pl-6">
                    <p class="text-3xl md:text-3xl text-white font-bold mb-2">Temperature</p>
                </div>
                <div class="flex justify-between items-center w-full">
                    <VueApexCharts type="radialBar" :options="tempChart" :series="[seriesData[0]]" height="350" />
                    <VueApexCharts type="radialBar" :options="stChart" :series="[seriesData[4]]" height="350" />
                </div>
            </div>

            <div class="humidity flex flex-col w-1/2 justify-between items-center bg-slate-500 bg-opacity-20 rounded-lg">
                <div class="w-full flex justify-start pt-4 pl-6">
                    <p class="text-3xl md:text-3xl text-white font-bold mb-2">Humidity</p>
                </div>
                <div class="flex justify-between items-center w-full">
                    <VueApexCharts type="radialBar" :options="humiChart" :series="[seriesData[1]]" height="350" />
                    <VueApexCharts type="radialBar" :options="shChart" :series="[seriesData[5]]" height="350" />
                </div>
            </div>
        </div>

        <div class="flex flex-col w-10/12 justify-center items-center bg-slate-500 bg-opacity-20 rounded-lg">
                <div class="w-full flex justify-start pt-4 pl-6">
                    <p class="text-3xl md:text-3xl text-white font-bold mb-2">Soil</p>
                </div>
                <div class="flex justify-between items-center w-full">
                    <VueApexCharts type="radialBar" :options="sphChart" :series="[seriesData[6]]" height="300" />
                    <VueApexCharts type="radialBar" :options="snChart" :series="[seriesData[8]]" height="300" />
                    <VueApexCharts type="radialBar" :options="spChart" :series="[seriesData[9]]" height="300" />
                    <VueApexCharts type="radialBar" :options="skChart" :series="[seriesData[10]]" height="300" />
                </div>
        </div>

        <div class="flex flex-col w-10/12 justify-center items-center bg-slate-500 bg-opacity-20 rounded-lg">
                <div class="w-full flex justify-start pt-4 pl-6">
                    <p class="text-3xl md:text-3xl text-white font-bold mb-2">Others</p>
                </div>
                <div class="flex justify-between items-center w-full">
                    <VueApexCharts type="radialBar" :options="secChart" :series="[seriesData[7]]" height="300" />
                    <VueApexCharts type="radialBar" :options="pressureChart" :series="[seriesData[3]]" height="300" />
                    <VueApexCharts type="radialBar" :options="luxChart" :series="[seriesData[2]]" height="300" />
                    <VueApexCharts type="radialBar" :options="windChart" :series="[seriesData[11]]" height="300" />
                </div>
        </div>
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
    width: 90%; /* เปลี่ยนความกว้างเป็น 90% */
    flex-direction: column; /* จัดให้อยู่ในแนว column */
    padding-left: 1rem; /* ลด padding ซ้าย */
    padding-right: 1rem; /* ลด padding ขวา */
    align-items: center; /* จัดให้อยู่ตรงกลาง */
    justify-content: center; /* จัดให้อยู่ตรงกลาง */
  }
}
</style>