<script setup>
import iconPath1 from '~/assets/images/user.png';
import iconPath2 from '~/assets/images/electric-pole.png';
import iconPath3 from '~/assets/images/crisis.png';
import iconPath4 from '~/assets/images/mark.png';
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
    authDomain: "checklogin-67a92.firebaseapp.com",
    projectId: "checklogin-67a92",
    storageBucket: "checklogin-67a92.appspot.com",
    messagingSenderId: "246538906966",
    appId: "1:246538906966:web:2e4399caaa96210df23af7",
    measurementId: "G-X3068LRCWT",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Emoji URLs
const happyface = 'https://www.robotoops.com/imagesMydurian/forindex/happy.png';
const neutralface = 'https://www.robotoops.com/imagesMydurian/forindex/neutral.png';
const sadface = 'https://www.robotoops.com/imagesMydurian/forindex/sad-face.png';

definePageMeta({
    layout: "defaultuser"
});

const route = useRoute();
const router = useRouter();
const uid = route.query.uid;
const warningCount = ref(0);
const errorCount = ref(0);
const googleSheetURL = ref('');

const Mapimages = ref('');
const Overallimages = 'https://www.robotoops.com/imagesMydurian/forindex/overall.jpg';
const pins = ref([]);
const poles = ref(1);
const isDragging = ref(null);
const mapPins = ref([]);
const tooltipId = ref(null);
  // Update tooltip style object
  const tooltipStyle = ref({
    position: 'absolute',
    top: '0',
    left: '0',
    transform: 'translate(-50%, -120%)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    zIndex: 1000,
    pointerEvents: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    minWidth: '200px'
  });
const mapImage = ref(null);
const firstName = ref('');
const adminPins = ref([]);

const navigateTo = (path) => {
    router.push({ path: path, query: { uid: uid } });
};

  // ปรับปรุงฟังก์ชัน getStatusEmoji ให้ส่งคืนทั้ง URL และสี
  const getStatusEmoji = (sensorData) => {
    if (!sensorData) return { url: happyface, color: '#23ff00' };  // สีเขียว

    // Temperature conditions
    if (sensorData.Temperature >= 40) return { url: sadface, color: '#ff0000' };  // สีแดง
    if (sensorData.Temperature >= 35) return { url: neutralface, color: '#fff300' };  // สีเหลือง

    // Humidity conditions
    if (sensorData.Humidity <= 60 || sensorData.Humidity >= 80) return { url: sadface, color: '#ff0000' };
    if (sensorData.Humidity <= 55 || sensorData.Humidity >= 75) return { url: neutralface, color: '#fff300' };

    // Soil Humidity conditions
    if (sensorData.SH <= 20 || sensorData.SH >= 40) return { url: sadface, color: '#ff0000' };
    if (sensorData.SH <= 25 || sensorData.SH >= 45) return { url: neutralface, color: '#fff300' };

    // Soil Temperature conditions
    if (sensorData.ST >= 35) return { url: sadface, color: '#ff0000' };
    if (sensorData.ST >= 30) return { url: neutralface, color: '#fff300' };

    // Soil pH conditions
    if (sensorData.SPH >= 8) return { url: sadface, color: '#ff0000' };
    if (sensorData.SPH >= 7) return { url: neutralface, color: '#fff300' };

    // Soil EC conditions
    if (sensorData.SEC >= 1.2) return { url: sadface, color: '#ff0000' };
    if (sensorData.SEC >= 1) return { url: neutralface, color: '#fff300' };

    // Soil Nutrients conditions
    const nutrients = ['SN', 'SP', 'SK'];
    for (const nutrient of nutrients) {
      if (sensorData[nutrient] >= 15) return { url: sadface, color: '#ff0000' };
      if (sensorData[nutrient] >= 12) return { url: neutralface, color: '#fff300' };
    }

    return { url: happyface, color: '#23ff00' };
  };


const checkAlerts = (data) => {
    let warnings = 0;
    let errors = 0;
    
    if (data.Temperature >= 40) errors++;
    else if (data.Temperature >= 35) warnings++;
    
    if (data.Humidity <= 60 || data.Humidity >= 80) errors++;
    else if (data.Humidity <= 55 || data.Humidity >= 75) warnings++;
    
    if (data.SH <= 20 || data.SH >= 40) errors++;
    else if (data.SH <= 25 || data.SH >= 45) warnings++;
    
    if (data.ST >= 35) errors++;
    else if (data.ST >= 30) warnings++;
    
    if (data.SPH >= 8) errors++;
    else if (data.SPH >= 7) warnings++;
    
    if (data.SEC >= 1.2) errors++;
    else if (data.SEC >= 1) warnings++;
    
    ['SN', 'SP', 'SK'].forEach(nutrient => {
        if (data[nutrient] >= 15) errors++;
        else if (data[nutrient] >= 12) warnings++;
    });
    
    warningCount.value = warnings;
    errorCount.value = errors;
};

  // แก้ไขฟังก์ชัน loadAdminPins
  const loadAdminPins = async () => {
    try {
      const usersRef = collection(db, 'users');
      const adminQuery = query(usersRef, where('status', '==', 'admin'));
      const querySnapshot = await getDocs(adminQuery);

      const pins = [];
      
      for (const adminDoc of querySnapshot.docs) {
        const adminData = adminDoc.data();
        
        const googleSheetUrl = adminData.googleSheet;
        
        let latestData = null;
        if (googleSheetUrl) {
          try {
            const response = await fetch(googleSheetUrl);
            const data = await response.json();
            latestData = data[data.length - 1];
          } catch (error) {
            console.error('Error fetching sheet data:', error);
          }
        }

        const fields = Object.keys(adminData);
        const coordinateFields = fields.filter(field => 
          field.startsWith('coordinate_x_') || field.startsWith('coordinate_y_')
        );

        const locations = new Set(
          coordinateFields.map(field => {
            const match = field.match(/coordinate_[xy]_(.+)/);
            return match ? match[1] : null;
          }).filter(Boolean)
        );

        for (const location of locations) {
          const [locationName, poleNumber] = location.split('_');
          const status = getStatusEmoji(latestData);
          pins.push({
            id: location,
            x: adminData[`coordinate_x_${location}`] || 50,
            y: adminData[`coordinate_y_${location}`] || 50,
            locationName: locationName,
            poleNumber: poleNumber,
            sensorData: latestData,
            statusEmoji: status.url,
            statusColor: status.color
          });
        }
      }

      adminPins.value = pins;
      console.log('Loaded admin pins:', adminPins.value);
    } catch (error) {
      console.error('Error loading admin pins:', error);
    }
  };

watch(poles, (newVal) => {
    const currentPins = pins.value;
    pins.value = Array.from({ length: newVal }, (_, i) => {
        return currentPins[i] || {
            id: i + 1,
            x: 50,
            y: 50
        };
    });
});

// const loadMapImage = async () => {
//     if (uid) {
//         try {
//             const userDocRef = doc(db, 'users', uid);
//             const userDocSnap = await getDoc(userDocRef);
            
//             if (userDocSnap.exists()) {
//                 const userData = userDocSnap.data();
//                 firstName.value = userData.firstName || "";
//                 Mapimages.value = userData.map || '';
//                 googleSheetURL.value = userData.googleSheet;
                
//                 const totalPoles = userData.poles || 1;
//                 pins.value = Array.from({ length: totalPoles }, (_, i) => {
//                     const pinId = i + 1;
//                     return {
//                         id: pinId,
//                         x: userData[`coordinate_x_p${pinId}`] || 50,
//                         y: userData[`coordinate_y_p${pinId}`] || 50
//                     };
//                 });

//                 if (googleSheetURL.value) {
//                     const response = await fetch(googleSheetURL.value);
//                     const data = await response.json();
                    
//                     if (Array.isArray(data) && data.length > 0) {
//                         const latestRow = data[data.length - 1];
//                         checkAlerts(latestRow);
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Error fetching document:', error);
//         }
//     }
// };

const loadMapImage = async () => {
    if (uid) {
        try {
            const userDocRef = doc(db, 'users', uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                firstName.value = userData.firstName || "";
                Mapimages.value = userData.map || '';
                googleSheetURL.value = userData.googleSheet;

                const totalPoles = userData.poles || 1;
                pins.value = Array.from({ length: totalPoles }, (_, i) => {
                    const pinId = i + 1;
                    return {
                        id: pinId,
                        x: userData[`coordinate_x_p${pinId}`] || 50,
                        y: userData[`coordinate_y_p${pinId}`] || 50,
                        placeName: userData[`placeName_p${pinId}`] || `Place ${pinId}`,
                        poles: userData[`poles_p${pinId}`] || 1,
                        sensorData: null, // Default empty until loaded
                        emoji: neutralface, // Default emoji
                    };
                });

                if (googleSheetURL.value) {
                    const response = await fetch(googleSheetURL.value);
                    const data = await response.json();

                    if (Array.isArray(data) && data.length > 0) {
                        const latestRow = data[data.length - 1];

                        pins.value.forEach((pin, i) => {
                            const sensorData = latestRow[`sensorData_p${pin.id}`]; // ดึงข้อมูลเซนเซอร์ตาม pin
                            pin.sensorData = sensorData;
                            const { url, color } = getStatusEmoji(sensorData);
                            pin.emoji = url;
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    }
};

  // แสดง tooltip
  const showTooltip = (pin) => {
    tooltipId.value = pin.id;
    tooltipStyle.value = {
      position: 'absolute',
      top: `${pin.y}%`,
      left: `${pin.x}%`,
      transform: 'translate(-50%, -120%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      zIndex: 1000,
      pointerEvents: 'none'
    };
  };

const hideTooltip = () => {
    tooltipId.value = null;
};

onMounted(() => {
    loadMapImage();
    loadAdminPins();
});
</script>

<template>
    <div class="h-full w-full pr-28 pl-28 space-y-16">
        <div class="flex justify-between items-center mt-20">
            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath1" alt="User Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">{{ firstName }}</p>
                </div>
            </div>

            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath2" alt="Pole Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">{{ poles }}</p>
                </div>
            </div>

            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath3" alt="Warning Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">{{ warningCount }}</p>
                </div>
            </div>

            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath4" alt="Error Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">{{ errorCount }}</p>
                </div>
            </div>
        </div>

        <div class="w-full flex justify-center items-center">
            <iframe src="https://www.tmd.go.th/weatherForecast7DaysWidget?province=นนทบุรี" 
                scrolling="no" 
                frameborder="0" 
                class="w-full h-96 bg-transparent rounded-lg">
            </iframe>
        </div>   

        <h2 class="text-2xl text-white font-bold mb-2 text-start">แผนที่ผู้ใช้งาน</h2>

        <div class="relative flex flex-col w-full h-96 overflow-hidden rounded-lg justify-center items-center">
            <img :src="Mapimages" alt="Map Image" class="w-full h-96 object-cover" />

            <!-- <div
                v-for="pin in pins"
                :key="pin.id"
                :style="{
                    position: 'absolute',
                    top: pin.y + '%',
                    left: pin.x + '%',
                    transform: 'translate(-50%, -50%)',
                    cursor: isDragging === pin.id ? 'grabbing' : 'grab',
                }"
                class="map-pin"
                @mousedown="(event) => startDragging(event, pin.id)"
                @mouseover="() => showTooltip(pin)"
                @mouseleave="hideTooltip"
            >
                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Map Pin" class="w-8 h-8" />
                
                <div v-if="tooltipId === pin.id" 
                    class="tooltip"
                    :style="tooltipStyle">
                    Pin {{ pin.id }} Position:
                    X: {{ pin.x.toFixed(1) }}%, 
                    Y: {{ pin.y.toFixed(1) }}%
                </div>
            </div> -->

            <div
            v-for="pin in pins"
            :key="pin.id"
            :style="{
                position: 'absolute',
                top: pin.y + '%',
                left: pin.x + '%',
                transform: 'translate(-50%, -50%)',
                cursor: isDragging === pin.id ? 'grabbing' : 'grab',
            }"
            class="map-pin"
            @mousedown="(event) => startDragging(event, pin.id)"
            @mouseover="() => showTooltip(pin)"
            @mouseleave="hideTooltip"
        >
            <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Map Pin" class="w-8 h-8" />

            <div v-if="tooltipId === pin.id" 
                class="tooltip bg-gray-200 text-black p-2 rounded shadow-lg"
                :style="tooltipStyle">
                <div>
                    <img :src="pin.emoji" alt="Emoji" class="inline-block w-6 h-6 mr-2" />
                    <strong>{{ pin.placeName }}</strong>
                </div>
                <div>Pole Count: {{ pin.poles }}</div>
                <div v-if="pin.sensorData">
                    <div>Temp: {{ pin.sensorData.Temperature }}°C</div>
                    <div>Humidity: {{ pin.sensorData.Humidity }}%</div>
                </div>
            </div>
        </div>
        </div>

        <h2 class="text-2xl text-white font-bold mb-2 text-start">ภาพรวม</h2>

        <div class="relative flex flex-col w-full h-1/6 overflow-hidden rounded-lg justify-center items-center">
            <img :src="Overallimages" alt="Map Image" class="w-full h-1/6 object-cover" />

            <div
                v-for="pin in adminPins"
                :key="pin.id"
                class="absolute cursor-pointer"
                :style="{
                    top: pin.y + '%',
                    left: pin.x + '%',
                    transform: 'translate(-50%, -50%)'
                }"
                @mouseover="() => showTooltip(pin)"
                @mouseleave="hideTooltip"
            >
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                    alt="Map Pin" 
                    class="w-8 h-8"
                />
                <!-- Updated Tooltip with Emoji -->
                <div 
                    v-if="tooltipId === pin.id"
                    class="tooltip"
                    :style="tooltipStyle"
                >
                    <div>Location: {{ pin.locationName }}</div>
                    <div class="flex items-center gap-2">
                        Pole: {{ pin.poleNumber }}
                        <img 
                            :src="pin.statusEmoji" 
                            alt="Status" 
                            class="w-5 h-5"
                            :style="{ filter: `drop-shadow(0 0 2px ${pin.statusColor})` }"
                        />
                    </div>
                    <!-- Show sensor data if available -->
                    <div v-if="pin.sensorData" class="text-xs mt-1">
                        <div>Temp: {{ pin.sensorData.Temperature }}°C</div>
                        <div>Humidity: {{ pin.sensorData.Humidity }}%</div>
                        <div>Soil Humidity: {{ pin.sensorData.SH }}%</div>
                        <div>Soil Temp: {{ pin.sensorData.ST }}°C</div>
                        <div>Soil pH: {{ pin.sensorData.SPH }}</div>
                        <div>Soil EC: {{ pin.sensorData.SEC }}</div>
                        <div>Soil N: {{ pin.sensorData.SN }}</div>
                        <div>Soil P: {{ pin.sensorData.SP }}</div>
                        <div>Soil K: {{ pin.sensorData.SK }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.relative {
    position: relative;
}
.overflow-hidden {
    overflow: hidden;
}
.absolute {
    position: absolute;
}
.transform {
    transform: translate(-50%, -50%);
}

.map-pin {
    position: absolute;
    cursor: pointer;
}

.tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 1000;
    transform: translate(-50%, -120%);
}

@media (min-width: 340px) and (max-width: 768px) {
    .pr-28, .pl-28 {
        padding-right: 16px;
        padding-left: 16px;
    }
    .w-56 {
        width: 45% !important;
    }
    .h-28 {
        height: 60px !important;
    }
    .text-xl {
        font-size: 1rem !important;
    }
    iframe {
        height: 250px !important;
    }
    .flex {
        flex-direction: column;
        align-items: start;
        margin-top: 10%;
    }
    .box_data {
        flex-direction: row;
        width: 100%;
    }
    img {
        width: 50px !important;
        height: 50px !important;
    }
}
</style>