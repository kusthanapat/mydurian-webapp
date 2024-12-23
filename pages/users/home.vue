<script setup>
    // นำเข้าไอคอนรูปภาพ
    import iconPath1 from '~/assets/images/user.png';
    import iconPath2 from '~/assets/images/electric-pole.png';
    import iconPath3 from '~/assets/images/crisis.png';
    import iconPath4 from '~/assets/images/mark.png';

    // นำเข้า Vue composables
    import { useRoute, useRouter } from 'vue-router';
    import { ref, onMounted, watch } from 'vue';

    // นำเข้า Firebase
    import { initializeApp } from 'firebase/app';
    import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

    // ตั้งค่า Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBD1lpwftzNmjzPE7_Jw2M6wFz_edz6qX4",
        authDomain: "checklogin-67a92.firebaseapp.com",
        projectId: "checklogin-67a92",
        storageBucket: "checklogin-67a92.appspot.com",
        messagingSenderId: "246538906966",
        appId: "1:246538906966:web:2e4399caaa96210df23af7",
        measurementId: "G-X3068LRCWT",
    };

    // Initialize Firebase และ Firestore
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Meta layout
    definePageMeta({
        layout: "defaultuser"
    });

    // ใช้ route และ router
    const route = useRoute();
    const router = useRouter();

    // ดึง UID จาก query parameter
    const uid = route.query.uid;
    console.log('User UID:', uid);

    // ฟังก์ชันนำทางไปหน้าอื่น พร้อม UID
    const navigateTo = (path) => {
        router.push({ path: path, query: { uid: uid } });
    };

    // State สำหรับเก็บรูปภาพแผนที่
    const Mapimages = ref('');
    const Overallimages = 'https://www.robotoops.com/imagesMydurian/forindex/overall.jpg';

    const pins = ref([]); // Map pins
    const poles = ref(1); // จำนวน pins (รับจาก Firestore)
    const isDragging = ref(null); // ตรวจสอบว่ากำลังลาก pin ไหน
    const mapPins = ref([]);
    const tooltipId = ref(null); // ID ของ tooltip ที่แสดง
    const tooltipStyle = ref({}); // Style ของ tooltip
    const mapImage = ref(null); // อ้างอิง map element

    const firstName = ref('');

    // State สำหรับ admin pins
    const adminPins = ref([]);

    // โหลด admin pins
    const loadAdminPins = async () => {
        try {
            const usersRef = collection(db, 'users');
            const adminQuery = query(usersRef, where('status', '==', 'admin'));
            const querySnapshot = await getDocs(adminQuery);

            const pins = [];
            
            for (const adminDoc of querySnapshot.docs) {
                const adminData = adminDoc.data();
                const fields = Object.keys(adminData);
                
                // หา coordinate fields
                const coordinateFields = fields.filter(field => 
                    field.startsWith('coordinate_x_') || field.startsWith('coordinate_y_')
                );

                // จัดกลุ่มพิกัดตามชื่อสถานที่
                const locations = new Set(
                    coordinateFields.map(field => {
                        const match = field.match(/coordinate_[xy]_(.+)/);
                        return match ? match[1] : null;
                    }).filter(Boolean)
                );

                // สร้าง pin objects
                for (const location of locations) {
                    const [locationName, poleNumber] = location.split('_');
                    pins.push({
                        id: location,
                        x: adminData[`coordinate_x_${location}`] || 50,
                        y: adminData[`coordinate_y_${location}`] || 50,
                        locationName: locationName,
                        poleNumber: poleNumber
                    });
                }
            }

            adminPins.value = pins;
            console.log('Loaded admin pins:', adminPins.value);
        } catch (error) {
            console.error('Error loading admin pins:', error);
        }
    };

    // อัปเดต pins ตามจำนวน poles
    watch(poles, (newVal) => {
        // อัปเดต pins ตามจำนวน poles ที่เปลี่ยน
        const currentPins = pins.value;
        pins.value = Array.from({ length: newVal }, (_, i) => {
            // ใช้ค่าพิกัดเดิมถ้ามี หรือใช้ค่าเริ่มต้นถ้าเป็น pin ใหม่
            return currentPins[i] || {
                id: i + 1,
                x: 50,
                y: 50
            };
        });
    });

    // โหลดข้อมูลจาก Firestore
    const loadMapImage = async () => {
        if (uid) {
            console.log('Loading data for UID:', uid);
            try {
                const userDocRef = doc(db, 'users', uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    console.log('Firebase data:', userData);
                    
                    firstName.value = userData.firstName || "";
                    
                    Mapimages.value = userData.map || '';
                    console.log('Mapimages value:', Mapimages.value);
                    
                    const totalPoles = userData.poles || 1;
                    pins.value = Array.from({ length: totalPoles }, (_, i) => {
                        const pinId = i + 1;
                        return {
                            id: pinId,
                            x: userData[`coordinate_x_p${pinId}`] || 50,
                            y: userData[`coordinate_y_p${pinId}`] || 50
                        };
                    });
                    console.log('Updated pins:', pins.value);
                } else {
                    console.log('Document not found for UID:', uid);
                }
            } catch (error) {
                console.error('Error fetching document:', error);
            }
        } else {
            console.log('No UID provided');
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

    // ซ่อน tooltip
    const hideTooltip = () => {
        tooltipId.value = null;
    };

    // โหลดข้อมูลเมื่อ component ถูก mount
    onMounted(() => {
        loadMapImage();
        loadAdminPins();
    });
</script>

<template>
    <div class="h-full w-full pr-28 pl-28 space-y-16">
        <!-- top show -->
        <div class="flex justify-between items-center mt-20">
            <!-- user -->
            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath1" alt="User Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">{{ firstName }}</p>
                </div>
            </div>

            <!-- pole -->
            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath2" alt="Pole Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">{{ poles }}</p>
                </div>
            </div>

            <!-- warning -->
            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath3" alt="Warning Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">Warning</p>
                </div>
            </div>

            <!-- error -->
            <div class="box_data flex flex-row space-x-6 w-56 h-28 bg-slate-500 bg-opacity-20 justify-center items-center rounded-lg">
                <img :src="iconPath4" alt="Error Icon" class="w-20 h-20" />
                <div class="flex flex-col items-center justify-center">
                    <p class="text-white text-xl">Error</p>
                </div>
            </div>
        </div>

        <!-- weather iframe -->
        <div class="w-full flex justify-center items-center">
            <iframe src="https://www.tmd.go.th/weatherForecast7DaysWidget?province=นนทบุรี" 
                scrolling="no" 
                frameborder="0" 
                class="w-full h-96 bg-transparent rounded-lg">
            </iframe>
        </div>   

        <h2 class="text-2xl text-white font-bold mb-2 text-start">User Map</h2>

        <!-- google map iframe -->
        <div class="relative flex flex-col w-full h-96 overflow-hidden rounded-lg justify-center items-center">
            <!-- Map Image -->
            <img :src="Mapimages" alt="Map Image" class="w-full h-96 object-cover" />

            <!-- Map Pin Icon -->
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
                
                <!-- tooltip -->
                <div v-if="tooltipId === pin.id" 
                    class="tooltip"
                    :style="tooltipStyle">
                    Pin {{ pin.id }} Position:
                    X: {{ pin.x.toFixed(1) }}%, 
                    Y: {{ pin.y.toFixed(1) }}%
                </div>
            </div>
        </div>

        <h2 class="text-2xl text-white font-bold mb-2 text-start">Overall</h2>

        <!-- google map iframe overall -->
        <div class="relative flex flex-col w-full h-1/6 overflow-hidden rounded-lg justify-center items-center">
            <!-- Map Image -->
            <img :src="Overallimages" alt="Map Image" class="w-full h-1/6 object-cover" />

            <!-- Admin Map Pins -->
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
                <!-- Tooltip -->
                <div 
                    v-if="tooltipId === pin.id"
                    class="tooltip"
                    :style="tooltipStyle"
                >
                    <div>Location: {{ pin.locationName }}</div>
                    <div>Pole: {{ pin.poleNumber }}</div>
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

/* Responsive */
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